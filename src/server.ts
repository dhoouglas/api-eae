import "dotenv/config";
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { eventRoutes } from "./modules/events/event.routes";
import { clerkPlugin } from "@clerk/fastify";
import { newsRoutes } from "./modules/news/news.routes";

const app = fastify();
export const prisma = new PrismaClient();

app.get("/", () => {
  return { message: "API do Instituto EAE no ar!" };
});

app.register(clerkPlugin, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

app.register(eventRoutes, {
  prefix: "/events",
});

app.register(newsRoutes, {
  prefix: "/news",
});

async function start() {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 Servidor HTTP rodando em http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
