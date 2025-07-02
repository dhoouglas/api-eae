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
} from "./event.controller";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/", getEventsHandler);

  app.get("/:id", getEventByIdHandler);

  app.post("/", createEventHandler);

  app.put("/:id", updateEventHandler);

  app.delete("/:id", deleteEventHandler);

  app.post("/:eventId/rsvp", rsvpEventHandler);

  app.get("/:eventId/attendance/me", getMyAttendanceStatusHandler);
}
