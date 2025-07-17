import dotenv from "dotenv";
dotenv.config();
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { eventRoutes } from "./modules/events/event.routes";
import { clerkPlugin } from "@clerk/fastify";
import { newsRoutes } from "./modules/news/news.routes";
import { faunaRoutes } from "./modules/fauna/fauna.routes";
import { floraRoutes } from "./modules/flora/flora.routes";
import { notificationRoutes } from "./modules/notifications/notification.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";
import multipart from "@fastify/multipart";
import "./cron";

const app = fastify();

export const prisma = new PrismaClient();

app.register(multipart, {
  limits: {
    fileSize: 3 * 1024 * 1024, // Limite de 3 MB para o tamanho do arquivo
  },
});

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

app.register(uploadRoutes, { prefix: "/upload" });

app.register(faunaRoutes, {
  prefix: "/fauna",
});

app.register(floraRoutes, {
  prefix: "/flora",
});

app.register(notificationRoutes, {
  prefix: "/notifications",
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
