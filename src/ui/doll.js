/**
 * The paper doll and every item, drawn as SVG markup strings (no DOM, so it is unit-tested).
 * Body space: viewBox 0 0 200 420, facing the viewer, centre line x = 100.
 * Left-side shapes are written once and mirrored with `mirror()`.
 */

import { HAIR_COLORS, LIPS, itemById } from "../core/catalog.js";
import { colorById, shade } from "../core/palette.js";

export const VIEW = "0 0 200 372";

/**
 * Chibi proportions. Everything is drawn in one "body space" (a fashion-doll figure), then the head
 * layers (head, face, hair, hat, earrings, glasses) are scaled up around the chin and the body
 * layers (body, clothes, shoes, bag, necklace) are squashed around the neck. Clothes keep fitting
 * because they scale with the body.
 */
export const CHIBI = { head: 1.6, bodyX: 0.84, bodyY: 0.66, dy: 60 };
const HEAD_T = `translate(100 ${104 + CHIBI.dy}) scale(${CHIBI.head}) translate(-100 -104)`;
const BODY_T = `translate(100 ${112 + CHIBI.dy}) scale(${CHIBI.bodyX} ${CHIBI.bodyY}) translate(-100 -112)`;
const inHead = (markup) => (markup ? `<g transform="${HEAD_T}">${markup}</g>` : "");
const inBody = (markup) => (markup ? `<g transform="${BODY_T}">${markup}</g>` : "");

/** Mirror an absolute path (M/L/Q/C/Z with x,y pairs) across x = 100. */
export function mirror(d) {
  return d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, cmd, args) => {
    const nums = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    const out = [];
    for (let i = 0; i < nums.length; i += 2) out.push(`${round(200 - nums[i])} ${nums[i + 1]}`);
    return out.length ? `${cmd} ${out.join(" ")} ` : `${cmd} `;
  }).trim();
}

const round = (n) => Math.round(n * 100) / 100;

function path(d, fill, extra = "") {
  return `<path d="${d}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}
function both(d, fill, extra = "") {
  return path(d, fill, extra) + path(mirror(d), fill, extra);
}
function line(d, stroke, width = 1.2, extra = "") {
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra ? ` ${extra}` : ""}/>`;
}
function lines(d, stroke, width, extra) {
  return line(d, stroke, width, extra) + line(mirror(d), stroke, width, extra);
}
function circle(cx, cy, r, fill, extra = "") {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}
function ellipse(cx, cy, rx, ry, fill, extra = "") {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}
const outline = (c) => `stroke="${shade(c, -0.35)}" stroke-width="1.1" stroke-linejoin="round"`;

/** Shapes and colours shared by many items. */
function palette(hex) {
  return { c: hex, d: shade(hex, -0.2), l: shade(hex, 0.3), o: outline(hex) };
}

// Body -----------------------------------------------------------------------------------------

const BODY = {
  torso: "M100 112 C 118 112 132 116 136 124 L 126 190 L 131 226 L 69 226 L 74 190 L 64 124 C 68 116 82 112 100 112 Z",
  arm: "M66 122 C 58 126 54 146 53 168 L 50 228 L 58 230 L 63 174 L 72 138 Z",
  leg: "M70 222 L 99 222 L 97 300 L 94 384 L 84 384 L 79 300 Z",
  neck: "M92 90 L 108 90 L 109 116 L 91 116 Z",
};

function body(look) {
  const s = look.skin;
  return bodySkin(look) + headSkin(look);
}

function bodySkin(look) {
  const s = look.skin;
  const sd = shade(s, -0.14);
  const o = `stroke="${shade(s, -0.3)}" stroke-width="0.9"`;
  return [
    both(BODY.leg, s, o),
    ellipse(88, 390, 8, 5, s, o),
    ellipse(112, 390, 8, 5, s, o),
    both(BODY.arm, s, o),
    ellipse(54, 234, 5, 7, s, o),
    ellipse(146, 234, 5, 7, s, o),
    path(BODY.torso, s, o),
    path(BODY.neck, s, o),
    path("M92 104 Q 100 112 108 104 L 108 112 Q 100 116 92 112 Z", sd, 'opacity="0.5"'),
  ].join("");
}

/** Round anime face with soft cheeks and a small chin. */
const FACE = "M75 66 Q 75 41 100 41 Q 125 41 125 66 Q 125 86 112 95 Q 100 102 88 95 Q 75 86 75 66 Z";

function headSkin(look) {
  const s = look.skin;
  const o = `stroke="${shade(s, -0.3)}" stroke-width="0.8"`;
  return ellipse(75.5, 76, 3.5, 5.5, s, o) + ellipse(124.5, 76, 3.5, 5.5, s, o) + path(FACE, s, o);
}

/** Plain slip and shorts, always under the clothes, so the doll is never bare. */
function underlayer() {
  const c = "#fff3f6";
  const o = 'stroke="#e9c6d0" stroke-width="0.9"';
  return path("M84 120 Q 100 128 116 120 L 126 190 L 74 190 Z", c, o) +
    path("M74 188 L 126 188 L 130 226 L 103 232 L 100 226 L 97 232 L 70 226 Z", c, o);
}

