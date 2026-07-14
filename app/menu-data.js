export const DELIVERY_FEE = 800;
export const FREE_DELIVERY_OVER = 8000;
export const SHOP_NAME = "moulin coffee";
export const SHOP_ADDRESS = "Рыскулова 178";

export const MENU = [
  {
    category: "Напитки",
    items: [
      { id: "esp", name: "Эспрессо", price: 900, image: "/images/espresso.svg" },
      { id: "ame", name: "Американо", price: 1000, image: "/images/americano.svg" },
      { id: "cap", name: "Капучино", price: 1300, image: "/images/cappuccino.svg" },
    ],
  },
  {
    category: "Еда",
    items: [
      { id: "cro", name: "Круассан классический", price: 1200, image: "/images/croissant.svg" },
      { id: "san", name: "Сэндвич с курицей", price: 1900, image: "/images/sandwich.svg" },
    ],
  },
];

export function getAllItems() {
  return MENU.flatMap((section) => section.items);
}

export function getItem(id) {
  return getAllItems().find((item) => item.id === id);
}
