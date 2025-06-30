import { FastifyRequest, FastifyReply } from "fastify";
import {
  getEventsService,
  createEventService,
  CreateEventInput,
} from "./event.service";

// --- Controller para Listar Eventos ---
export async function getEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const events = await getEventsService();
    return reply.send({ events });
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return reply.status(500).send({ error: "Erro interno ao buscar eventos." });
  }
}

// --- Controller para Criar um Evento ---
export async function createEventHandler(
  request: FastifyRequest<{ Body: CreateEventInput }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;

  // 1. O Controller faz a verificação de AUTENTICAÇÃO e AUTORIZAÇÃO
  if (!auth || !auth.userId) {
    return reply.status(401).send({ error: "Não autorizado." });
  }

  if (auth.sessionClaims?.public_metadata?.role !== "admin") {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  // 2. Ele chama o serviço para executar a lógica de negócio
  try {
    const event = await createEventService(request.body);
    return reply.status(201).send({ event });
  } catch (error) {
    // Se o Zod no serviço falhar, o erro é capturado aqui
    console.error("Erro ao criar evento:", error);
    return reply
      .status(400)
      .send({ error: "Dados inválidos ou erro ao criar evento." });
  }
}
