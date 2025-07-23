import { FastifyInstance } from "fastify";
import { TrailController } from "./trail.controller";

const trailController = new TrailController();

export async function trailRoutes(app: FastifyInstance) {
  app.post("/", trailController.create);
  app.get("/", trailController.list);
  app.get("/:id", trailController.get);
  app.put("/:id", trailController.update);
  app.delete("/:id", trailController.delete);
}
