import { PrismaClient, Trail } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const trailCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  distance: z.number(),
  difficulty: z.enum(["FACIL", "MEDIO", "DIFICIL"]),
  estimatedTime: z.number().int(),
  imageUrl: z.string().url().optional(),
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
        latitude: z.number(),
        longitude: z.number(),
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

    return prisma.trail.create({
      data: {
        ...trailData,
        coordinates: {
          create: coordinates,
        },
        waypoints: {
          create: waypoints,
        },
      },
      include: {
        coordinates: true,
        waypoints: true,
      },
    });
  }

  async list(): Promise<Trail[]> {
    return prisma.trail.findMany({
      include: {
        coordinates: true,
        waypoints: true,
      },
    });
  }

  async get(id: string): Promise<Trail | null> {
    return prisma.trail.findUnique({
      where: { id },
      include: {
        coordinates: true,
        waypoints: true,
      },
    });
  }

  async update(id: string, data: TrailUpdateData): Promise<Trail> {
    const { coordinates, waypoints, ...trailData } =
      trailUpdateSchema.parse(data);

    // TODO: Lidar com atualização/deleção/criação de coordenadas e waypoints de forma mais granular
    if (coordinates) {
      await prisma.trailCoordinate.deleteMany({ where: { trailId: id } });
    }
    if (waypoints) {
      await prisma.trailWaypoint.deleteMany({ where: { trailId: id } });
    }

    return prisma.trail.update({
      where: { id },
      data: {
        ...trailData,
        coordinates: coordinates ? { create: coordinates } : undefined,
        waypoints: waypoints ? { create: waypoints } : undefined,
      },
      include: {
        coordinates: true,
        waypoints: true,
      },
    });
  }

  async delete(id: string): Promise<Trail> {
    return prisma.trail.delete({
      where: { id },
    });
  }
}
