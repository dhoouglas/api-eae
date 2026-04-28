import Expo from "expo-server-sdk";
import { prisma } from "../../server";

const expo = new Expo();

class PushNotificationService {
  async sendPushNotification(pushToken: string, title: string, body: string) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const message = {
      to: pushToken,
      sound: "default" as const,
      title,
      body,
    };

    try {
      const tickets = await expo.sendPushNotificationsAsync([message]);

      const receiptIds: string[] = [];
      for (const ticket of tickets) {
        if (ticket.status === "error") {
          console.error("❌ Expo Push Error:", ticket.message, "| Details:", JSON.stringify(ticket.details));
          // DeviceNotRegistered means the token is stale — clear it immediately from DB
          if ((ticket.details as any)?.error === "DeviceNotRegistered") {
            await this.clearStaleToken(pushToken);
          }
        } else {
          console.log("✅ Expo push ticket OK:", ticket.id);
          receiptIds.push(ticket.id);
        }
      }

      if (receiptIds.length > 0) {
        // Expo demora ~30s para processar os receipts
        setTimeout(() => this.checkReceipts(receiptIds), 35_000);
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  private async clearStaleToken(pushToken: string) {
    try {
      await prisma.user.updateMany({
        where: { pushToken },
        data: { pushToken: null },
      });
      console.warn(`🗑️ Token inválido removido do banco: ${pushToken}`);
    } catch (err) {
      console.error("Erro ao limpar token inválido:", err);
    }
  }

  private async checkReceipts(receiptIds: string[]) {
    try {
      const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      for (const chunk of receiptIdChunks) {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        for (const [id, receipt] of Object.entries(receipts)) {
          if (receipt.status === "ok") {
            console.log(`📬 Receipt OK [${id}]: entregue ao dispositivo`);
          } else {
            console.error(`📭 Receipt ERROR [${id}]:`, receipt.message, "| Details:", JSON.stringify(receipt.details));
            if ((receipt.details as any)?.error === "DeviceNotRegistered") {
              console.warn(`⚠️ Receipt [${id}] indica DeviceNotRegistered. Token obsoleto detectado.`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar receipts:", error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
