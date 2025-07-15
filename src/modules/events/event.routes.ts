import { FastifyInstance } from "fastify";
// 1. Importamos TODOS os nossos handlers do controller
import {
  getEventsHandler,
  createEventHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler,
  rsvpEventHandler,
  getMyAttendanceStatusHandler,
  getEventsSummaryHandler,
} from "./event.controller";

export async function eventRoutes(app: FastifyInstance) {
  // rotas eventos
  app.get("/summary", getEventsSummaryHandler);

  app.get("/", getEventsHandler);

  app.get("/:id", getEventByIdHandler);

  app.post("/", createEventHandler);

  app.put("/:id", updateEventHandler);

  app.delete("/:id", deleteEventHandler);

  // rota para confirmar presença
  app.post("/:eventId/rsvp", rsvpEventHandler);

  app.get("/:eventId/attendance/me", getMyAttendanceStatusHandler);
}
