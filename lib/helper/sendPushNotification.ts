import axios from "axios";

export async function sendPushNotification(to: string, title: string, body: string) {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to,
      title,
      body,
      sound: "default",
      data: { screen: "logs" },
    });
  } catch (err) {
    console.error("Gagal kirim push notification:", err);
  }
}

