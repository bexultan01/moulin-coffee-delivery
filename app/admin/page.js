"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "moulin2026";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState(null);
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
    next.sections[sectionIndex].items.push({ id: `new-${Date.now()}`, name: "Новая позиция", price: 0, description: "Состав", image: "/images/espresso.svg", visible: true, isNew: false });
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

  function moveSection(sectionIndex, direction) {
    const next = { ...menu };
    const target = sectionIndex + direction;
    if (target < 0 || target >= next.sections.length) return;
    const [moved] = next.sections.splice(sectionIndex, 1);
    next.sections.splice(target, 0, moved);
    setMenu(next);
  }

  function moveItem(sectionIndex, itemIndex, direction) {
    const next = { ...menu };
    const items = next.sections[sectionIndex].items;
    const target = itemIndex + direction;
    if (target < 0 || target >= items.length) return;
    const [moved] = items.splice(itemIndex, 1);
    items.splice(target, 0, moved);
    setMenu(next);
  }

  async function uploadImage(sectionIndex, itemIndex, file) {
    if (!file) return;
    setUploadingIndex(`${sectionIndex}-${itemIndex}`);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      updateItem(sectionIndex, itemIndex, "image", data.url);
    } else {
      alert(data.error || "Не удалось загрузить фото");
    }

    setUploadingIndex(null);
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <input
              value={section.category}
              onChange={(e) => {
                const next = { ...menu };
                next.sections[sectionIndex].category = e.target.value;
                setMenu(next);
              }}
              style={{ flex: 1, padding: 8 }}
            />
            <button onClick={() => moveSection(sectionIndex, -1)}>↑</button>
            <button onClick={() => moveSection(sectionIndex, 1)}>↓</button>
          </div>
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
              <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={item.visible !== false}
                    onChange={(e) => updateItem(sectionIndex, itemIndex, "visible", e.target.checked)}
                  />
                  Показывать
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(item.isNew)}
                    onChange={(e) => updateItem(sectionIndex, itemIndex, "isNew", e.target.checked)}
                  />
                  Новинка
                </label>
              </div>
              <input
                value={item.description || ""}
                onChange={(e) => updateItem(sectionIndex, itemIndex, "description", e.target.value)}
                placeholder="Состав или описание"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                value={item.image}
                onChange={(e) => updateItem(sectionIndex, itemIndex, "image", e.target.value)}
                placeholder="/images/название.svg"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(sectionIndex, itemIndex, e.target.files?.[0])}
                style={{ marginBottom: 8 }}
              />
              <div style={{ marginBottom: 8 }}>
                {uploadingIndex === `${sectionIndex}-${itemIndex}` ? "Загрузка…" : "Выберите изображение с устройства"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => moveItem(sectionIndex, itemIndex, -1)}>↑</button>
                <button onClick={() => moveItem(sectionIndex, itemIndex, 1)}>↓</button>
                <button onClick={() => removeItem(sectionIndex, itemIndex)}>Удалить</button>
              </div>
            </div>
          ))}
        </section>
      ))}

      <button onClick={addSection}>Добавить категорию</button>
    </main>
  );
}
