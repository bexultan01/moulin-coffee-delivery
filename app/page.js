"use client";

import { useMemo, useState, useEffect } from "react";
import {
  MENU as FALLBACK_MENU,
  DELIVERY_FEE as FALLBACK_DELIVERY_FEE,
  FREE_DELIVERY_OVER as FALLBACK_FREE_DELIVERY_OVER,
  SHOP_NAME as FALLBACK_SHOP_NAME,
  SHOP_ADDRESS as FALLBACK_SHOP_ADDRESS,
} from "./menu-data";

function formatMoney(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

export default function Home() {
  const [cart, setCart] = useState({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [menu, setMenu] = useState({
    shopName: FALLBACK_SHOP_NAME,
    shopAddress: FALLBACK_SHOP_ADDRESS,
    deliveryFee: FALLBACK_DELIVERY_FEE,
    freeDeliveryOver: FALLBACK_FREE_DELIVERY_OVER,
    sections: FALLBACK_MENU,
  });
  const [orderNo] = useState(() => Math.floor(100 + Math.random() * 900));

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) return;
        const data = await res.json();
        setMenu({
          shopName: data.shopName || FALLBACK_SHOP_NAME,
          shopAddress: data.shopAddress || FALLBACK_SHOP_ADDRESS,
          deliveryFee: Number(data.deliveryFee ?? FALLBACK_DELIVERY_FEE),
          freeDeliveryOver: Number(data.freeDeliveryOver ?? FALLBACK_FREE_DELIVERY_OVER),
          sections: Array.isArray(data.sections) ? data.sections : FALLBACK_MENU,
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadMenu();
  }, []);

  const getItemById = (id) => {
    return menu.sections.flatMap((section) => section.items).find((item) => item.id === id);
  };

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => ({ item: getItemById(id), qty }))
      .filter((line) => line.item && line.qty > 0);
  }, [cart, menu.sections]);

  const subtotal = cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const itemCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= menu.freeDeliveryOver ? 0 : menu.deliveryFee;
  const total = subtotal + delivery;

  function changeQty(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        delete next[id];
      } else {
        next[id] = updated;
      }
      return next;
    });
  }

  function openSheet() {
    setConfirmed(false);
    setStatus({ type: null, message: "" });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
  }

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  async function sendTelegram() {
    if (itemCount === 0) {
      setStatus({ type: "error", message: "Выберите хотя бы одну позицию." });
      return;
    }
    if (!address.trim()) {
      setStatus({ type: "error", message: "Укажите адрес доставки." });
      return;
    }
    if (!phone.trim()) {
      setStatus({ type: "error", message: "Укажите телефон для связи." });
      return;
    }

    setSending(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, address, phone, orderNo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Не получилось отправить заказ." });
        setSending(false);
        return;
      }

      setConfirmed(true);
      setCart({});
    } catch (err) {
      setStatus({ type: "error", message: "Нет связи с сервером. Проверьте интернет." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={"page"}>
      <header className={"header"}>
        <div className={"chalkDust"} aria-hidden="true" />
        <div className="brandRow">
          <img src="/moulin-logo.jpg" alt="moulin coffee logo" className="brandLogo" />
          <div>
            <p className={"headerEyebrow"}>меню на сегодня</p>
            <h1 className={"headerTitle"}>{menu.shopName}</h1>
          </div>
        </div>
        <p className={"headerSub"}>{menu.shopAddress} · доставка от {formatMoney(menu.deliveryFee)} ₸, бесплатно от {formatMoney(menu.freeDeliveryOver)} ₸</p>
        <a href="/admin" className="adminLink">Войти в админку</a>
      </header>

      <main className={"menuSection"}>
        {menu.sections.map((section) => (
          <section key={section.category}>
            <h2 className={"categoryLabel"}>{section.category}</h2>
            {section.items.map((item) => {
              if (item.visible === false) return null;
              const qty = cart[item.id] || 0;
              return (
                <div className={"item"} key={item.id}>
                  <div className="itemMedia">
                    <img src={item.image || "/images/espresso.svg"} alt={item.name} className="itemImage" />
                  </div>
                  <div className={"itemInfo"}>
                    <div className={"itemTitleRow"}>
                      <p className={"itemName"}>{item.name}</p>
                      {item.isNew ? <span className="newBadge">Новинка</span> : null}
                    </div>
                    <p className={"itemPrice"}>{formatMoney(item.price)} ₸</p>
                  </div>
                  <div className={"stepper"}>
                    <button
                      type="button"
                      className={"stepBtn"}
                      onClick={() => changeQty(item.id, -1)}
                      disabled={qty === 0}
                      aria-label={`Убрать ${item.name}`}
                    >
                      −
                    </button>
                    <span className={"stepQty"}>{qty}</span>
                    <button
                      type="button"
                      className={`stepBtn ${qty > 0 ? "stepBtnActive" : ""}`}
                      onClick={() => changeQty(item.id, 1)}
                      aria-label={`Добавить ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </main>

      <div className={`cartBar ${itemCount === 0 ? "cartBarHidden" : ""}`}>
        <div className={"cartBarInfo"}>
          {itemCount} {itemCount === 1 ? "позиция" : "позиции"}
          <div className={"cartBarTotal"}>{formatMoney(total)} ₸</div>
        </div>
        <button type="button" className={"cartBarBtn"} onClick={openSheet}>
          Оформить →
        </button>
      </div>

      <div
        className={`overlay ${sheetOpen ? "overlayVisible" : ""}`}
        onClick={closeSheet}
        aria-hidden="true"
      />

      <div
        className={`sheetWrap ${sheetOpen ? "sheetWrapOpen" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Оформление заказа"
      >
        <div className={"receipt"}>
          <div className={"receiptHandle"} />

          {!confirmed ? (
            <>
              <div className={"receiptHeader"}>
                <p className={"receiptTitle"}>Чек №{orderNo}</p>
                <p className={"receiptMeta"}>{menu.shopName} · {new Date().toLocaleDateString("ru-RU")}</p>
              </div>

              <div className={"receiptLines"}>
                {cartLines.map((l) => (
                  <div className={"receiptLine"} key={l.item.id}>
                    <span className={"receiptLineName"}>
                      {l.item.name} <span className={"receiptLineQty"}>×{l.qty}</span>
                    </span>
                    <span>{formatMoney(l.item.price * l.qty)} ₸</span>
                  </div>
                ))}
              </div>

              <div className={"receiptTotals"}>
                <div className={"receiptTotalsRow"}>
                  <span>Подытог</span>
                  <span>{formatMoney(subtotal)} ₸</span>
                </div>
                <div className={"receiptTotalsRow"}>
                  <span>Доставка</span>
                  <span>{delivery === 0 && subtotal > 0 ? "бесплатно" : formatMoney(delivery) + " ₸"}</span>
                </div>
                <div className="receiptTotalsRow grand">
                  <span>Итого</span>
                  <span>{formatMoney(total)} ₸</span>
                </div>
              </div>

              <div className={"formSection"}>
                <label className={"fieldLabel"} htmlFor="address">Адрес доставки</label>
                <input
                  id="address"
                  className={"field"}
                  type="text"
                  placeholder="Улица, дом, квартира"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <label className={"fieldLabel"} htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  className={"field"}
                  type="tel"
                  placeholder="+7 ___ ___ __ __"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div className={"sendActions"}>
                  <button
                    type="button"
                    className="sendBtn sendBtnTelegram"
                    onClick={sendTelegram}
                    disabled={sending}
                  >
                    {sending ? "Отправляем…" : "Отправить заказ"}
                  </button>
                </div>

                {status.type && (
                  <p
                    className={`statusMsg ${
                      status.type === "error" ? "statusError" : "statusSuccess"
                    }`}
                  >
                    {status.message}
                  </p>
                )}

                <button type="button" className={"closeBtn"} onClick={closeSheet}>
                  Закрыть
                </button>
              </div>
            </>
          ) : (
            <div className={"confirmWrap"}>
              <div className={"confirmMark"}>✅</div>
              <p className={"confirmTitle"}>Заказ отправлен</p>
              <p className={"confirmText"}>
                Заказ №{orderNo} получен кофейней «{menu.shopName}».
                Мы свяжемся с вами по указанному телефону для подтверждения.
              </p>
              <button
                type="button"
                className="sendBtn sendBtnTelegram"
                onClick={closeSheet}
              >
                Готово
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
