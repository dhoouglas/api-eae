import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { notificationService } from "./notification.service";

export class NotificationController {
  async getNotificationPreferences(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    try {
      const preferences = await notificationService.getNotificationPreferences(userId);
      return reply.send(preferences);
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ error: "User not found" });
    }
  }

  async updatePushToken(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const bodySchema = z.object({ pushToken: z.string() });

    try {
      const { pushToken } = bodySchema.parse(req.body);
      await notificationService.updatePushToken(userId, pushToken);
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: "Invalid request body" });
    }
  }

  async updateNotificationPreferences(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const bodySchema = z.object({
      notifyOnNewEvents: z.boolean().optional(),
      notifyOnEventReminders: z.boolean().optional(),
      notifyOnNews: z.boolean().optional(),
    });

    try {
      const preferences = bodySchema.parse(req.body);
      await notificationService.updateNotificationPreferences(userId, preferences);
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: "Invalid request body" });
    }
  }

  async sendGeneralNotification(req: FastifyRequest, reply: FastifyReply) {
    const auth = (req as any).auth;
    if (auth?.sessionClaims?.public_metadata?.role !== "admin") {
      return reply.status(403).send({ error: "Acesso negado." });
    }

    const bodySchema = z.object({
      title: z.string().min(1),
      body: z.string().min(1),
    });

    try {
      const { title, body } = bodySchema.parse(req.body);
      const count = await notificationService.sendGeneralNotification(title, body);
      return reply.send({ success: true, count });
    } catch (error) {
      console.error(error);
      return reply.status(400).send({ error: "Dados incorretos" });
    }
  }

  async getInbox(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    try {
      const notifications = await notificationService.getInboxNotifications(userId);
      return reply.send(notifications);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar notificações" });
    }
  }

  async markAsRead(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { userId } = req.auth;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    try {
      await notificationService.markAsRead(userId, req.params.id);
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao marcar como lida" });
    }
  }
}
