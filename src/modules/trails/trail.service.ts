import { PrismaClient, Trail } from "@prisma/client";
import { z } from "zod";
import { deleteMultipleFilesFromR2 } from "../upload/upload.service";

const prisma = new PrismaClient();

const trailCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  distance: z.number(),
  difficulty: z.enum(["FACIL", "MEDIO", "DIFICIL"]),
  estimatedTime: z.number().int(),
  imageUrls: z.array(z.string().url()).min(1).max(3),
  status: z.enum(["ABERTA", "FECHADA", "MANUTENCAO"]).default("ABERTA"),
  type: z.enum(["CAMINHADA", "CICLISMO", "MISTA"]),
  elevationGain: z.number(),
  coordinates: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      order: z.number().int(),
    })
  ),
  waypoints: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        order: z.number().int(),
      })
    )
    .optional(),
});

const trailUpdateSchema = trailCreateSchema.partial();

export type TrailCreateData = z.infer<typeof trailCreateSchema>;
export type TrailUpdateData = z.infer<typeof trailUpdateSchema>;

export class TrailService {
  async create(data: TrailCreateData): Promise<Trail> {
    const { coordinates, waypoints, ...trailData } =
      trailCreateSchema.parse(data);

    return prisma.$transaction(async (tx) => {
      // 1. Criar a trilha principal
      const trail = await tx.trail.create({
        data: {
          ...trailData,
        },
      });

      // 2. Criar as coordenadas e mapeá-las pela ordem para fácil acesso
      const createdCoordinates = await Promise.all(
        coordinates.map((coord) =>
          tx.trailCoordinate.create({
            data: {
              ...coord,
              trailId: trail.id,
            },
          })
        )
      );

      const coordinatesByOrder = new Map(
        createdCoordinates.map((c) => [c.order, c])
      );

      // 3. Se houver waypoints, criá-los e associá-los às coordenadas
      if (waypoints && waypoints.length > 0) {
        await Promise.all(
          waypoints.map((wp) => {
            const coordinate = coordinatesByOrder.get(wp.order);
            if (!coordinate) {
              throw new Error(
                `Coordenada com ordem ${wp.order} não encontrada para o waypoint ${wp.name}.`
              );
            }
            return tx.trailWaypoint.create({
              data: {
                name: wp.name,
                description: wp.description,
                imageUrl: wp.imageUrl,
                trailId: trail.id,
                coordinateId: coordinate.id,
              },
            });
          })
        );
      }

      // 4. Retornar a trilha completa com todas as suas relações
      return tx.trail.findUniqueOrThrow({
        where: { id: trail.id },
        include: {
          coordinates: { orderBy: { order: "asc" } },
          waypoints: {
            orderBy: { coordinate: { order: "asc" } },
            include: { coordinate: true },
          },
        },
      });
    });
  }

  async list(): Promise<Trail[]> {
    return prisma.trail.findMany({
      include: {
        coordinates: { orderBy: { order: "asc" } },
        waypoints: {
          orderBy: { coordinate: { order: "asc" } },
          include: {
            coordinate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async get(id: string): Promise<Trail | null> {
    return prisma.trail.findUnique({
      where: { id },
      include: {
        coordinates: { orderBy: { order: "asc" } },
        waypoints: {
          orderBy: { coordinate: { order: "asc" } },
          include: {
            coordinate: true,
          },
        },
      },
    });
  }

  async update(id: string, data: TrailUpdateData): Promise<Trail> {
    const { coordinates, waypoints, ...trailData } =
      trailUpdateSchema.parse(data);

    return prisma.$transaction(async (tx) => {
      // 1. Atualizar os dados principais da trilha
      await tx.trail.update({
        where: { id },
        data: trailData,
      });

      // 2. Sincronizar coordenadas (Abordagem: deletar e recriar)
      if (coordinates) {
        // Deletar coordenadas antigas
        await tx.trailCoordinate.deleteMany({ where: { trailId: id } });
        // Criar novas coordenadas
        await Promise.all(
          coordinates.map((coord) =>
            tx.trailCoordinate.create({
              data: { ...coord, trailId: id },
            })
          )
        );
      }

      // 3. Sincronizar waypoints (Abordagem: deletar e recriar)
      if (waypoints) {
        // Deletar waypoints antigos
        await tx.trailWaypoint.deleteMany({ where: { trailId: id } });

        // Pegar as coordenadas recém-criadas ou as existentes
        const currentCoordinates = await tx.trailCoordinate.findMany({
          where: { trailId: id },
        });
        const coordinatesByOrder = new Map(
          currentCoordinates.map((c) => [c.order, c])
        );

        // Criar novos waypoints
        await Promise.all(
          waypoints.map((wp) => {
            const coordinate = coordinatesByOrder.get(wp.order);
            if (!coordinate) {
              throw new Error(
                `Coordenada com ordem ${wp.order} não encontrada para o waypoint ${wp.name} durante a atualização.`
              );
            }
            return tx.trailWaypoint.create({
              data: {
                name: wp.name,
                description: wp.description,
                imageUrl: wp.imageUrl,
                trailId: id,
                coordinateId: coordinate.id,
              },
            });
          })
        );
      }

      // 4. Retornar a trilha completa e atualizada
      return tx.trail.findUniqueOrThrow({
        where: { id },
        include: {
          coordinates: { orderBy: { order: "asc" } },
          waypoints: {
            orderBy: { coordinate: { order: "asc" } },
            include: { coordinate: true },
          },
        },
      });
    });
  }

  async delete(id: string): Promise<Trail> {
    return prisma.$transaction(async (tx) => {
      // 1. Buscar a trilha e seus waypoints para coletar as URLs das imagens
      const trailToDelete = await tx.trail.findUnique({
        where: { id },
        include: {
          waypoints: true,
        },
      });

      if (!trailToDelete) {
        throw new Error(`Trilha com ID ${id} não encontrada.`);
      }

      // 2. Coletar todas as URLs de imagem
      const imageUrls: string[] = [...trailToDelete.imageUrls];
      trailToDelete.waypoints.forEach((wp) => {
        if (wp.imageUrl) {
          imageUrls.push(wp.imageUrl);
        }
      });

      // 3. Extrair as chaves dos arquivos das URLs e deletar do R2
      if (imageUrls.length > 0) {
        const publicUrlBase = process.env.R2_PUBLIC_URL;
        if (!publicUrlBase) {
          throw new Error("A URL pública do R2 não está configurada no .env");
        }

        const fileKeys = imageUrls.map((url) =>
          url.replace(`${publicUrlBase}/`, "")
        );

        try {
          await deleteMultipleFilesFromR2(fileKeys);
        } catch (error) {
          console.error(
            `Erro ao deletar arquivos do R2 para a trilha ${id}.`,
            error
          );
          // Lançar o erro para reverter a transação
          throw new Error(
            `Falha ao deletar imagens do R2. A operação foi cancelada.`
          );
        }
      }

      // 4. Deletar a trilha do banco de dados (o schema cuida da cascata)
      const deletedTrail = await tx.trail.delete({
        where: { id },
      });

      return deletedTrail;
    });
  }
}
