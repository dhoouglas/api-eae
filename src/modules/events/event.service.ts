import { prisma } from "../../server";
import { z } from "zod";

// 1. O esquema de validação (Zod) vive aqui, perto da lógica de negócio.
const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().datetime(),
  location: z.string().min(1, "Localização é obrigatória"),
  imageUrl: z.string().url().optional(),
});

// Exportamos o tipo para que o Controller saiba o formato dos dados
export type CreateEventInput = z.infer<typeof createEventSchema>;

// --- Serviço para Listar Eventos ---
export async function getEventsService() {
  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
  });
  return events;
}

// --- Serviço para Criar um Evento ---
export async function createEventService(input: CreateEventInput) {
  // A validação dos dados acontece aqui dentro do serviço
  const data = createEventSchema.parse(input);

  const event = await prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date), // Convertemos a string da data para um objeto Date
    },
  });

  return event;
}
