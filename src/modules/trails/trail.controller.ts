import { FastifyRequest, FastifyReply } from "fastify";
import {
  TrailService,
  TrailCreateData,
  TrailUpdateData,
} from "./trail.service";

const trailService = new TrailService();

export class TrailController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
    try {
      const data = request.body as TrailCreateData;
      const trail = await trailService.create(data);
      return reply.status(201).send(trail);
    } catch (error) {
      return reply.status(400).send({ message: "Erro ao criar trilha", error });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const trails = await trailService.list();
      return reply.status(200).send(trails);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao listar trilhas", error });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const trail = await trailService.get(id);
      if (!trail) {
        return reply.status(404).send({ message: "Trilha não encontrada" });
      }
      return reply.status(200).send(trail);
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao buscar trilha", error });
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
      const data = request.body as TrailUpdateData;
      const trail = await trailService.update(id, data);
      return reply.status(200).send(trail);
    } catch (error) {
      return reply
        .status(400)
        .send({ message: "Erro ao atualizar trilha", error });
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
      await trailService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      return reply.status(404).send({
        message: "Erro ao deletar trilha, trilha não encontrada",
        error,
      });
    }
  }
}
