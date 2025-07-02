import { FastifyRequest, FastifyReply } from "fastify";
import {
  getEventsService,
  createEventService,
  CreateEventInput,
  getEventByIdService,
  updateEventService,
  deleteEventService,
  UpdateEventInput,
  upsertAttendanceService,
  RsvpInput,
  getAttendanceStatusService,
} from "./event.service";
import { findOrCreateUserService } from "../users/user.service";

export async function getEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const auth = (request as any).auth;
  let localUserId = null;
  if (auth && auth.userId) {
    const localUser = await findOrCreateUserService(auth.userId);
    localUserId = localUser.id;
  }
  const events = await getEventsService(localUserId);
  return reply.send({ events });
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
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply.status(403).send({ error: "Acesso negado." });
  }
  try {
    const event = await createEventService(request.body);
    return reply.status(201).send({ event });
  } catch (error) {
    return reply
      .status(400)
      .send({ error: "Dados inválidos para criar o evento." });
  }
}

export async function updateEventHandler(
  request: FastifyRequest<{ Body: UpdateEventInput; Params: { id: string } }>,
  reply: FastifyReply
) {
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply.status(403).send({ error: "Acesso negado." });
  }
  try {
    const event = await updateEventService(request.params.id, request.body);
    return reply.send({ event });
  } catch (error) {
    return reply
      .status(400)
      .send({ error: "Não foi possível atualizar o evento." });
  }
}

export async function deleteEventHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  if ((request as any).auth?.sessionClaims?.public_metadata?.role !== "admin") {
    return reply.status(403).send({ error: "Acesso negado." });
  }
  try {
    await deleteEventService(request.params.id);
    return reply.status(204).send();
  } catch (error) {
    return reply
      .status(404)
      .send({ error: "Evento não encontrado para deletar." });
  }
}

export async function getMyAttendanceStatusHandler(
  request: FastifyRequest<{ Params: { eventId: string } }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;
  if (!auth || !auth.userId) {
    return reply.status(401).send({ error: "Não autorizado." });
  }

  try {
    const localUser = await findOrCreateUserService(auth.userId);
    const attendance = await getAttendanceStatusService(
      localUser.id,
      request.params.eventId
    );

    return reply.send({ attendance });
  } catch (error) {
    return reply
      .status(500)
      .send({ error: "Erro ao buscar status de presença." });
  }
}

export async function rsvpEventHandler(
  request: FastifyRequest<{ Body: RsvpInput; Params: { eventId: string } }>,
  reply: FastifyReply
) {
  const auth = (request as any).auth;
  if (!auth || !auth.userId) {
    return reply.status(401).send({ error: "Não autorizado." });
  }

  const { userId: clerkId } = auth;

  const { eventId } = request.params;
  const { status } = request.body;

  try {
    const localUser = await findOrCreateUserService(clerkId);

    const attendance = await upsertAttendanceService({
      userId: localUser.id,
      eventId,
      status,
    });

    return reply.status(200).send({ attendance });
  } catch (error) {
    console.error("Erro ao confirmar presença:", error);
    return reply
      .status(400)
      .send({ error: "Não foi possível registrar sua presença." });
  }
}
