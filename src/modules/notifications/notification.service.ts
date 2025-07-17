import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
