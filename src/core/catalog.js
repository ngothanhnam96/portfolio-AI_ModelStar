/** The wardrobe: every item, its style tags, price and colours. Art lives in src/ui/doll.js. */

import { COLORS } from "./palette.js";

export const STYLES = {
  cute: { name: "Dễ thương", icon: "🎀" },
  elegant: { name: "Thanh lịch", icon: "🌹" },
  sporty: { name: "Năng động", icon: "🏃‍♀️" },
  street: { name: "Cá tính", icon: "🛹" },
  beach: { name: "Đi biển", icon: "🏖️" },
  office: { name: "Công sở", icon: "💼" },
  party: { name: "Dạ tiệc", icon: "🥂" },
  cozy: { name: "Ấm áp", icon: "🧣" },
  traditional: { name: "Truyền thống", icon: "🏮" },
  fairy: { name: "Cổ tích", icon: "🧚" },
};

/** Clothing slots, in the order the studio shows them. `cover`: a dress replaces top + bottom. */
export const SLOTS = [
  { id: "hair", name: "Tóc", icon: "💇‍♀️", weight: 1, required: true },
  { id: "top", name: "Áo", icon: "👚", weight: 1.5 },
  { id: "bottom", name: "Quần · Váy", icon: "👖", weight: 1.5 },
  { id: "dress", name: "Đầm", icon: "👗", weight: 3 },
  { id: "outer", name: "Áo khoác", icon: "🧥", weight: 1.2 },
  { id: "shoes", name: "Giày", icon: "👠", weight: 1.2 },
  { id: "bag", name: "Túi", icon: "👜", weight: 0.6, accessory: true },
  { id: "hat", name: "Mũ", icon: "👒", weight: 0.6, accessory: true },
  { id: "earrings", name: "Bông tai", icon: "💎", weight: 0.4, accessory: true },
  { id: "necklace", name: "Vòng cổ", icon: "📿", weight: 0.4, accessory: true },
  { id: "glasses", name: "Kính", icon: "🕶️", weight: 0.4, accessory: true },
];

const FABRIC = COLORS.filter((c) => c.id !== "gold").map((c) => c.id);
const ALL = COLORS.map((c) => c.id);
const JEWEL = ["gold", "white", "pink", "red", "sky", "purple", "black"];
const DENIM = ["sky", "blue", "navy", "black", "white", "pink"];

