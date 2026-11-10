/** The career: 12 themed shows and the three judges. */

/**
 * styles: what the theme wants (tag → weight; an item scores its best matching weights, capped at 1).
 * avoid: tags that look wrong here. colors: the theme's palette. needs: slots that must be worn.
 * trend: one item the blogger judge is hoping to see. lips: lipstick that suits the theme.
 * time: seconds in the studio. needStars: total stars required to enter (on top of the previous
 * show having at least one star).
 */
export const SHOWS = [
  {
    id: "school", name: "Ngày đầu đến trường", icon: "🎒",
    brief: "Buổi sáng đầu tiên ở trường mới. Gọn gàng, tươi tắn và thật dễ thương.",
    styles: { cute: 1, office: 0.5, street: 0.4 }, avoid: ["party", "beach"],
    colors: ["white", "navy", "pink", "sky", "lilac", "beige"], needs: ["bag"],
    trend: "bag-backpack", lips: ["nude", "pink"], time: 150, needStars: 0,
    stage: ["#ffe7ef", "#ffd0dd"],
  },
  {
    id: "beach", name: "Dạo biển mùa hè", icon: "🏖️",
    brief: "Nắng vàng, cát trắng, gió biển. Mặc thật mát và rực rỡ!",
    styles: { beach: 1, cute: 0.5, street: 0.3 }, avoid: ["cozy", "office"],
    colors: ["yellow", "orange", "sky", "mint", "white", "pink"], needs: [],
    trend: "hat-sun", lips: ["coral", "pink"], time: 150, needStars: 0,
    stage: ["#d9f3ff", "#ffe9b8"],
  },
  {
    id: "interview", name: "Buổi phỏng vấn đầu tiên", icon: "💼",
    brief: "Ấn tượng đầu tiên rất quan trọng: chỉn chu, tối giản, tông màu trung tính.",
    styles: { office: 1, elegant: 0.6 }, avoid: ["beach", "party", "sporty"],
    colors: ["white", "black", "gray", "navy", "beige"], needs: ["shoes"],
    trend: "outer-blazer", lips: ["nude"], time: 140, needStars: 0,
    stage: ["#eef1f6", "#d7dde8"],
  },
  {
    id: "jogging", name: "Chạy bộ công viên", icon: "🏃‍♀️",
    brief: "Buổi sáng tràn năng lượng: thoải mái, dễ vận động và nổi bật.",
    styles: { sporty: 1, street: 0.4 }, avoid: ["party", "elegant", "traditional"],
    colors: ["orange", "mint", "pink", "white", "black", "blue"], needs: ["shoes"],
    trend: "hat-cap", lips: ["nude", "coral"], time: 130, needStars: 0,
    stage: ["#e4f7e9", "#c6ecd2"],
  },
  {
    id: "cafe", name: "Cà phê cuối tuần", icon: "☕",
    brief: "Hẹn bạn thân ở quán cà phê nhỏ. Cá tính mà vẫn dễ thương.",
    styles: { street: 1, cute: 0.7, cozy: 0.4 }, avoid: ["party", "traditional"],
    colors: ["beige", "brown", "white", "black", "lilac", "mint", "sky"], needs: ["bag"],
    trend: "bag-cross", lips: ["pink", "coral", "nude"], time: 130, needStars: 1,
    stage: ["#f6eadf", "#e8d4bf"],
  },
  {
    id: "winter", name: "Mùa đông cao nguyên", icon: "❄️",
    brief: "Sương lạnh trên đồi thông. Ấm áp nhiều lớp, tông màu trầm ấm.",
    styles: { cozy: 1, elegant: 0.4, cute: 0.4 }, avoid: ["beach", "sporty"],
    colors: ["beige", "brown", "red", "white", "gray", "navy"], needs: ["outer", "shoes"],
    trend: "neck-scarf", lips: ["berry", "red", "nude"], time: 130, needStars: 3,
    stage: ["#eaf1f8", "#cfdcea"],
  },
  {
    id: "tet", name: "Tết sum vầy", icon: "🏮",
    brief: "Áo mới ngày Tết đi chúc Tết ông bà. Duyên dáng và rạng rỡ.",
    styles: { traditional: 1, elegant: 0.6 }, avoid: ["sporty", "beach", "street"],
    colors: ["red", "yellow", "gold", "pink", "white"], needs: ["shoes"],
    trend: "hat-nonla", lips: ["red", "coral"], time: 120, needStars: 5,
    stage: ["#fff0d6", "#ffd6a8"],
  },
  {
    id: "festival", name: "Lễ hội âm nhạc", icon: "🎸",
    brief: "Ánh đèn, sân khấu ngoài trời và đám đông. Càng cá tính càng tốt!",
    styles: { street: 1, party: 0.6, sporty: 0.3 }, avoid: ["office", "traditional"],
    colors: ["black", "purple", "pink", "orange", "yellow", "blue"], needs: ["shoes"],
    trend: "glass-sun", lips: ["berry", "red", "pink"], time: 120, needStars: 7,
    stage: ["#2c2148", "#5b2a6e"],
  },
  {
    id: "birthday", name: "Tiệc sinh nhật bạn thân", icon: "🎂",
    brief: "Bóng bay, bánh kem và rất nhiều ảnh. Ngọt ngào và lung linh.",
    styles: { party: 1, cute: 0.8 }, avoid: ["sporty", "office"],
    colors: ["pink", "lilac", "white", "gold", "sky", "mint"], needs: ["shoes"],
    trend: "bottom-tutu", lips: ["pink", "coral"], time: 115, needStars: 10,
    stage: ["#ffe3f1", "#f7c6e3"],
  },
  {
    id: "fairy", name: "Vũ hội cổ tích", icon: "🏰",
    brief: "Lâu đài lấp lánh dưới trăng. Hãy hóa thân thành nàng công chúa.",
    styles: { fairy: 1, elegant: 0.6, party: 0.4 }, avoid: ["sporty", "street", "office"],
    colors: ["sky", "lilac", "white", "pink", "gold", "mint"], needs: ["shoes"],
    trend: "hat-tiara", lips: ["pink", "nude"], time: 110, needStars: 13,
    stage: ["#e5e4ff", "#c6d4ff"],
  },
  {
    id: "redcarpet", name: "Thảm đỏ lễ trao giải", icon: "📸",
    brief: "Hàng trăm ống kính chĩa vào bạn. Sang trọng, quyền lực, tối giản màu sắc.",
    styles: { party: 1, elegant: 1 }, avoid: ["sporty", "cute", "beach", "cozy"],
    colors: ["black", "red", "gold", "white", "navy"], needs: ["shoes", "earrings"],
    trend: "bag-clutch", lips: ["red", "berry"], time: 105, needStars: 16,
    stage: ["#3a0d14", "#7a1426"],
  },
  {
    id: "final", name: "Chung kết Siêu Mẫu", icon: "👑",
    brief: "Đêm chung kết! Ban giám khảo muốn thấy đẳng cấp: thanh lịch tuyệt đối, chi tiết hoàn hảo.",
    styles: { elegant: 1, party: 0.7, fairy: 0.4 }, avoid: ["sporty", "beach", "street", "office", "cozy"],
    colors: ["white", "black", "gold", "purple", "navy", "lilac"], needs: ["shoes", "earrings", "necklace"],
    trend: "dress-gown", lips: ["red", "berry", "nude"], time: 100, needStars: 20,
    stage: ["#1a1430", "#3d2a63"],
  },
];