/** Big sparkly anime eyes, a tiny nose and mouth, rosy cheeks. */
function face(look) {
  const iris = look.eyes;
  const hair = hairHex(look);
  const lip = (LIPS.find((l) => l.id === look.lips) ?? LIPS[0]).hex;
  const lash = "#2a1a24";
  const eye = (x, side) =>
    ellipse(x, 77.5, 6.6, 8.4, "#ffffff", `stroke="${shade(look.skin, -0.25)}" stroke-width="0.4"`) +
    ellipse(x, 78.6, 5.4, 7.2, shade(iris, -0.35)) +
    ellipse(x, 79.6, 4.6, 6, iris) +
    path(`M${x - 4.3} 81 Q ${x} 87 ${x + 4.3} 81 Q ${x} 84 ${x - 4.3} 81 Z`, shade(iris, 0.45), 'opacity="0.9"') +
    ellipse(x, 78.4, 2.3, 3.1, "#170d16") +
    ellipse(x + 2 * side, 75, 2.1, 2.6, "#ffffff") +
    circle(x - 2.2 * side, 82.2, 1.1, "#ffffff") +
    circle(x + 3 * side, 80.4, 0.6, "#ffffff");
  return [
    eye(89.5, 1),
    eye(110.5, 1),
    // Upper lash line with a flick, lower lash hint
    lines("M82.4 74.5 Q 85 69.4 90 69.2 Q 94.6 69.4 97 72.6", lash, 2.2),
    lines("M82.6 74.4 L 79.6 72.6 M83 73 L 80.6 70", lash, 1.1),
    lines("M85 86.4 Q 89.5 87.6 94 86.4", shade(lash, 0.3), 0.6),
    lines("M83.6 63.6 Q 89 61.2 95 62.6", shade(hair, -0.1), 1.3),
    line("M100 86.6 L 99.2 88", shade(look.skin, -0.3), 0.9),
    path("M96.6 92.2 Q 100 91.2 103.4 92.2 Q 100 95.8 96.6 92.2 Z", lip),
    line("M97 92.4 Q 100 93.4 103 92.4", shade(lip, -0.35), 0.5),
    look.blush
      ? ellipse(83.5, 88, 5.4, 2.8, "#ff7f98", 'opacity="0.38"') + ellipse(116.5, 88, 5.4, 2.8, "#ff7f98", 'opacity="0.38"') +
        lines("M81 88.6 L 82.4 86.8 M83.6 88.8 L 85 87 M86.2 88.6 L 87.6 86.8", "#ff6f8e", 0.5, 'opacity="0.6"')
      : "",
  ].join("");
}

function hairHex(look) {
  return (HAIR_COLORS.find((h) => h.id === look.hairColor) ?? HAIR_COLORS[0]).hex;
}

// Hair -------------------------------------------------------------------------------------------

const CAP = "M73 76 Q 70 38 100 37 Q 130 38 127 76 Q 122 54 100 52 Q 78 54 73 76 Z";

