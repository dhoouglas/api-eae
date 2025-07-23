import { FastifyRequest, FastifyReply } from "fastify";
import {
  TrailCoordinateService,
  CoordinateCreateData,
  CoordinateUpdateData,
} from "./trail-coordinate.service";

const coordinateService = new TrailCoordinateService();

export class TrailCoordinateController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
    try {
      const { trailId } = request.params as { trailId: string };
      const data = { ...(request.body as CoordinateCreateData), trailId };
      const coordinate = await coordinateService.create(data);
      return reply.status(201).send(coordinate);
    } catch (error) {
      return reply
        .status(400)
        .send({ message: "Erro ao criar coordenada", error });
    }
  }

  async listByTrail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { trailId } = request.params as { trailId: string };
      const coordinates = await coordinateService.listByTrail(trailId);
      return reply.status(200).send(coordinates);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao listar coordenadas", error });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const coordinate = await coordinateService.get(id);
      if (!coordinate) {
        return reply.status(404).send({ message: "Coordenada não encontrada" });
      }
      return reply.status(200).send(coordinate);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao buscar coordenada", error });
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
      const data = request.body as CoordinateUpdateData;
      const coordinate = await coordinateService.update(id, data);
      return reply.status(200).send(coordinate);
    } catch (error) {
      return reply
        .status(400)
        .send({ message: "Erro ao atualizar coordenada", error });
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
      await coordinateService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      return reply
        .status(404)
        .send({ message: "Erro ao deletar coordenada", error });
    }
  }
}