/** Each judge weighs the score components differently (weights sum to 1). */
export const JUDGES = [
  { id: "designer", name: "Cô Vy", role: "Nhà thiết kế", icon: "✂️", weights: { style: 0.6, color: 0.2, complete: 0.2 } },
  { id: "photographer", name: "Anh Khoa", role: "Nhiếp ảnh gia", icon: "📷", weights: { style: 0.25, color: 0.55, complete: 0.2 } },
  { id: "blogger", name: "Bé Mây", role: "Fashion blogger", icon: "📱", weights: { style: 0.35, color: 0.1, complete: 0.1, detail: 0.3, trend: 0.15 } },
];

/** Star thresholds on the 0–30 total. */
export const STAR_SCORES = [17, 22, 26];

/** Total stars → career title. */
export const RANKS = [
  { stars: 0, name: "Người mẫu tập sự" },
  { stars: 5, name: "Người mẫu ảnh" },
  { stars: 12, name: "Gương mặt trang bìa" },
  { stars: 20, name: "Ngôi sao sàn diễn" },
  { stars: 28, name: "Siêu mẫu" },
  { stars: 36, name: "Huyền thoại thời trang" },
];

export function showById(id) {
  const show = SHOWS.find((s) => s.id === id);
  if (!show) throw new Error(`Unknown show "${id}"`);
  return show;
}

export function rankFor(stars) {
  let rank = RANKS[0];
  for (const r of RANKS) if (stars >= r.stars) rank = r;
  return rank;
}