/** price 0 = in the starter wardrobe. */
export const ITEMS = [
  // Hair (colour = hair colour, chosen separately)
  { id: "hair-long", slot: "hair", name: "Tóc dài thẳng", tags: ["elegant", "cute"], price: 0 },
  { id: "hair-pony", slot: "hair", name: "Tóc đuôi ngựa", tags: ["sporty", "street", "beach"], price: 0 },
  { id: "hair-bob", slot: "hair", name: "Tóc bob", tags: ["office", "street", "cute"], price: 0 },
  { id: "hair-twin", slot: "hair", name: "Tóc hai bím", tags: ["cute", "fairy"], price: 60 },
  { id: "hair-bun", slot: "hair", name: "Tóc búi", tags: ["elegant", "traditional", "office", "party"], price: 80 },
  { id: "hair-curly", slot: "hair", name: "Tóc xoăn bồng", tags: ["party", "fairy", "street"], price: 100 },
  { id: "hair-braid", slot: "hair", name: "Tóc tết lệch", tags: ["fairy", "cozy", "traditional", "cute"], price: 90 },

  // Tops
  { id: "top-tee", slot: "top", name: "Áo thun", tags: ["street", "sporty", "cute", "beach"], price: 0, colors: FABRIC, color: "white" },
  { id: "top-blouse", slot: "top", name: "Áo sơ mi", tags: ["office", "elegant"], price: 0, colors: FABRIC, color: "white" },
  { id: "top-tank", slot: "top", name: "Áo ba lỗ thể thao", tags: ["sporty", "beach"], price: 50, colors: FABRIC, color: "mint" },
  { id: "top-crop", slot: "top", name: "Áo croptop", tags: ["street", "beach", "party"], price: 70, colors: FABRIC, color: "black" },
  { id: "top-sweater", slot: "top", name: "Áo len", tags: ["cozy", "cute"], price: 80, colors: FABRIC, color: "beige" },
  { id: "top-offshoulder", slot: "top", name: "Áo trễ vai bèo", tags: ["party", "elegant", "beach", "cute"], price: 110, colors: FABRIC, color: "pink" },

  // Bottoms
  { id: "bottom-jeans", slot: "bottom", name: "Quần jean", tags: ["street", "cozy"], price: 0, colors: DENIM, color: "blue" },
  { id: "bottom-pleated", slot: "bottom", name: "Chân váy xếp ly", tags: ["cute", "office"], price: 0, colors: FABRIC, color: "navy" },
  { id: "bottom-shorts", slot: "bottom", name: "Quần short", tags: ["beach", "sporty", "street"], price: 0, colors: FABRIC, color: "sky" },
  { id: "bottom-leggings", slot: "bottom", name: "Quần legging", tags: ["sporty"], price: 50, colors: FABRIC, color: "black" },
  { id: "bottom-pencil", slot: "bottom", name: "Chân váy bút chì", tags: ["office", "elegant"], price: 80, colors: FABRIC, color: "black" },
  { id: "bottom-wide", slot: "bottom", name: "Quần ống rộng", tags: ["elegant", "office", "street"], price: 90, colors: FABRIC, color: "beige" },
  { id: "bottom-tutu", slot: "bottom", name: "Váy xòe tutu", tags: ["fairy", "cute", "party"], price: 120, colors: FABRIC, color: "lilac" },

  // Dresses
  { id: "dress-sun", slot: "dress", name: "Váy hai dây", tags: ["beach", "cute"], price: 0, colors: FABRIC, color: "yellow" },
  { id: "dress-shirt", slot: "dress", name: "Đầm sơ mi", tags: ["office", "cute", "elegant"], price: 90, colors: FABRIC, color: "sky" },
  { id: "dress-bodycon", slot: "dress", name: "Đầm ôm", tags: ["party", "elegant", "street"], price: 130, colors: FABRIC, color: "red" },
  { id: "dress-aodai", slot: "dress", name: "Áo dài", tags: ["traditional", "elegant"], price: 160, colors: FABRIC, color: "red" },
  { id: "dress-princess", slot: "dress", name: "Đầm công chúa", tags: ["fairy", "cute", "party"], price: 180, colors: FABRIC, color: "sky" },
  { id: "dress-gown", slot: "dress", name: "Đầm dạ hội", tags: ["party", "elegant", "fairy"], price: 240, colors: ALL, color: "purple" },

  // Outerwear
  { id: "outer-denim", slot: "outer", name: "Áo khoác jean", tags: ["street", "cozy"], price: 60, colors: DENIM, color: "sky" },
  { id: "outer-cardigan", slot: "outer", name: "Áo cardigan", tags: ["cute", "cozy", "office"], price: 60, colors: FABRIC, color: "pink" },
  { id: "outer-wind", slot: "outer", name: "Áo khoác gió", tags: ["sporty", "street"], price: 70, colors: FABRIC, color: "orange" },
  { id: "outer-blazer", slot: "outer", name: "Áo blazer", tags: ["office", "elegant"], price: 110, colors: FABRIC, color: "navy" },
  { id: "outer-puffer", slot: "outer", name: "Áo phao", tags: ["cozy", "sporty"], price: 120, colors: FABRIC, color: "white" },
  { id: "outer-trench", slot: "outer", name: "Áo măng tô", tags: ["cozy", "elegant", "office"], price: 150, colors: FABRIC, color: "beige" },

  // Shoes
  { id: "shoes-sneaker", slot: "shoes", name: "Giày thể thao", tags: ["sporty", "street", "cute"], price: 0, colors: FABRIC, color: "white" },
  { id: "shoes-flat", slot: "shoes", name: "Giày búp bê", tags: ["cute", "office", "fairy"], price: 0, colors: FABRIC, color: "pink" },
  { id: "shoes-sandal", slot: "shoes", name: "Dép quai hậu", tags: ["beach", "street"], price: 0, colors: FABRIC, color: "brown" },
  { id: "shoes-boot", slot: "shoes", name: "Bốt cổ cao", tags: ["cozy", "street"], price: 80, colors: FABRIC, color: "brown" },
  { id: "shoes-heel", slot: "shoes", name: "Giày cao gót", tags: ["party", "elegant", "office", "traditional"], price: 90, colors: ALL, color: "black" },
  { id: "shoes-glass", slot: "shoes", name: "Giày pha lê", tags: ["fairy", "party"], price: 150, colors: ["sky", "white", "pink", "lilac", "mint", "gold"], color: "sky" },

  // Bags
  { id: "bag-backpack", slot: "bag", name: "Ba lô", tags: ["cute", "sporty", "street"], price: 0, colors: FABRIC, color: "pink" },
  { id: "bag-cross", slot: "bag", name: "Túi đeo chéo", tags: ["street", "cute", "cozy"], price: 40, colors: FABRIC, color: "brown" },
  { id: "bag-basket", slot: "bag", name: "Giỏ cói", tags: ["beach", "traditional", "cute"], price: 50, colors: ["beige", "brown", "white", "yellow"], color: "beige" },
  { id: "bag-tote", slot: "bag", name: "Túi tote", tags: ["office", "elegant", "beach"], price: 70, colors: FABRIC, color: "black" },
  { id: "bag-clutch", slot: "bag", name: "Ví cầm tay", tags: ["party", "elegant"], price: 90, colors: ALL, color: "gold" },

  // Hats
  { id: "hat-cap", slot: "hat", name: "Mũ lưỡi trai", tags: ["sporty", "street"], price: 0, colors: FABRIC, color: "red" },
  { id: "hat-beanie", slot: "hat", name: "Mũ len", tags: ["cozy", "cute"], price: 40, colors: FABRIC, color: "red" },
  { id: "hat-sun", slot: "hat", name: "Mũ rộng vành", tags: ["beach", "elegant"], price: 60, colors: FABRIC, color: "beige" },
  { id: "hat-beret", slot: "hat", name: "Mũ nồi", tags: ["cute", "elegant", "cozy"], price: 60, colors: FABRIC, color: "red" },
  { id: "hat-nonla", slot: "hat", name: "Nón lá", tags: ["traditional"], price: 70, colors: ["beige", "white", "yellow"], color: "beige" },
  { id: "hat-tiara", slot: "hat", name: "Vương miện", tags: ["fairy", "party"], price: 140, colors: ["gold", "white", "pink", "sky"], color: "gold" },

  // Jewellery and glasses
  { id: "ear-stud", slot: "earrings", name: "Khuyên nụ", tags: ["office", "cute", "elegant"], price: 0, colors: JEWEL, color: "white" },
  { id: "ear-hoop", slot: "earrings", name: "Khuyên tròn", tags: ["street", "party", "beach"], price: 40, colors: JEWEL, color: "gold" },
  { id: "ear-pearl", slot: "earrings", name: "Hoa tai ngọc trai", tags: ["elegant", "party", "traditional"], price: 70, colors: JEWEL, color: "white" },
  { id: "neck-choker", slot: "necklace", name: "Vòng choker", tags: ["street", "party"], price: 40, colors: JEWEL, color: "black" },
  { id: "neck-scarf", slot: "necklace", name: "Khăn quàng", tags: ["cozy", "cute"], price: 50, colors: FABRIC, color: "red" },
  { id: "neck-pendant", slot: "necklace", name: "Dây chuyền mặt đá", tags: ["elegant", "fairy", "cute"], price: 70, colors: JEWEL, color: "sky" },
  { id: "neck-pearl", slot: "necklace", name: "Chuỗi ngọc trai", tags: ["elegant", "traditional", "party", "office"], price: 110, colors: JEWEL, color: "white" },
  { id: "glass-sun", slot: "glasses", name: "Kính râm", tags: ["beach", "street"], price: 0, colors: ["black", "brown", "pink", "red", "sky"], color: "black" },
  { id: "glass-cat", slot: "glasses", name: "Kính mắt mèo", tags: ["party", "elegant", "street"], price: 60, colors: ["black", "red", "pink", "gold", "white"], color: "red" },
  { id: "glass-round", slot: "glasses", name: "Kính gọng tròn", tags: ["office", "cute", "cozy"], price: 40, colors: ["black", "brown", "gold", "pink"], color: "gold" },
];

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const SLOT_BY_ID = new Map(SLOTS.map((slot) => [slot.id, slot]));