const HAIR = {
  "hair-long": (h) => ({
    back: path("M72 66 Q 70 34 100 34 Q 130 34 128 66 L 133 150 Q 118 157 100 153 Q 82 157 67 150 Z", h.c, h.o),
    front:
      path("M73 78 Q 70 38 100 37 Q 130 38 127 78 Q 126 58 116 50 Q 100 62 80 58 Q 76 66 73 78 Z", h.c, h.o) +
      both("M75 70 Q 69 102 73 130 L 82 126 Q 79 100 81 78 Z", h.c, h.o) +
      line("M104 42 Q 112 46 118 52", h.l, 1.4),
  }),
  "hair-pony": (h) => ({
    back: path("M116 46 Q 151 54 147 100 Q 145 124 134 140 Q 137 104 122 66 Z", h.c, h.o),
    front: path(CAP, h.c, h.o) + circle(121, 48, 4, "#ff6f91") + line("M86 44 Q 98 40 110 42", h.l, 1.4),
  }),
  "hair-bob": (h) => ({
    back: path("M71 70 Q 68 34 100 34 Q 132 34 129 70 L 131 104 Q 118 108 114 100 L 86 100 Q 82 108 69 104 Z", h.c, h.o),
    front: path("M73 74 Q 70 37 100 37 Q 130 37 127 74 L 125 62 Q 100 57 75 62 Z", h.c, h.o) + line("M84 44 Q 100 40 116 44", h.l, 1.4),
  }),
  "hair-twin": (h) => ({
    back: both("M78 54 Q 49 70 53 124 Q 59 135 67 124 Q 64 92 82 66 Z", h.c, h.o),
    front:
      path("M73 76 Q 70 38 100 37 Q 130 38 127 76 Q 120 52 100 50 Q 80 52 73 76 Z", h.c, h.o) +
      line("M100 38 L 100 50", h.d, 1.2) +
      circle(77, 58, 4.5, "#ff6f91") + circle(123, 58, 4.5, "#ff6f91"),
  }),
  "hair-bun": (h) => ({
    back: circle(100, 32, 15, h.c, h.o) + path("M72 70 Q 70 36 100 36 Q 130 36 128 70 Z", h.c, h.o),
    front:
      path("M73 74 Q 70 38 100 37 Q 130 38 127 74 Q 118 50 100 50 Q 82 50 73 74 Z", h.c, h.o) +
      lines("M80 60 Q 88 46 100 44", h.d, 1) +
      line("M110 22 L 122 28", "#d6ab48", 2) + circle(123, 28, 2.2, "#e03a4b"),
  }),
  "hair-curly": (h) => ({
    back: [
      [72, 60, 16], [128, 60, 16], [66, 88, 15], [134, 88, 15], [70, 112, 13], [130, 112, 13],
      [100, 38, 20], [80, 40, 16], [120, 40, 16],
    ].map(([x, y, r]) => circle(x, y, r, h.c, h.o)).join(""),
    front: [[84, 47, 10], [100, 44, 11], [116, 47, 10], [76, 58, 8], [124, 58, 8]]
      .map(([x, y, r]) => circle(x, y, r, h.c, h.o)).join("") + line("M94 40 Q 100 37 106 40", h.l, 1.4),
  }),
  "hair-braid": (h) => {
    let braid = "";
    for (let i = 0; i < 5; i += 1) {
      braid += ellipse(78 + (i % 2 ? 3 : 0) + i * 0.6, 96 + i * 13, 7, 9, h.c, h.o);
    }
    return {
      back: path("M72 70 Q 70 36 100 36 Q 130 36 128 70 Z", h.c, h.o),
      front: path("M73 78 Q 70 38 100 37 Q 130 38 127 70 Q 116 50 96 52 Q 80 58 73 78 Z", h.c, h.o) +
        braid + circle(81.5, 160, 3.5, "#ff6f91"),
    };
  },
};

// Clothes ------------------------------------------------------------------------------------------

const SLEEVES_LONG = "C 145 140 149 172 149 224 L 140 226 L 134 160 L 127 150";
const SLEEVES_LONG_L = "L 73 150 L 66 160 L 60 226 L 51 224 C 51 172 55 140 63 125";

