import { FastifyRequest, FastifyReply } from "fastify";
import {
  getEventsService,
  createEventService,
  CreateEventInput,
  getEventByIdService,
  updateEventService,
  deleteEventService,
  UpdateEventInput,
} from "./event.service";

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

export async function getEventByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const event = await getEventByIdService(request.params.id);
    return reply.send({ event });
  } catch (error) {
    return reply.status(404).send({ error: "Evento não encontrado." });
  }
}

export async function createEventHandler(
  request: FastifyRequest<{ Body: CreateEventInput }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;

  if (!auth || !auth.userId) {
    return reply.status(401).send({ error: "Não autorizado." });
  }

  if (auth.sessionClaims?.public_metadata?.role !== "admin") {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    const event = await createEventService(request.body);
    return reply.status(201).send({ event });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return reply
      .status(400)
      .send({ error: "Dados inválidos ou erro ao criar evento." });
  }
}

export async function updateEventHandler(
  request: FastifyRequest<{ Body: UpdateEventInput; Params: { id: string } }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;
  if (
    !auth ||
    !auth.userId ||
    auth.sessionClaims?.public_metadata?.role !== "admin"
  ) {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    const event = await updateEventService(request.params.id, request.body);
    return reply.send({ event });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return reply
      .status(400)
      .send({ error: "Não foi possível atualizar o evento." });
  }
}

export async function deleteEventHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;
  if (
    !auth ||
    !auth.userId ||
    auth.sessionClaims?.public_metadata?.role !== "admin"
  ) {
    return reply
      .status(403)
      .send({ error: "Acesso negado. Apenas administradores." });
  }

  try {
    await deleteEventService(request.params.id);
    return reply.status(204).send();
  } catch (error) {
    return reply.status(404).send({ error: "Evento não encontrado." });
  }
}
