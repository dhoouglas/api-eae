import dotenv from "dotenv";
dotenv.config();
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { eventRoutes } from "./modules/events/event.routes";
import { clerkPlugin } from "@clerk/fastify";
import { newsRoutes } from "./modules/news/news.routes";
import { faunaRoutes } from "./modules/fauna/fauna.routes";
import { floraRoutes } from "./modules/flora/flora.routes";
import { trailRoutes } from "./modules/trails/trail.routes";
import { trailCoordinateRoutes } from "./modules/trail-coordinates/trail-coordinate.routes";
import { trailWaypointRoutes } from "./modules/trail-waypoints/trail-waypoint.routes";
import { notificationRoutes } from "./modules/notifications/notification.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import "./cron";

const app = fastify();

export const prisma = new PrismaClient();

app.register(cors, {
  origin: "*", // Em produção, você pode restringir para o domínio do seu app
});

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

app.register(trailRoutes, {
  prefix: "/trails",
});

app.register(trailCoordinateRoutes);

app.register(trailWaypointRoutes);

app.register(notificationRoutes, {
  prefix: "/notifications",
});

async function start() {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Servidor HTTP rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
