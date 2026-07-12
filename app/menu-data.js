// Меню кофейни. Отредактируй под реальные позиции и цены.
// id должен быть уникальным для каждой позиции.

export const MENU = [
  {
    category: "Напитки",
    items: [
      { id: "esp", name: "Эспрессо", price: 900 },
      { id: "ame", name: "Американо", price: 1000 },
      { id: "cap", name: "Капучино", price: 1300 },
      { id: "lat", name: "Латте", price: 1400 },
      { id: "rav", name: "Раф ванильный", price: 1500 },
    ],
  },
  {
    category: "Еда",
    items: [
      { id: "cro", name: "Круассан классический", price: 1200 },
      { id: "san", name: "Сэндвич с курицей", price: 1900 },
      { id: "chk", name: "Чизкейк, кусок", price: 1800 },
    ],
  },
];

export const DELIVERY_FEE = 800;
export const FREE_DELIVERY_OVER = 8000;
export const SHOP_NAME = "Кружка";
export const SHOP_ADDRESS = "ул. Абая 12, Алматы";

export function getAllItems() {
  return MENU.flatMap((section) => section.items);
}

export function getItem(id) {
  return getAllItems().find((item) => item.id === id);
}
