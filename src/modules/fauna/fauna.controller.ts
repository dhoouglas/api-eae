import { FastifyRequest, FastifyReply } from "fastify";
import FaunaService from "./fauna.service";
import { z } from "zod";

const createFaunaSchema = z.object({
  name: z.string(),
  scientificName: z.string(),
  description: z.string(),
  habitat: z.string(),
  conservationStatus: z.string(),
  imageUrls: z
    .array(z.string().url())
    .min(1, { message: "É necessário enviar pelo menos uma imagem." })
    .max(3, { message: "É permitido enviar no máximo 3 imagens." }),
});

const updateFaunaSchema = createFaunaSchema.partial();

class FaunaController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply
        .status(403)
        .send({ error: "Acesso negado. Apenas administradores." });
    }
    try {
      const data = createFaunaSchema.parse(request.body);
      const fauna = await FaunaService.create(data);
      reply.code(201).send(fauna);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Dados inválidos.",
          issues: error.format(),
        });
      }
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const faunas = await FaunaService.findAll();
      reply.send(faunas);
    } catch (error) {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  async findOne(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const fauna = await FaunaService.findOne(id);
      if (!fauna) {
        return reply.code(404).send({ error: "Fauna not found" });
      }
      reply.send(fauna);
    } catch (error) {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply
        .status(403)
        .send({ error: "Acesso negado. Apenas administradores." });
    }
    try {
      const { id } = request.params as { id: string };
      const data = updateFaunaSchema.parse(request.body);
      const fauna = await FaunaService.update(id, data);
      reply.send(fauna);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Dados inválidos.",
          issues: error.format(),
        });
      }
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply
        .status(403)
        .send({ error: "Acesso negado. Apenas administradores." });
    }
    try {
      const { id } = request.params as { id: string };
      await FaunaService.remove(id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }
}

export default new FaunaController();
