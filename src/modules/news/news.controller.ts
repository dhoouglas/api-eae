import { FastifyRequest, FastifyReply } from "fastify";
import {
  getLatestNewsService,
  createNewsPostService,
  updateNewsPostService,
  deleteNewsPostService,
  CreateNewsInput,
  UpdateNewsInput,
  getNewsPostByIdService,
} from "./news.service";

// GET
export async function getLatestNewsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const newsPosts = await getLatestNewsService();
    return reply.send({ news: newsPosts });
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return reply.status(500).send({ error: "Erro ao buscar notícias." });
  }
}

// GET BY ID
export async function getNewsPostByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const newsPost = await getNewsPostByIdService(request.params.id);
    return reply.send({ newsPost });
  } catch (error) {
    return reply.status(404).send({ error: "Notícia não encontrada." });
  }
}

// POST
export async function createNewsPostHandler(
  request: FastifyRequest<{ Body: CreateNewsInput }>,
  reply: FastifyReply
) {
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    const newsPost = await createNewsPostService(request.body);
    return reply.status(201).send({ newsPost });
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    return reply
      .status(400)
      .send({ error: "Dados inválidos para criar notícia." });
  }
}

// PUT
export async function updateNewsPostHandler(
  request: FastifyRequest<{ Body: UpdateNewsInput; Params: { id: string } }>,
  reply: FastifyReply
) {
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    const newsPost = await updateNewsPostService(
      request.params.id,
      request.body
    );
    return reply.send({ newsPost });
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return reply
      .status(400)
      .send({ error: "Não foi possível atualizar a notícia." });
  }
}

// DELETE
export async function deleteNewsPostHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    await deleteNewsPostService(request.params.id);
    return reply.status(204).send(); // 204 No Content é a resposta padrão para um delete bem-sucedido
  } catch (error) {
    console.error("Erro ao deletar notícia:", error);
    return reply
      .status(404)
      .send({ error: "Notícia não encontrada para deletar." });
  }
}
