import cron from "node-cron";
import { prisma } from "./server";
import { pushNotificationService } from "./modules/notifications/push-notification.service";

// Roda todo dia às 9h da manhã
cron.schedule("0 9 * * *", async () => {
  console.log("Running cron job: Sending event reminders");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
    },
  });

  for (const event of upcomingEvents) {
    const attendees = await prisma.eventAttendance.findMany({
      where: {
        eventId: event.id,
        status: "CONFIRMED",
        user: {
          notifyOnEventReminders: true,
          pushToken: {
            not: null,
          },
        },
      },
      include: {
        user: true,
      },
    });

    for (const attendance of attendees) {
      if (attendance.user.pushToken) {
        pushNotificationService.sendPushNotification(
          attendance.user.pushToken,
          "Lembrete de Evento",
          `Não se esqueça! O evento "${event.title}" é amanhã.`
        );
      }
    }
  }
});

console.log("Cron job for event reminders scheduled.");
