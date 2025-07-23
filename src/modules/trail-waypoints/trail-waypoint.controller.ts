import { FastifyRequest, FastifyReply } from "fastify";
import {
  TrailWaypointService,
  WaypointCreateData,
  WaypointUpdateData,
} from "./trail-waypoint.service";

const waypointService = new TrailWaypointService();

export class TrailWaypointController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
    try {
      const { trailId } = request.params as { trailId: string };
      const data = { ...(request.body as WaypointCreateData), trailId };
      const waypoint = await waypointService.create(data);
      return reply.status(201).send(waypoint);
    } catch (error) {
      return reply
        .status(400)
        .send({ message: "Erro ao criar waypoint", error });
    }
  }

  async listByTrail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { trailId } = request.params as { trailId: string };
      const waypoints = await waypointService.listByTrail(trailId);
      return reply.status(200).send(waypoints);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao listar waypoints", error });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const waypoint = await waypointService.get(id);
      if (!waypoint) {
        return reply.status(404).send({ message: "Waypoint não encontrado" });
      }
      return reply.status(200).send(waypoint);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao buscar waypoint", error });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
    try {
      const { id } = request.params as { id: string };
      const data = request.body as WaypointUpdateData;
      const waypoint = await waypointService.update(id, data);
      return reply.status(200).send(waypoint);
    } catch (error) {
      return reply
        .status(400)
        .send({ message: "Erro ao atualizar waypoint", error });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
    try {
      const { id } = request.params as { id: string };
      await waypointService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      return reply
        .status(404)
        .send({ message: "Erro ao deletar waypoint", error });
    }
  }
}
