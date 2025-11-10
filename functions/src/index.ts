import * as functions from "firebase-functions";
import cors from "cors";

const corsHandler = cors({ origin: true });

export const sendEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { email, subject, body } = req.body;

      if (!email || !subject || !body) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const apiKey = functions.config().brevo.key;

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { email: "read.cycle.inv@gmail.com", name: "ReadCycle" },
          to: [{ email }],
          subject,
          htmlContent: body,
        }),
      });

      const data = await response.json();
      return res.status(200).json(data);

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.toString() });
    }
  });
});