const ART = {
  // Tops
  "top-tee": ({ c, d, l, o }) =>
    path("M88 113 Q 100 124 112 113 C 124 114 134 118 137 125 L 146 150 L 133 156 L 127 145 L 125 206 L 75 206 L 73 145 L 67 156 L 54 150 L 63 125 C 66 118 76 114 88 113 Z", c, o) +
    line("M88 113 Q 100 124 112 113", d, 2) + lines("M66 151 L 54 147", l, 1.2),
  "top-blouse": ({ c, d, l, o }) =>
    path(`M89 113 L 100 125 L 111 113 C 124 114 134 118 137 125 ${SLEEVES_LONG} L 125 208 L 75 208 ${SLEEVES_LONG_L} C 66 118 76 114 89 113 Z`, c, o) +
    both("M89 113 L 100 125 L 93 131 L 85 116 Z", l, o) +
    [140, 158, 176, 194].map((y) => circle(100, y, 1.6, d)).join("") +
    lines("M51 220 L 60 222", d, 1.4),
  "top-tank": ({ c, d, l, o }) =>
    path("M90 114 Q 100 126 110 114 L 116 114 L 128 128 L 125 202 L 75 202 L 72 128 L 84 114 Z", c, o) +
    lines("M75 132 L 77 200", l, 2.4) + line("M90 114 Q 100 126 110 114", d, 1.6),
  "top-crop": ({ c, d, l, o }) =>
    path("M88 113 Q 100 124 112 113 C 124 114 134 118 137 125 L 145 148 L 133 153 L 128 143 L 126 178 L 74 178 L 72 143 L 67 153 L 55 148 L 63 125 C 66 118 76 114 88 113 Z", c, o) +
    line("M76 174 L 124 174", d, 1.6) + path("M94 140 L 100 134 L 106 140 L 100 152 Z", l),
  "top-sweater": ({ c, d, l, o }) =>
    path("M88 112 Q 100 120 112 112 C 126 113 137 118 140 126 C 148 142 152 172 152 222 L 140 224 L 135 162 L 129 152 L 129 212 L 71 212 L 71 152 L 65 162 L 60 224 L 48 222 C 48 172 52 142 60 126 C 63 118 74 113 88 112 Z", c, o) +
    path("M71 204 L 129 204 L 129 213 L 71 213 Z", d, o) +
    line("M88 112 Q 100 121 112 112", d, 3) +
    lines("M92 126 L 92 202", d, 1.2, 'stroke-dasharray="3 3"') +
    lines("M48 216 L 60 218", d, 3) + circle(100, 160, 4, l),
  "top-offshoulder": ({ c, d, l, o }) =>
    path("M64 132 L 136 132 L 127 150 L 125 204 L 75 204 L 73 150 Z", c, o) +
    ellipse(61, 141, 9, 8, c, o) + ellipse(139, 141, 9, 8, c, o) +
    path("M60 128 Q 66 140 72 130 Q 78 142 84 130 Q 90 142 96 130 Q 100 142 104 130 Q 110 142 116 130 Q 122 142 128 130 Q 134 142 140 128 L 140 124 L 60 124 Z", l, o) +
    line("M76 200 L 124 200", d, 1.4),

  // Bottoms
  "bottom-jeans": ({ c, d, l, o }) =>
    path("M73 194 L 127 194 L 131 226 L 120 386 L 104 386 L 100 238 L 96 386 L 80 386 L 69 226 Z", c, o) +
    line("M73 201 L 127 201", d, 1.4) + line("M100 201 L 100 236", d, 1.2) +
    lines("M78 206 Q 84 214 90 206", d, 1.1) + lines("M81 378 L 96 378", l, 1.4) +
    lines("M86 240 L 84 370", l, 0.8, 'stroke-dasharray="2 3"'),
  "bottom-pleated": ({ c, d, o }) =>
    path("M75 194 L 125 194 L 142 262 L 58 262 Z", c, o) + path("M75 194 L 125 194 L 126 201 L 74 201 Z", d) +
    [[84, 72], [92, 86], [100, 100], [108, 114], [116, 128]].map(([a, b]) => line(`M${a} 202 L ${b} 261`, d, 1)).join(""),
  "bottom-shorts": ({ c, d, l, o }) =>
    path("M73 194 L 127 194 L 132 232 L 133 252 L 104 252 L 100 236 L 96 252 L 67 252 L 68 232 Z", c, o) +
    line("M73 201 L 127 201", d, 1.4) + lines("M68 246 L 96 246", l, 1.4),
  "bottom-leggings": ({ c, l, o }) =>
    path("M73 194 L 127 194 L 131 226 L 117 382 L 104 382 L 100 238 L 96 382 L 83 382 L 69 226 Z", c, o) +
    lines("M71 210 L 84 378", l, 2),
  "bottom-pencil": ({ c, d, l, o }) =>
    path("M75 194 L 125 194 L 131 226 L 124 292 L 76 292 L 69 226 Z", c, o) +
    path("M75 194 L 125 194 L 126 201 L 74 201 Z", d) + line("M112 292 L 112 272", d, 1.2) + line("M84 210 Q 82 250 84 286", l, 1),
  "bottom-wide": ({ c, d, l, o }) =>
    path("M73 194 L 127 194 L 133 226 L 142 388 L 104 388 L 100 242 L 96 388 L 58 388 L 67 226 Z", c, o) +
    path("M73 194 L 127 194 L 128 202 L 72 202 Z", d) + circle(100, 198, 2.4, "#d6ab48") +
    lines("M80 214 L 76 384", l, 1) + lines("M90 230 L 88 384", d, 0.8),
  "bottom-tutu": ({ c, d, l, o }) =>
    path("M76 194 L 124 194 L 154 254 Q 140 260 128 256 Q 114 264 100 258 Q 86 264 72 256 Q 60 260 46 254 Z", l, o) +
    path("M76 194 L 124 194 L 146 244 Q 134 250 122 246 Q 110 252 100 248 Q 90 252 78 246 Q 66 250 54 244 Z", c, o) +
    path("M76 192 L 124 192 L 124 200 L 76 200 Z", d) +
    [64, 82, 100, 118, 136].map((x) => circle(x, 236, 1.4, "#ffffff", 'opacity="0.8"')).join(""),

  // Dresses
  "dress-sun": ({ c, d, l, o }) =>
    lines("M86 116 L 86 138", d, 1.6) +
    path("M80 134 Q 100 142 120 134 L 124 194 L 146 292 Q 100 302 54 292 L 76 194 Z", c, o) +
    line("M76 194 Q 100 200 124 194", d, 2) +
    line("M56 288 Q 100 298 144 288", l, 2) +
    [[88, 220], [110, 236], [80, 260], [104, 270], [126, 262], [94, 160], [110, 176]].map(([x, y]) => circle(x, y, 2.6, l)).join(""),
  "dress-shirt": ({ c, d, l, o }) =>
    path(`M89 113 L 100 125 L 111 113 C 124 114 134 118 137 125 ${SLEEVES_LONG} L 125 196 L 140 286 L 60 286 L 75 196 ${SLEEVES_LONG_L} C 66 118 76 114 89 113 Z`, c, o) +
    both("M89 113 L 100 125 L 93 131 L 85 116 Z", l, o) +
    path("M74 191 L 126 191 L 126 199 L 74 199 Z", d) +
    [138, 154, 170].map((y) => circle(100, y, 1.6, d)).join("") +
    lines("M84 204 L 74 284", d, 0.9),
  "dress-bodycon": ({ c, d, l, o }) =>
    path("M86 116 Q 100 128 114 116 L 132 124 L 125 192 L 131 226 L 125 302 L 75 302 L 69 226 L 75 192 L 68 124 Z", c, o) +
    line("M80 140 Q 76 190 82 290", l, 1.6, 'opacity="0.7"') + line("M78 192 Q 100 198 122 192", d, 1),
  "dress-aodai": ({ c, d, l, o }) =>
    path("M73 194 L 127 194 L 133 226 L 142 388 L 104 388 L 100 242 L 96 388 L 58 388 L 67 226 Z", "#fbf8f2", outline("#e5ddd0")) +
    path(`M92 97 L 108 97 L 109 114 C 124 114 134 118 137 125 ${SLEEVES_LONG} L 125 198 L 120 214 L 117 370 L 83 370 L 80 214 L 75 198 ${SLEEVES_LONG_L} C 66 118 76 114 91 114 Z`, c, o) +
    path("M92 97 L 108 97 L 108 112 L 92 112 Z", c, o) + line("M92 101 L 108 101", d, 1) +
    line("M100 114 Q 116 118 126 134", d, 1.2) +
    [[92, 250], [108, 290], [94, 330], [106, 220]].map(([x, y]) =>
      [0, 72, 144, 216, 288].map((a) => circle(round(x + 4 * Math.cos((a * Math.PI) / 180)), round(y + 4 * Math.sin((a * Math.PI) / 180)), 2.4, l)).join("") + circle(x, y, 1.8, "#d6ab48"),
    ).join(""),
  "dress-princess": ({ c, d, l, o }) =>
    path("M76 188 L 124 188 Q 150 250 164 334 Q 100 348 36 334 Q 50 250 76 188 Z", c, o) +
    [[88, 60], [100, 100], [112, 140]].map(([a, b]) => line(`M${a} 196 Q ${(a + b) / 2} 270 ${b} 336`, d, 1)).join("") +
    line("M40 330 Q 100 344 160 330", l, 3) +
    path("M86 114 Q 100 124 114 114 L 130 122 L 124 194 L 76 194 L 70 122 Z", c, o) +
    ellipse(63, 129, 11, 10, l, o) + ellipse(137, 129, 11, 10, l, o) +
    path("M100 190 L 86 182 L 86 198 Z", l, o) + path("M100 190 L 114 182 L 114 198 Z", l, o) + circle(100, 190, 3, d) +
    [[62, 300], [80, 270], [122, 280], [140, 310], [100, 320]].map(([x, y]) => sparkle(x, y, 3, "#ffffff")).join(""),
  "dress-gown": ({ c, d, l, o }) =>
    path("M80 128 Q 90 122 100 130 Q 110 122 120 128 L 124 194 Q 132 260 170 398 Q 100 412 30 398 Q 68 260 76 194 Z", c, o) +
    line("M76 194 Q 100 200 124 194", d, 1.4) +
    [[90, 70], [100, 100], [110, 130]].map(([a, b]) => line(`M${a} 204 Q ${(a + b) / 2} 300 ${b} 400`, d, 1.1)).join("") +
    [[88, 150], [112, 170], [70, 300], [130, 330], [100, 250], [56, 380], [146, 370]].map(([x, y]) => sparkle(x, y, 2.6, "#ffffff")).join("") +
    line("M86 130 Q 92 128 98 134", l, 1.4),

  // Outerwear
  "outer-denim": ({ c, d, l, o }) =>
    openJacket(c, o, 204) + both("M88 113 L 94 140 L 84 132 L 80 118 Z", d, o) +
    both("M76 140 L 90 140 L 90 150 L 76 150 Z", d, o) + lines("M72 196 L 95 196", l, 1, 'stroke-dasharray="2 2"') +
    lines("M63 218 L 52 216", l, 1.6),
  "outer-cardigan": ({ c, d, l, o }) =>
    openJacket(c, o, 222) + lines("M71 214 L 96 214", d, 3) +
    [140, 160, 180, 200].map((y) => circle(93, y, 1.8, l)).join("") + lines("M50 218 L 61 220", d, 3),
  "outer-wind": ({ c, d, l, o }) =>
    path("M86 111 Q 100 118 114 111 C 126 113 136 118 139 126 C 147 142 151 172 151 224 L 140 226 L 135 162 L 129 152 L 128 210 L 72 210 L 71 152 L 65 162 L 60 226 L 49 224 C 49 172 53 142 61 126 C 64 118 74 113 86 111 Z", c, o) +
    path("M88 104 L 112 104 L 114 114 L 86 114 Z", d, o) + line("M100 114 L 100 210", d, 1.6) +
    lines("M62 128 C 56 150 53 180 52 222", l, 3) + lines("M78 204 L 96 204", d, 1),
  "outer-blazer": ({ c, d, l, o }) =>
    openJacket(c, o, 214) + both("M88 113 L 96 150 L 86 136 L 80 118 Z", d, o) +
    circle(93, 180, 2, d) + circle(93, 196, 2, d) + lines("M75 186 L 86 186", d, 1.2),
  "outer-puffer": ({ c, d, l, o }) =>
    path("M84 108 Q 100 118 116 108 C 132 110 142 118 146 128 C 156 150 158 180 158 232 L 144 234 L 138 170 L 132 162 L 134 282 L 66 282 L 68 162 L 62 170 L 56 234 L 42 232 C 42 180 44 150 54 128 C 58 118 68 110 84 108 Z", c, o) +
    [138, 162, 186, 210, 234, 258].map((y) => line(`M68 ${y} Q 100 ${y + 4} 132 ${y}`, d, 1.2)).join("") +
    lines("M46 160 Q 52 162 58 160", d, 1) + lines("M44 200 Q 50 202 57 200", d, 1) +
    line("M100 116 L 100 282", d, 1.4) + path("M84 108 Q 100 118 116 108 L 118 98 Q 100 106 82 98 Z", l, o),
  "outer-trench": ({ c, d, l, o }) =>
    openJacket(c, o, 300, true) + both("M88 113 L 97 146 L 85 134 L 79 117 Z", d, o) +
    path("M70 196 L 130 196 L 130 204 L 70 204 Z", d, o) + path("M94 194 L 106 194 L 106 206 L 94 206 Z", "none", outline(l)) +
    [160, 176].map((y) => circle(91, y, 1.8, d) + circle(109, y, 1.8, d)).join(""),

  // Shoes (front view, both feet)
  "shoes-sneaker": ({ c, d, o }) =>
    both("M80 381 L 96 381 Q 99 390 98 396 L 77 397 Q 74 393 78 387 Z", c, o) +
    both("M76 395 L 99 394 L 99 400 L 76 401 Z", "#f4f4f4", outline("#cccccc")) +
    lines("M82 385 L 94 385", d, 1) + lines("M82 389 L 94 389", d, 1),
  "shoes-flat": ({ c, d, o }) =>
    both("M80 384 L 96 384 Q 99 392 97 398 L 79 398 Q 77 392 80 384 Z", c, o) +
    both("M85 385 L 88 388 L 91 385 L 88 386 Z", d) + circle(88, 386.5, 1.4, d) + circle(112, 386.5, 1.4, d),
  "shoes-sandal": ({ c, d }) =>
    lines("M81 387 L 95 387", c, 3) + lines("M80 393 L 96 393", c, 3) +
    both("M78 397 L 98 397 L 98 401 L 78 401 Z", d),
  "shoes-boot": ({ c, d, l, o }) =>
    both("M78 326 L 97 326 L 97 384 Q 99 392 98 398 L 77 398 Q 75 390 79 380 Z", c, o) +
    both("M77 326 L 98 326 L 98 334 L 77 334 Z", d, o) + lines("M80 392 L 96 392", l, 1),
  "shoes-heel": ({ c, d, l, o }) =>
    both("M81 380 L 95 380 Q 98 389 95 396 L 81 396 Q 78 389 81 380 Z", c, o) +
    lines("M86 396 L 87 405", d, 2.4) + lines("M84 384 Q 88 382 92 384", l, 1),
  "shoes-glass": ({ c, o }) =>
    both("M81 380 L 95 380 Q 98 389 95 396 L 81 396 Q 78 389 81 380 Z", c, `${o} opacity="0.75"`) +
    lines("M86 396 L 87 405", c, 2.4) + sparkle(84, 386, 2.4, "#ffffff") + sparkle(116, 386, 2.4, "#ffffff"),

  // Bags
  "bag-backpack": ({ c, d, l, o }) => ({
    back: `<rect x="58" y="118" width="84" height="96" rx="16" fill="${c}" ${o}/>`,
    front: lines("M82 116 Q 78 150 82 188", d, 5) + lines("M80 160 L 84 160", l, 2),
  }),
  "bag-cross": ({ c, d, l, o }) =>
    line("M80 116 L 128 206", d, 2.4) +
    `<rect x="118" y="202" width="28" height="22" rx="5" fill="${c}" ${o}/>` +
    path("M118 206 Q 132 216 146 206 L 146 202 L 118 202 Z", d) + circle(132, 211, 1.8, l),
  "bag-basket": ({ c, d, o }) =>
    line("M136 238 Q 148 212 160 238", d, 3) +
    path("M131 236 L 165 236 L 160 264 L 136 264 Z", c, o) +
    [242, 248, 254, 260].map((y) => line(`M133 ${y} L 163 ${y}`, d, 0.9)).join("") +
    [138, 144, 150, 156].map((x) => line(`M${x} 236 L ${x + 1} 264`, d, 0.7)).join("") +
    circle(140, 238, 3, "#f491b4") + circle(146, 236, 2.5, "#f5cf45"),
  "bag-tote": ({ c, d, l, o }) =>
    line("M138 234 Q 146 212 156 234", d, 2.6) +
    path("M129 232 L 165 232 L 168 274 L 126 274 Z", c, o) + line("M131 240 L 163 240", l, 1.2),
  "bag-clutch": ({ c, d, l, o }) =>
    `<rect x="132" y="226" width="32" height="17" rx="3" fill="${c}" ${o}/>` +
    path("M132 228 L 148 238 L 164 228 Z", d) + circle(148, 236, 2, l),

  // Hats
  "hat-sun": ({ c, d, l, o }) =>
    ellipse(100, 50, 50, 10, c, o) +
    path("M78 50 Q 78 25 100 25 Q 122 25 122 50 Z", c, o) +
    path("M78 43 Q 100 47 122 43 L 122 50 Q 100 54 78 50 Z", d) +
    path("M120 44 L 132 38 L 130 50 Z", d) + line("M64 52 Q 100 58 136 52", l, 1),
  "hat-cap": ({ c, d, l, o }) =>
    path("M74 58 Q 74 29 100 29 Q 126 29 126 58 Z", c, o) +
    path("M74 56 Q 100 72 126 56 Q 100 62 74 56 Z", d, o) + circle(100, 30, 2.2, d) +
    line("M100 30 L 100 56", d, 0.9) + `<rect x="92" y="40" width="16" height="9" rx="2" fill="${l}"/>`,
  "hat-beanie": ({ c, d, l, o }) =>
    circle(100, 26, 8, l, o) +
    path("M73 62 Q 72 30 100 30 Q 128 30 127 62 Z", c, o) +
    `<rect x="71" y="53" width="58" height="11" rx="5" fill="${d}" ${o}/>` +
    [80, 88, 96, 104, 112, 120].map((x) => line(`M${x} 55 L ${x} 62`, shade(d, -0.15), 1)).join(""),
  "hat-beret": ({ c, d, o }) =>
    `<ellipse cx="106" cy="44" rx="31" ry="12" fill="${c}" ${o} transform="rotate(-12 106 44)"/>` +
    line("M106 32 L 108 26", d, 2.4) + line("M80 52 Q 100 56 128 46", d, 1.2),
  "hat-nonla": ({ c, d, l, o }) =>
    line("M76 58 Q 100 114 124 58", "#e05a74", 1.6) +
    path("M100 4 L 162 54 Q 100 64 38 54 Z", c, o) +
    [20, 34, 46].map((y) => line(`M${round(100 - (y - 4) * 1.24)} ${y} Q 100 ${y + 4} ${round(100 + (y - 4) * 1.24)} ${y}`, d, 0.9)).join("") +
    line("M100 4 L 100 60", l, 0.8),
  "hat-tiara": ({ c, d, l, o }) =>
    path("M80 47 L 83 34 L 90 42 L 100 25 L 110 42 L 117 34 L 120 47 Q 100 42 80 47 Z", c, o) +
    circle(100, 36, 3, "#f491b4") + circle(88, 42, 1.8, l) + circle(112, 42, 1.8, l) + sparkle(100, 22, 3, "#ffffff"),

  // Jewellery
  "ear-stud": ({ c, o }) => circle(75, 84, 2.4, c, o) + circle(125, 84, 2.4, c, o),
  "ear-hoop": ({ c }) => `<circle cx="75" cy="89" r="6" fill="none" stroke="${c}" stroke-width="1.8"/><circle cx="125" cy="89" r="6" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  "ear-pearl": ({ c, o }) =>
    lines("M75 82 L 75 88", "#d6ab48", 1) + circle(75, 91, 3.3, c, o) + circle(125, 91, 3.3, c, o) +
    circle(74, 90, 1, "#ffffff") + circle(124, 90, 1, "#ffffff"),
  "neck-choker": ({ c, l, o }) =>
    path("M91 104 Q 100 109 109 104 L 109 109 Q 100 114 91 109 Z", c, o) + circle(100, 113, 2.2, l, o),
  "neck-scarf": ({ c, d, l, o }) =>
    path("M104 118 L 114 162 L 102 162 L 96 122 Z", d, o) +
    path("M86 104 Q 100 116 114 104 L 117 118 Q 100 130 83 118 Z", c, o) +
    line("M104 162 L 104 168 M108 162 L 108 168 M112 162 L 112 168", d, 1) + line("M86 112 Q 100 122 114 112", l, 1),
  "neck-pendant": ({ c, o }) =>
    line("M88 112 Q 100 134 112 112", "#d6ab48", 1) + path("M100 128 L 105 134 L 100 141 L 95 134 Z", c, o) +
    circle(98.5, 133, 1, "#ffffff"),
  "neck-pearl": ({ c, o }) => {
    let beads = "";
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12;
      const x = (1 - t) ** 2 * 87 + 2 * (1 - t) * t * 100 + t ** 2 * 113;
      const y = (1 - t) ** 2 * 112 + 2 * (1 - t) * t * 138 + t ** 2 * 112;
      beads += circle(round(x), round(y), 2.3, c, o);
    }
    return beads;
  },

  // Glasses
  "glass-sun": ({ c, l, o }) =>
    `<rect x="81" y="70" width="17" height="12" rx="5" fill="${c}" ${o} opacity="0.92"/><rect x="102" y="70" width="17" height="12" rx="5" fill="${c}" ${o} opacity="0.92"/>` +
    line("M98 74 L 102 74", c, 1.6) + lines("M84 73 L 89 72", l, 1.2) + lines("M81 74 L 76 73", c, 1.4),
  "glass-cat": ({ c, l, o }) =>
    both("M81 72 L 98 73 L 97 80 Q 90 84 84 80 Q 81 77 79 69 Z", c, `${o} fill-opacity="0.85"`) +
    line("M98 75 L 102 75", c, 1.6) + lines("M84 75 L 90 75", l, 1.2),
  "glass-round": ({ c }) =>
    `<circle cx="90" cy="77" r="7.5" fill="#ffffff" fill-opacity="0.15" stroke="${c}" stroke-width="1.6"/><circle cx="110" cy="77" r="7.5" fill="#ffffff" fill-opacity="0.15" stroke="${c}" stroke-width="1.6"/>` +
    line("M97.5 76 Q 100 74 102.5 76", c, 1.4) + lines("M82.5 76 L 76 74", c, 1.4),
};

/** Open-fronted jacket: two panels from the collar to `hem`, long sleeves. */
function openJacket(c, o, hem, flare = false) {
  const bottomOut = flare ? 64 : 70;
  const left = `M88 113 L 96 150 L 96 ${hem} L ${bottomOut} ${hem} L 71 152 L 66 162 L 60 226 L 49 224 C 49 172 53 140 62 125 C 65 118 75 114 88 113 Z`;
  return both(left, c, o);
}

function sparkle(x, y, r, fill) {
  return path(`M${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z`, fill, 'opacity="0.9"');
}

// Assembly ---------------------------------------------------------------------------------------------

/** Items whose hem reaches the floor: the shoes go under them. */
const LONG = new Set(["bottom-wide", "dress-aodai", "dress-gown"]);

function itemParts(entry, look) {
  if (!entry) return { back: "", front: "" };
  const item = itemById(entry.id);
  if (item.slot === "hair") {
    const hex = hairHex(look);
    const art = HAIR[item.id]({ c: hex, d: shade(hex, -0.3), l: shade(hex, 0.25), o: outline(hex) });
    return art;
  }
  const hex = colorById(entry.color ?? item.color).hex;
  const art = ART[item.id](palette(hex));
  return typeof art === "string" ? { back: "", front: art } : art;
}

/** Inner SVG markup of the dressed doll, layered back to front. */
export function dollMarkup(look) {
  const parts = Object.fromEntries(
    ["hair", "top", "bottom", "dress", "outer", "shoes", "bag", "hat", "earrings", "necklace", "glasses"].map((slot) => [slot, itemParts(look.items[slot], look)]),
  );
  const long = LONG.has(look.items.bottom?.id) || LONG.has(look.items.dress?.id);
  return [
    inBody(parts.bag.back),
    inHead(parts.hair.back),
    inBody(
      bodySkin(look) +
      underlayer() +
      (long ? parts.shoes.front : "") +
      parts.bottom.front +
      (long ? "" : parts.shoes.front) +
      parts.top.front +
      parts.dress.front +
      parts.outer.front +
      parts.necklace.front +
      parts.bag.front,
    ),
    inHead(headSkin(look) + face(look) + parts.hair.front + parts.earrings.front + parts.glasses.front + parts.hat.front),
  ].join("");
}

export function dollSVG(look, { className = "doll", viewBox = VIEW } = {}) {
  return `<svg class="${className}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Người mẫu">${dollMarkup(look)}</svg>`;
}

/** Where each slot sits on the body, for the wardrobe thumbnails. */
export const THUMB_VIEW = {
  hair: "50 14 100 100",
  top: "40 100 120 120",
  bottom: "40 186 120 210",
  dress: "20 90 160 320",
  outer: "38 96 124 210",
  shoes: "70 320 60 90",
  bag: "52 108 124 170",
  hat: "34 0 132 72",
  earrings: "62 50 76 52",
  necklace: "74 92 52 76",
  glasses: "70 56 60 40",
};

/** A wardrobe button picture: the item on a faint silhouette, cropped to its slot. */
export function thumbSVG(itemId, color, look) {
  const item = itemById(itemId);
  const entry = { id: itemId, color: item.colors ? color ?? item.color : null };
  const { back, front } = itemParts(entry, look);
  const ghost = `<g opacity="0.22">${body({ ...look, skin: "#b9a7b8" })}</g>`;
  const showFace = ["hair", "earrings", "glasses", "hat"].includes(item.slot);
  return `<svg viewBox="${THUMB_VIEW[item.slot]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${back}${showFace ? body(look) + face(look) : ghost}${front}</svg>`;
}

export const ART_IDS = Object.keys(ART);
export const HAIR_IDS = Object.keys(HAIR);
