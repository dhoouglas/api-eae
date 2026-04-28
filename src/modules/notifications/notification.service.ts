import { prisma } from "../../server";

export class NotificationService {
  async updatePushToken(userId: string, pushToken: string) {
    try {
      if (pushToken) {
        // Remove token from other users first to prevent Unique constraint failed (P2002)
        await prisma.user.updateMany({
          where: {
            pushToken,
            clerkId: { not: userId },
          },
          data: { pushToken: null },
        });
      }

      return await prisma.user.update({
        where: { clerkId: userId },
        data: { pushToken },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.warn(`User ${userId} not found yet for push token update. Ignoring.`);
        return null;
      }
      throw error;
    }
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
    if (!user) {
      console.warn(`User ${clerkId} not found. Returning empty inbox.`);
      return [];
    }

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

        // Enviar push (forward clerkId so stale-token cleanup is scoped to the owner)
        if (user.pushToken) {
          promises.push(
            pushNotificationService.sendPushNotification(user.pushToken, title, body, user.clerkId)
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

  async deleteInboxNotification(clerkId: string, notificationId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error("User not found");

    return prisma.notification.delete({
      where: { id: notificationId, userId: user.id },
    });
  }

  async deleteGlobalNotification(notificationId: string) {
    const original = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!original) throw new Error("Notification not found");

    const result = await prisma.notification.deleteMany({
      where: {
        title: original.title,
        message: original.message,
        category: original.category,
      }
    });

    return result.count;
  }
}

export const notificationService = new NotificationService();
