import { FastifyInstance } from "fastify";
import FaunaController from "./fauna.controller";

export async function faunaRoutes(app: FastifyInstance) {
  app.post("/", FaunaController.create);
  app.get("/", FaunaController.findAll);
  app.get("/:id", FaunaController.findOne);
  app.put("/:id", FaunaController.update);
  app.delete("/:id", FaunaController.remove);
}
