import { FastifyInstance } from "fastify";
import { TrailCoordinateController } from "./trail-coordinate.controller";

const coordinateController = new TrailCoordinateController();

export async function trailCoordinateRoutes(app: FastifyInstance) {
  // Rotas para coordenadas dentro de uma trilha específica
  app.post("/trails/:trailId/coordinates", coordinateController.create);
  app.get("/trails/:trailId/coordinates", coordinateController.listByTrail);

  // Rotas para uma coordenada específica
  app.get("/coordinates/:id", coordinateController.get);
  app.put("/coordinates/:id", coordinateController.update);
  app.delete("/coordinates/:id", coordinateController.delete);
}
