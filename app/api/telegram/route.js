import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY:", JSON.stringify(body, null, 2));

    const message =
      body.message?.text || body.edited_message?.text;
    const chatId =
      body.message?.chat?.id || body.edited_message?.chat?.id;

    if (!message || !chatId) {
      return Response.json({ ok: true });
    }

    let reply = "";

    try {
      console.log("Calling Groq...");

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI Telegram bot.",
          },
          { role: "user", content: message },
        ],
      });
      reply =
        completion.choices[0]?.message?.content ||
        "No response from AI";
    } catch (err) {
      console.error("Groq failed:", err.message);

      reply = `⚠️ AI is currently unavailable.\n\nYou said: ${message}`;
    }

    // Send reply to Telegram
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      }
    );

    const telegramData = await telegramRes.json();
    console.log("TELEGRAM RESPONSE:", telegramData);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("GLOBAL ERROR:", error.message);

    return Response.json({ ok: true });
  }
}