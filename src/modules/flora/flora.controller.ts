import { FastifyRequest, FastifyReply } from "fastify";
import FloraService from "./flora.service";
import { z } from "zod";

const createFloraSchema = z.object({
  name: z.string(),
  scientificName: z.string(),
  description: z.string(),
  family: z.string(),
  conservationStatus: z.string(),
  imageUrls: z
    .array(z.string().url())
    .min(1, { message: "É necessário enviar pelo menos uma imagem." })
    .max(3, { message: "É permitido enviar no máximo 3 imagens." }),
});

class FloraController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (
      (request as any).auth?.sessionClaims?.public_metadata?.role !== "admin"
    ) {
      return reply
        .status(403)
        .send({ error: "Acesso negado. Apenas administradores." });
    }
    try {
      const data = createFloraSchema.parse(request.body);
      const flora = await FloraService.create(data);
      reply.code(201).send(flora);
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
      const floras = await FloraService.findAll();
      reply.send(floras);
    } catch (error) {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  async findOne(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const flora = await FloraService.findOne(id);
      if (!flora) {
        return reply.code(404).send({ error: "Flora not found" });
      }
      reply.send(flora);
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
      const flora = await FloraService.update(id, request.body as any);
      reply.send(flora);
    } catch (error) {
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
      await FloraService.remove(id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }
}

export default new FloraController();
