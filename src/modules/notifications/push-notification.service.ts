import Expo from "expo-server-sdk";

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
      await expo.sendPushNotificationsAsync([message]);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
