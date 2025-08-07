import { PrismaClient, TrailWaypoint } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema para criação de um waypoint
const waypointCreateSchema = z.object({
  name: z.string({ required_error: "Name is required." }),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  trailId: z.string().uuid({ message: "Invalid Trail ID." }),
  order: z
    .number()
    .int()
    .positive({ message: "Order must be a positive integer." }),
});

// Schema para atualização (apenas nome, descrição e imagem)
const waypointUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type WaypointCreateData = z.infer<typeof waypointCreateSchema>;
export type WaypointUpdateData = z.infer<typeof waypointUpdateSchema>;

// Define um tipo para o waypoint que inclui a coordenada
export type TrailWaypointWithCoordinate = TrailWaypoint & {
  coordinate: {
    id: string;
    latitude: number;
    longitude: number;
    order: number;
  };
};

export class TrailWaypointService {
  // O método de criação agora associa um waypoint a uma coordenada existente
  async create(data: WaypointCreateData): Promise<TrailWaypoint> {
    const { trailId, order, ...waypointData } =
      waypointCreateSchema.parse(data);

    // 1. Encontrar a coordenada com base em trailId e order
    const coordinate = await prisma.trailCoordinate.findFirst({
      where: {
        trailId,
        order,
      },
    });

    // 2. Se a coordenada não existir, lançar um erro
    if (!coordinate) {
      throw new Error(
        `Coordinate with order ${order} not found for this trail.`
      );
    }

    // 3. Criar o waypoint, associando o coordinateId encontrado
    return prisma.trailWaypoint.create({
      data: {
        ...waypointData,
        trailId,
        coordinateId: coordinate.id,
      },
    });
  }

  // Ao listar, inclui os dados da coordenada (latitude, longitude, order)
  async listByTrail(trailId: string): Promise<TrailWaypointWithCoordinate[]> {
    return prisma.trailWaypoint.findMany({
      where: { trailId },
      include: {
        coordinate: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            order: true,
          },
        },
      },
    });
  }

  // Ao buscar um waypoint específico, também inclui os dados da coordenada
  async get(id: string): Promise<TrailWaypointWithCoordinate | null> {
    return prisma.trailWaypoint.findUnique({
      where: { id },
      include: {
        coordinate: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            order: true,
          },
        },
      },
    });
  }

  // A atualização foca apenas nos dados do waypoint, não na sua posição
  async update(id: string, data: WaypointUpdateData): Promise<TrailWaypoint> {
    const parsedData = waypointUpdateSchema.parse(data);
    return prisma.trailWaypoint.update({
      where: { id },
      data: parsedData,
    });
  }

  async delete(id: string): Promise<TrailWaypoint> {
    return prisma.trailWaypoint.delete({
      where: { id },
    });
  }
}
