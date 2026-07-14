"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "moulin2026";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const ok = sessionStorage.getItem("admin-auth") === "1";
    setLoggedIn(ok);
    if (ok) {
      loadMenu();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadMenu() {
    const res = await fetch("/api/menu");
    const data = await res.json();
    setMenu(data);
    setLoading(false);
  }

  function login(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "1");
      setLoggedIn(true);
      loadMenu();
    } else {
      alert("Неверный пароль");
    }
  }

  async function saveMenu() {
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu),
    });
    if (res.ok) {
      alert("Меню сохранено");
    }
  }

  function updateItem(sectionIndex, itemIndex, field, value) {
    const next = { ...menu };
    next.sections[sectionIndex].items[itemIndex][field] = value;
    setMenu(next);
  }

  function addItem(sectionIndex) {
    const next = { ...menu };
    next.sections[sectionIndex].items.push({ id: `new-${Date.now()}`, name: "Новая позиция", price: 0, image: "/images/espresso.svg" });
    setMenu(next);
  }

  function removeItem(sectionIndex, itemIndex) {
    const next = { ...menu };
    next.sections[sectionIndex].items.splice(itemIndex, 1);
    setMenu(next);
  }

  function addSection() {
    const next = { ...menu };
    next.sections.push({ category: "Новая категория", items: [] });
    setMenu(next);
  }

  if (loading) return <div style={{ padding: 24 }}>Загрузка…</div>;

  if (!loggedIn) {
    return (
      <main style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
        <h1>Админка moulin coffee</h1>
        <form onSubmit={login}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
          />
          <button type="submit" style={{ width: "100%", padding: 12 }}>Войти</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: 24 }}>
      <h1>Админка меню</h1>
      <div style={{ marginBottom: 20 }}>
        <button onClick={saveMenu} style={{ padding: 10 }}>Сохранить меню</button>
        <button onClick={() => router.push("/")} style={{ padding: 10, marginLeft: 8 }}>На сайт</button>
      </div>

      {menu?.sections?.map((section, sectionIndex) => (
        <section key={section.category + sectionIndex} style={{ marginBottom: 24, border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
          <h2>{section.category}</h2>
          <button onClick={() => addItem(sectionIndex)}>Добавить позицию</button>
          {section.items.map((item, itemIndex) => (
            <div key={item.id} style={{ borderTop: "1px solid #eee", padding: "12px 0" }}>
              <input
                value={item.name}
                onChange={(e) => updateItem(sectionIndex, itemIndex, "name", e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                value={item.price}
                type="number"
                onChange={(e) => updateItem(sectionIndex, itemIndex, "price", Number(e.target.value))}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                value={item.image}
                onChange={(e) => updateItem(sectionIndex, itemIndex, "image", e.target.value)}
                placeholder="/images/название.svg"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <button onClick={() => removeItem(sectionIndex, itemIndex)}>Удалить</button>
            </div>
          ))}
        </section>
      ))}

      <button onClick={addSection}>Добавить категорию</button>
    </main>
  );
}
