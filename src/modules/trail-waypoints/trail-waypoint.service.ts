import { PrismaClient, TrailWaypoint } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const waypointCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  latitude: z.number(),
  longitude: z.number(),
  trailId: z.string().uuid(),
});

const waypointUpdateSchema = waypointCreateSchema.partial();

export type WaypointCreateData = z.infer<typeof waypointCreateSchema>;
export type WaypointUpdateData = z.infer<typeof waypointUpdateSchema>;

export class TrailWaypointService {
  async create(data: WaypointCreateData): Promise<TrailWaypoint> {
    const parsedData = waypointCreateSchema.parse(data);
    return prisma.trailWaypoint.create({
      data: parsedData,
    });
  }

  async listByTrail(trailId: string): Promise<TrailWaypoint[]> {
    return prisma.trailWaypoint.findMany({
      where: { trailId },
    });
  }

  async get(id: string): Promise<TrailWaypoint | null> {
    return prisma.trailWaypoint.findUnique({
      where: { id },
    });
  }

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
