import { prisma } from "../../server";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().datetime(),
  location: z.string().min(1, "Localização é obrigatória"),
  imageUrl: z.string().url().optional(),
});

const rsvpStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "MAYBE", "DECLINED"]),
});

export type RsvpInput = z.infer<typeof rsvpStatusSchema>;

const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export async function getEventsService(userId: string | null) {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attendees: { where: { userId: userId ?? undefined } },
    },
  });

  return events.map((event) => {
    const { attendees, ...restOfEvent } = event;
    return {
      ...restOfEvent,
      myAttendanceStatus: attendees.length > 0 ? attendees[0].status : null,
    };
  });
}

export async function getEventByIdService(id: string) {
  return await prisma.event.findUniqueOrThrow({ where: { id } });
}

export async function createEventService(input: CreateEventInput) {
  const data = createEventSchema.parse(input);
  return await prisma.event.create({
    data: { ...data, date: new Date(data.date) },
  });
}

export async function updateEventService(id: string, input: UpdateEventInput) {
  const data = updateEventSchema.parse(input);
  return await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    },
  });
}

export async function deleteEventService(id: string) {
  await prisma.event.delete({ where: { id } });
}

export async function getAttendanceStatusService(
  userId: string,
  eventId: string
) {
  const attendance = await prisma.eventAttendance.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });
  return attendance;
}

export async function getEventsSummaryService() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  const summary = await Promise.all(
    events.map(async (event) => {
      const rsvps = await prisma.eventAttendance.groupBy({
        by: ["status"],
        where: {
          eventId: event.id,
        },
        _count: {
          status: true,
        },
      });

      const counts = {
        going: 0,
        notGoing: 0,
        maybe: 0,
      };

      rsvps.forEach((rsvp) => {
        if (rsvp.status === "CONFIRMED") {
          counts.going = rsvp._count.status;
        } else if (rsvp.status === "DECLINED") {
          counts.notGoing = rsvp._count.status;
        } else if (rsvp.status === "MAYBE") {
          counts.maybe = rsvp._count.status;
        }
      });

      return {
        id: event.id,
        name: event.title,
        rsvps: counts,
      };
    })
  );

  return summary;
}

export async function upsertAttendanceService({
  userId,
  eventId,
  status,
}: {
  userId: string;
  eventId: string;
  status: RsvpInput["status"];
}) {
  const attendance = await prisma.eventAttendance.upsert({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
    update: {
      status,
    },
    create: {
      userId,
      eventId,
      status,
    },
  });

  return attendance;
}
