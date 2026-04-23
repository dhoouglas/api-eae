import { FastifyInstance } from "fastify";
import { NotificationController } from "./notification.controller";

const notificationController = new NotificationController();

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/users/notification-preferences", (req, reply) =>
    notificationController.getNotificationPreferences(req, reply)
  );
  app.post("/users/push-token", (req, reply) =>
    notificationController.updatePushToken(req, reply)
  );
  app.put("/users/notification-preferences", (req, reply) =>
    notificationController.updateNotificationPreferences(req, reply)
  );
  app.post("/send-general", (req, reply) =>
    notificationController.sendGeneralNotification(req, reply)
  );
  app.get("/inbox", (req, reply) =>
    notificationController.getInbox(req, reply)
  );
  app.patch("/inbox/:id/read", (req, reply) =>
    notificationController.markAsRead(req as any, reply)
  );
}
