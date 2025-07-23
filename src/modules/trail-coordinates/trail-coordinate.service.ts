import { PrismaClient, TrailCoordinate } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const coordinateCreateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  order: z.number().int(),
  trailId: z.string().uuid(),
});

const coordinateUpdateSchema = coordinateCreateSchema.partial();

export type CoordinateCreateData = z.infer<typeof coordinateCreateSchema>;
export type CoordinateUpdateData = z.infer<typeof coordinateUpdateSchema>;

export class TrailCoordinateService {
  async create(data: CoordinateCreateData): Promise<TrailCoordinate> {
    const parsedData = coordinateCreateSchema.parse(data);
    return prisma.trailCoordinate.create({
      data: parsedData,
    });
  }

  async listByTrail(trailId: string): Promise<TrailCoordinate[]> {
    return prisma.trailCoordinate.findMany({
      where: { trailId },
      orderBy: { order: "asc" },
    });
  }

  async get(id: string): Promise<TrailCoordinate | null> {
    return prisma.trailCoordinate.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: CoordinateUpdateData
  ): Promise<TrailCoordinate> {
    const parsedData = coordinateUpdateSchema.parse(data);
    return prisma.trailCoordinate.update({
      where: { id },
      data: parsedData,
    });
  }

  async delete(id: string): Promise<TrailCoordinate> {
    return prisma.trailCoordinate.delete({
      where: { id },
    });
  }
}
