import { NextResponse } from "next/server";
import { getItem, DELIVERY_FEE, FREE_DELIVERY_OVER } from "../../menu-data";

export async function POST(request) {
  const body = await request.json();
  const { cart, address, phone, orderNo } = body || {};

  if (!cart || typeof cart !== "object" || Object.keys(cart).length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }
  if (!address || !address.trim()) {
    return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: "Бот не настроен на сервере. Проверь переменные окружения." },
      { status: 500 }
    );
  }

  // пересчитываем сумму на сервере, не доверяя тому, что прислал браузер
  const lines = [];
  let subtotal = 0;
  for (const [itemId, qty] of Object.entries(cart)) {
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) continue;
    const item = getItem(itemId);
    if (!item) continue;
    subtotal += item.price * quantity;
    lines.push(`${item.name} ×${quantity} — ${item.price * quantity} ₸`);
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const delivery = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  const text = [
    `🧾 Новый заказ №${orderNo || "—"} с сайта`,
    "",
    ...lines,
    "",
    `Доставка: ${delivery === 0 ? "бесплатно" : delivery + " ₸"}`,
    `Итого: ${total} ₸`,
    "",
    `Адрес: ${address.trim()}`,
    `Телефон: ${phone.trim()}`,
  ].join("\n");

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const telegramResponse = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!telegramResponse.ok) {
    const errText = await telegramResponse.text();
    console.error("Telegram API error:", errText);
    return NextResponse.json(
      { error: "Не получилось отправить заказ. Попробуй ещё раз." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, total });
}
