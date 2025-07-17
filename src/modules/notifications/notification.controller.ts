import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotificationPreferences(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    try {
      const preferences = await notificationService.getNotificationPreferences(
        userId
      );
      return reply.send(preferences);
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ error: "User not found" });
    }
  }

  async updatePushToken(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const bodySchema = z.object({
      pushToken: z.string(),
    });

    try {
      const { pushToken } = bodySchema.parse(req.body);
      await notificationService.updatePushToken(userId, pushToken);
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: "Invalid request body" });
    }
  }

  async updateNotificationPreferences(
    req: FastifyRequest,
    reply: FastifyReply
  ) {
    const { userId } = req.auth;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const bodySchema = z.object({
      notifyOnNewEvents: z.boolean().optional(),
      notifyOnEventReminders: z.boolean().optional(),
      notifyOnNews: z.boolean().optional(),
    });

    try {
      const preferences = bodySchema.parse(req.body);
      await notificationService.updateNotificationPreferences(
        userId,
        preferences
      );
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: "Invalid request body" });
    }
  }
}
