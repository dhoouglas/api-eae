import { prisma } from "../../server";

export class NotificationService {
  async updatePushToken(userId: string, pushToken: string) {
    return prisma.user.update({
      where: { clerkId: userId },
      data: { pushToken },
    });
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      notifyOnNewEvents?: boolean;
      notifyOnEventReminders?: boolean;
      notifyOnNews?: boolean;
    }
  ) {
    return prisma.user.update({
      where: { clerkId: userId },
      data: preferences,
    });
  }

  async getNotificationPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        notifyOnNewEvents: true,
        notifyOnEventReminders: true,
        notifyOnNews: true,
      },
    });

    if (!user) throw new Error("User not found");
    return user;
  }

  async getInboxNotifications(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error("User not found");

    return prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markAsRead(clerkId: string, notificationId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error("User not found");

    return prisma.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { read: true },
    });
  }

  async sendGeneralNotification(title: string, body: string) {
    const { pushNotificationService } = await import("./push-notification.service");

    // Apenas usuários que aceitam novidades do Instituto
    const usersToNotify = await prisma.user.findMany({
      where: {
        notifyOnNews: true,
        pushToken: { not: null },
      },
    });

    await Promise.all(
      usersToNotify.map(async (user) => {
        const promises: Promise<any>[] = [];

        // Enviar push
        if (user.pushToken) {
          promises.push(
            pushNotificationService.sendPushNotification(user.pushToken, title, body)
          );
        }

        // Gravar no inbox
        promises.push(
          prisma.notification.create({
            data: { title, message: body, category: "GERAL", userId: user.id },
          })
        );

        await Promise.all(promises);
      })
    );

    return usersToNotify.length;
  }
}

export const notificationService = new NotificationService();
