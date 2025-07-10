import { FastifyInstance } from "fastify";
import FloraController from "./flora.controller";

export async function floraRoutes(app: FastifyInstance) {
  app.post("/", FloraController.create);
  app.get("/", FloraController.findAll);
  app.get("/:id", FloraController.findOne);
  app.put("/:id", FloraController.update);
  app.delete("/:id", FloraController.remove);
}
