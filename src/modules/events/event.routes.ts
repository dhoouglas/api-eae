import { FastifyInstance } from "fastify";
// 1. Importamos os nossos novos handlers do controller
import { getEventsHandler, createEventHandler } from "./event.controller";

export async function eventRoutes(app: FastifyInstance) {
  // A rota GET agora apenas aponta para o seu handler
  app.get("/", getEventsHandler);

  // A rota POST agora apenas aponta para o seu handler
  app.post("/", createEventHandler);
}

// import { FastifyInstance } from "fastify";
// import { z } from "zod";
// import { prisma } from "../../server";

// const createEventSchema = z.object({
//   title: z.string().min(1, "Título é obrigatório"),
//   description: z.string().min(1, "Descrição é obrigatória"),
//   date: z.string().datetime(),
//   location: z.string().min(1, "Localização é obrigatória"),
//   imageUrl: z.string().url().optional(),
// });

// export async function eventRoutes(app: FastifyInstance) {
//   //GET
//   app.get("/", async (request, reply) => {
//     const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
//     return { events };
//   });

//   //POST
//   app.post("/", async (request, reply) => {
//     const auth = (request as any).auth;

//     // Bloco de Autenticação
//     if (!auth || !auth.userId) {
//       return reply.status(401).send({ error: "Não autorizado." });
//     }

//     if (auth.sessionClaims?.public_metadata?.role !== "admin") {
//       return reply
//         .status(403)
//         .send({ error: "Acesso negado. Apenas administradores." });
//     }

//     // Bloco de Validação
//     const validation = createEventSchema.safeParse(request.body);
//     if (!validation.success) {
//       return reply.status(400).send({
//         error: "Dados inválidos.",
//         details: validation.error.flatten(),
//       });
//     }

//     // Bloco de Lógica de Negócio
//     try {
//       const { title, description, date, location, imageUrl } = validation.data;
//       const event = await prisma.event.create({
//         data: {
//           title,
//           description,
//           date: new Date(date),
//           location,
//           imageUrl,
//         },
//       });
//       return reply.status(201).send({ event });
//     } catch (dbError) {
//       console.error("Erro no banco de dados:", dbError);
//       return reply
//         .status(500)
//         .send({ error: "Erro interno ao criar o evento." });
//     }
//   });
// }
