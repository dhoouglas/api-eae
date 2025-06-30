import { prisma } from "../../server";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().datetime(),
  location: z.string().min(1, "Localização é obrigatória"),
  imageUrl: z.string().url().optional(),
});

const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export async function getEventsService() {
  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
  });
  return events;
}

export async function getEventByIdService(id: string) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id },
  });
  return event;
}

export async function createEventService(input: CreateEventInput) {
  const data = createEventSchema.parse(input);

  const event = await prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
  });

  return event;
}

export async function updateEventService(id: string, input: UpdateEventInput) {
  const data = updateEventSchema.parse(input);
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    },
  });
  return event;
}

export async function deleteEventService(id: string) {
  await prisma.event.delete({
    where: { id },
  });
}