export function itemById(id) {
  const item = ITEM_BY_ID.get(id);
  if (!item) throw new Error(`Unknown item "${id}"`);
  return item;
}

export function slotById(id) {
  const slot = SLOT_BY_ID.get(id);
  if (!slot) throw new Error(`Unknown slot "${id}"`);
  return slot;
}

export function itemsInSlot(slotId) {
  return ITEMS.filter((item) => item.slot === slotId);
}

export const STARTER_ITEMS = ITEMS.filter((item) => item.price === 0).map((item) => item.id);

// Body options -------------------------------------------------------------------------------

export const SKIN_TONES = ["#fde3cf", "#f6cfae", "#e7b48c", "#c98e63", "#8d5a3b"];
export const HAIR_COLORS = [
  { id: "black", hex: "#2a2026" },
  { id: "dark", hex: "#4a2f25" },
  { id: "chestnut", hex: "#7b4a2c" },
  { id: "honey", hex: "#c48a3f" },
  { id: "blonde", hex: "#ecc96b" },
  { id: "rose", hex: "#e597b2" },
  { id: "lavender", hex: "#a991d8" },
  { id: "silver", hex: "#cfd2db" },
];
export const EYE_COLORS = ["#3b2a20", "#6b4226", "#2f6db5", "#3f8a5a", "#7a55a8"];

/** Lipstick shades; shows can prefer some. */
export const LIPS = [
  { id: "nude", name: "Nude", hex: "#d98b7b" },
  { id: "pink", name: "Hồng", hex: "#ec6f98" },
  { id: "coral", name: "San hô", hex: "#f2775a" },
  { id: "red", name: "Đỏ", hex: "#cf2238" },
  { id: "berry", name: "Mận", hex: "#9b2b5a" },
];
