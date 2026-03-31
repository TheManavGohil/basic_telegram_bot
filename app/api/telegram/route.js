// app/api/telegram/route.js

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return Response.json({ status: "Telegram bot is running 🚀" });
}

export async function POST(req) {
  const body = await req.json();

  const message = body.message?.text;
  const chatId = body.message?.chat?.id;

  if (!message) {
    return Response.json({ ok: true });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful AI Telegram bot." },
      { role: "user", content: message },
    ],
  });

  const reply =
    completion.choices[0].message.content || "No response";

  await fetch(
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

  return Response.json({ ok: true });
}