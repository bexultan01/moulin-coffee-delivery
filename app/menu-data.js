export const DELIVERY_FEE = 800;
export const FREE_DELIVERY_OVER = 8000;
export const SHOP_NAME = "moulin coffee";
export const SHOP_ADDRESS = "Рыскулова 178";

export const MENU = [
  {
    category: "Холодные напитки",
    items: [
      { id: "ice1", name: "Iced Signature", price: 1800, description: "Кофе, ваниль, ледяной крем", image: "/images/americano.jpg" },
      { id: "tea1", name: "Фруктовый чай", price: 1400, description: "Черный чай, цитрус, мята", image: "/images/espresso.jpg" },
    ],
  },
  {
    category: "Горячие напитки",
    items: [
      { id: "hot1", name: "Горячий шоколад", price: 2000, description: "Натуральный шоколад, сливки", image: "/images/cappuccino.jpg" },
      { id: "tea2", name: "Чай с бергамотом", price: 1300, description: "Ароматный черный чай", image: "/images/espresso.jpg" },
    ],
  },
  {
    category: "Кофе",
    items: [
      { id: "esp", name: "Эспрессо", price: 900, description: "Классический двойной экстракт", image: "/images/espresso.jpg", isNew: true },
      { id: "cap", name: "Капучино", price: 1300, description: "Сливочное молоко, бариста-эспрессо", image: "/images/cappuccino.jpg" },
      { id: "ame", name: "Американо", price: 1000, description: "Нежный вкус с мягкой кислотой", image: "/images/americano.jpg" },
    ],
  },
  {
    category: "Кухня",
    items: [
      { id: "cro", name: "Круассан с лососем", price: 2200, description: "Сливочный сыр, лосось, зелень", image: "/images/croissant.jpg" },
      { id: "san", name: "Сэндвич с курицей", price: 1900, description: "Птица, томаты, сыр", image: "/images/sandwich.jpg" },
    ],
  },
];

export function getAllItems() {
  return MENU.flatMap((section) => section.items);
}

export function getItem(id) {
  return getAllItems().find((item) => item.id === id);
}
