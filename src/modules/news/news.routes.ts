import { FastifyInstance } from "fastify";
import {
  createNewsPostHandler,
  deleteNewsPostHandler,
  getLatestNewsHandler,
  getNewsPostByIdHandler,
  updateNewsPostHandler,
} from "./news.controller";

export async function newsRoutes(app: FastifyInstance) {
  app.get("/", getLatestNewsHandler);

  app.get("/:id", getNewsPostByIdHandler);

  // Rotas de admin
  app.post("/", createNewsPostHandler);
  app.put("/:id", updateNewsPostHandler);
  app.delete("/:id", deleteNewsPostHandler);
}
