import { FastifyInstance } from "fastify";
import { TrailWaypointController } from "./trail-waypoint.controller";

const waypointController = new TrailWaypointController();

export async function trailWaypointRoutes(app: FastifyInstance) {
  // Rotas para waypoints dentro de uma trilha específica
  app.post("/trails/:trailId/waypoints", waypointController.create);
  app.get("/trails/:trailId/waypoints", waypointController.listByTrail);

  // Rotas para um waypoint específico
  app.get("/waypoints/:id", waypointController.get);
  app.put("/waypoints/:id", waypointController.update);
  app.delete("/waypoints/:id", waypointController.delete);
}
