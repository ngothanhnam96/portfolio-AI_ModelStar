/**
 * Illustrated backgrounds for the studio, home and photos: SVG markup strings, viewBox 400 × 300,
 * cropped to fill (xMidYMax slice). All original, drawn with simple shapes and gradients.
 */

let count = 0;

export const BACKDROPS = [
  { id: "bedroom", name: "Phòng ngủ hồng", icon: "🛏️" },
  { id: "boutique", name: "Tiệm thời trang", icon: "🛍️" },
  { id: "garden", name: "Vườn hoa", icon: "🌷" },
  { id: "beach", name: "Bãi biển", icon: "🏝️" },
  { id: "night", name: "Phố đêm", icon: "🌃" },
  { id: "studio", name: "Studio chụp ảnh", icon: "📸" },
];

/** Which background each career show uses. */
export const SHOW_BACKDROP = {
  school: "bedroom", beach: "beach", interview: "boutique", jogging: "garden", cafe: "boutique",
  winter: "night", tet: "garden", festival: "night", birthday: "bedroom", fairy: "night",
  redcarpet: "studio", final: "studio",
};

export function backdropSVG(id, { snow = false } = {}) {
  const p = `bd${(count += 1)}`;
  const draw = SCENES[id] ?? SCENES.bedroom;
  return `<svg class="backdrop" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw(p)}${snow ? flakes() : ""}</svg>`;
}

const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`;
const rad = (id, stops) =>
  `<radialGradient id="${id}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;

function flakes() {
  let s = "";
  for (let i = 0; i < 46; i += 1) {
    const x = (i * 83) % 400;
    const y = (i * 47) % 300;
    s += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.6}" fill="#ffffff" opacity="0.8"/>`;
  }
  return s;
}

const SCENES = {
  bedroom: (p) => `
    <defs>
      ${lin(`${p}w`, [[0, "#ffe3ea"], [1, "#f9cad7"]])}
      ${lin(`${p}sky`, [[0, "#9fd8ff"], [1, "#e9f7ff"]])}
      ${lin(`${p}f`, [[0, "#e9b998"], [1, "#d29c78"]])}
      ${rad(`${p}glow`, [[0, "#fff6d8", 0.9], [1, "#fff6d8", 0]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}w)"/>
    <g opacity="0.35" fill="#ffffff">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i % 10) * 42 + ((i / 10) % 2 ? 21 : 0)}" cy="${Math.floor(i / 10) * 40 + 20}" r="2.2"/>`).join("")}</g>
    <rect y="196" width="400" height="44" fill="#fff0f4"/>
    <g stroke="#f3cbd7" stroke-width="2">${Array.from({ length: 11 }, (_, i) => `<rect x="${i * 38 + 6}" y="203" width="30" height="30" rx="3" fill="none"/>`).join("")}</g>
    <rect y="194" width="400" height="5" fill="#f6d7e0"/>
    <rect y="238" width="400" height="62" fill="url(#${p}f)"/>
    <g stroke="#c58d6a" stroke-width="1" opacity="0.6">${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${246 + i * 10}" x2="400" y2="${246 + i * 10}"/>`).join("")}</g>
    <!-- Window with curtains -->
    <rect x="34" y="40" width="112" height="128" rx="6" fill="#ffffff"/>
    <rect x="42" y="48" width="96" height="112" fill="url(#${p}sky)"/>
    <ellipse cx="74" cy="78" rx="18" ry="7" fill="#ffffff" opacity="0.9"/><ellipse cx="112" cy="100" rx="22" ry="8" fill="#ffffff" opacity="0.85"/>
    <rect x="88" y="48" width="4" height="112" fill="#ffffff"/><rect x="42" y="102" width="96" height="4" fill="#ffffff"/>
    <rect x="22" y="32" width="136" height="7" rx="3" fill="#e88aa6"/>
    <path d="M24 36 Q 48 36 54 40 Q 46 90 60 172 Q 40 178 22 172 Q 34 100 24 36 Z" fill="#ff9fb9"/>
    <path d="M156 36 Q 132 36 126 40 Q 134 90 120 172 Q 140 178 158 172 Q 146 100 156 36 Z" fill="#ff9fb9"/>
    <path d="M40 40 Q 46 100 44 170 M140 40 Q 134 100 136 170" stroke="#f07c9f" stroke-width="2" fill="none"/>
    <circle cx="56" cy="120" r="5" fill="#f5c542"/><circle cx="124" cy="120" r="5" fill="#f5c542"/>
    <!-- Picture and shelf -->
    <rect x="236" y="54" width="62" height="50" rx="3" fill="#ffffff" stroke="#e8b3c3" stroke-width="4"/>
    <path d="M267 92 Q 252 80 256 72 Q 262 66 267 74 Q 272 66 278 72 Q 282 80 267 92 Z" fill="#ff8fab"/>
    <rect x="318" y="96" width="70" height="6" rx="2" fill="#e3a7b8"/>
    <rect x="324" y="80" width="8" height="16" fill="#8fc0ff"/><rect x="333" y="76" width="8" height="20" fill="#ffd166"/><rect x="342" y="82" width="7" height="14" fill="#c7a6f3"/>
    <path d="M366 96 Q 362 84 370 80 Q 368 72 376 74 Q 382 70 382 80 Q 388 84 380 96 Z" fill="#6cc48e"/>
    <!-- Vanity with mirror and lamp -->
    <ellipse cx="330" cy="150" rx="30" ry="38" fill="#ffffff" stroke="#f0bccb" stroke-width="5"/>
    <ellipse cx="330" cy="150" rx="22" ry="30" fill="#e8f4ff" opacity="0.8"/>
    <path d="M318 132 L 334 124" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
    <rect x="286" y="188" width="92" height="12" rx="4" fill="#ffffff"/>
    <rect x="292" y="200" width="6" height="44" fill="#f2d2dc"/><rect x="366" y="200" width="6" height="44" fill="#f2d2dc"/>
    <rect x="300" y="200" width="64" height="18" rx="2" fill="#fbe4ec"/>
    <circle cx="298" cy="182" r="5" fill="#ff8fab"/><rect x="356" y="176" width="10" height="12" rx="2" fill="#c7a6f3"/>
    <circle cx="200" cy="40" r="70" fill="url(#${p}glow)"/>
    <!-- Rug -->
    <ellipse cx="200" cy="278" rx="150" ry="18" fill="#ffd3e0"/>
    <ellipse cx="200" cy="278" rx="130" ry="13" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="5 5"/>`,

  boutique: (p) => `
    <defs>
      ${lin(`${p}w`, [[0, "#fbf4ea"], [1, "#f1e2cf"]])}
      ${lin(`${p}f`, [[0, "#e9dccb"], [1, "#d6c3ab"]])}
      ${rad(`${p}lamp`, [[0, "#fff4c9", 0.95], [1, "#fff4c9", 0]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}w)"/>
    ${[40, 300].map((x) => `
      <path d="M${x} 210 L ${x} 86 Q ${x} 40 ${x + 30} 40 Q ${x + 60} 40 ${x + 60} 86 L ${x + 60} 210 Z" fill="#efdcc4"/>
      <line x1="${x + 6}" y1="92" x2="${x + 54}" y2="92" stroke="#b08a5a" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => {
        const cx = x + 12 + i * 12;
        const col = ["#ffb3c7", "#a8d8ff", "#ffe08a", "#c7b3f5"][i];
        return `<path d="M${cx} 92 L ${cx} 96" stroke="#7d6a55" stroke-width="1"/><path d="M${cx - 6} 98 L ${cx + 6} 98 L ${cx + 8} 150 L ${cx - 8} 150 Z" fill="${col}"/>`;
      }).join("")}
      <rect x="${x + 4}" y="168" width="52" height="5" fill="#c9a77d"/>
      <path d="M${x + 10} 166 L ${x + 14} 156 L ${x + 22} 156 L ${x + 26} 166 Z" fill="#e88aa6"/>
      <path d="M${x + 34} 166 Q ${x + 36} 156 ${x + 44} 158 L ${x + 48} 166 Z" fill="#8a6a4a"/>`).join("")}
    <rect x="150" y="60" width="100" height="150" rx="50" fill="#ffffff" opacity="0.55"/>
    <rect x="160" y="70" width="80" height="136" rx="40" fill="#eef6ff" opacity="0.7"/>
    ${[110, 200, 290].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="26" stroke="#8a7458" stroke-width="1.5"/><path d="M${x - 12} 26 L ${x + 12} 26 L ${x + 8} 36 L ${x - 8} 36 Z" fill="#d6b06a"/><circle cx="${x}" cy="44" r="36" fill="url(#${p}lamp)"/>`).join("")}
    <rect y="210" width="400" height="90" fill="url(#${p}f)"/>
    <g stroke="#ffffff" stroke-width="1" opacity="0.5">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="${i * 50}" y1="210" x2="${i * 50 - 40}" y2="300"/>`).join("")}</g>
    <path d="M20 230 Q 14 200 26 196 Q 22 180 36 184 Q 44 172 48 190 Q 60 196 50 214 L 46 232 Z" fill="#6cb98a"/>
    <path d="M24 230 L 48 230 L 44 254 L 28 254 Z" fill="#ffffff"/>
    <ellipse cx="200" cy="272" rx="120" ry="12" fill="#ffffff" opacity="0.4"/>`,

  garden: (p) => `
    <defs>
      ${lin(`${p}sky`, [[0, "#8fd3ff"], [1, "#e6f7ff"]])}
      ${lin(`${p}g`, [[0, "#9ee08a"], [1, "#5fb85f"]])}
      ${rad(`${p}sun`, [[0, "#fff6b0"], [0.5, "#ffe066", 0.7], [1, "#ffe066", 0]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}sky)"/>
    <circle cx="330" cy="50" r="46" fill="url(#${p}sun)"/>
    <ellipse cx="90" cy="60" rx="34" ry="11" fill="#ffffff" opacity="0.9"/><ellipse cx="200" cy="40" rx="26" ry="9" fill="#ffffff" opacity="0.8"/>
    <path d="M0 170 Q 80 130 170 160 Q 260 120 400 160 L 400 300 L 0 300 Z" fill="#b9e8a0"/>
    ${[[40, 150, 34], [110, 160, 26], [300, 150, 36], [370, 160, 28]].map(([x, y, r]) => `<rect x="${x - 4}" y="${y}" width="8" height="${r + 10}" fill="#8a6142"/><circle cx="${x}" cy="${y - r * 0.4}" r="${r}" fill="#5fb85f"/><circle cx="${x - r * 0.4}" cy="${y - r * 0.7}" r="${r * 0.6}" fill="#7dd27a"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.9}" r="${r * 0.4}" fill="#9ee08a"/>`).join("")}
    <g fill="#ffffff">${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 24 + 4}" y="196" width="10" height="44" rx="3"/>`).join("")}<rect y="206" width="400" height="6"/><rect y="226" width="400" height="6"/></g>
    <rect y="238" width="400" height="62" fill="url(#${p}g)"/>
    <path d="M150 300 Q 180 260 196 240 L 204 240 Q 220 260 250 300 Z" fill="#e9dcc2"/>
    ${Array.from({ length: 34 }, (_, i) => {
      const x = (i * 37) % 400;
      const y = 244 + ((i * 13) % 50);
      const c = ["#ff8fab", "#ffd166", "#ffffff", "#c7a6f3", "#ff6f91"][i % 5];
      return x > 140 && x < 260 && y > 250 ? "" : `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.4" fill="#ffd34d"/>`;
    }).join("")}`,

  beach: (p) => `
    <defs>
      ${lin(`${p}sky`, [[0, "#7ccaf5"], [1, "#d8f2ff"]])}
      ${lin(`${p}sea`, [[0, "#3aa8d8"], [1, "#7fd6e8"]])}
      ${lin(`${p}sand`, [[0, "#ffe6b3"], [1, "#f3cf8a"]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}sky)"/>
    <circle cx="80" cy="56" r="26" fill="#fff3a6"/><circle cx="80" cy="56" r="40" fill="#fff3a6" opacity="0.3"/>
    <ellipse cx="260" cy="60" rx="40" ry="11" fill="#ffffff" opacity="0.9"/>
    <rect y="150" width="400" height="70" fill="url(#${p}sea)"/>
    <g stroke="#ffffff" stroke-width="2" opacity="0.6" fill="none">${[0, 1, 2, 3].map((i) => `<path d="M${i * 110} ${170 + i * 9} q 15 -6 30 0 t 30 0"/>`).join("")}</g>
    <path d="M0 214 Q 100 204 200 214 Q 300 224 400 212 L 400 300 L 0 300 Z" fill="url(#${p}sand)"/>
    <path d="M0 214 Q 100 204 200 214 Q 300 224 400 212" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
    <path d="M340 260 Q 336 200 352 150" stroke="#9a6b43" stroke-width="7" fill="none"/>
    ${[-60, -20, 20, 60, 100].map((a) => `<path d="M352 150 q ${Math.cos((a * Math.PI) / 180) * 30} ${Math.sin((a * Math.PI) / 180) * 12 - 6} ${Math.cos((a * Math.PI) / 180) * 54} ${Math.sin((a * Math.PI) / 180) * 30 + 10}" stroke="#4caf6a" stroke-width="9" stroke-linecap="round" fill="none"/>`).join("")}
    <path d="M40 270 L 46 200" stroke="#ffffff" stroke-width="3"/>
    <path d="M6 210 Q 46 168 86 210 Z" fill="#ff8fab"/><path d="M26 210 Q 46 168 66 210 Z" fill="#ffffff"/>
    <circle cx="300" cy="276" r="7" fill="#ff8fab"/><path d="M110 270 l 8 -4 l 2 8 z" fill="#f5c542"/>`,

  night: (p) => `
    <defs>
      ${lin(`${p}sky`, [[0, "#141a3a"], [1, "#433a7a"]])}
      ${lin(`${p}road`, [[0, "#2a2a44"], [1, "#16162a"]])}
      ${rad(`${p}lamp`, [[0, "#ffe9a8", 0.8], [1, "#ffe9a8", 0]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}sky)"/>
    <circle cx="320" cy="50" r="20" fill="#fff6d6"/><circle cx="328" cy="44" r="18" fill="#2a2d5c"/>
    <g fill="#ffffff">${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 61) % 400}" cy="${(i * 29) % 110}" r="${0.6 + (i % 3) * 0.4}" opacity="0.8"/>`).join("")}</g>
    ${[[0, 120, 50], [46, 90, 40], [80, 140, 46], [130, 100, 38], [250, 110, 44], [290, 80, 50], [336, 130, 34], [366, 100, 40]].map(([x, top, w]) => {
      let win = "";
      for (let y = top + 10; y < 220; y += 14) for (let xx = x + 6; xx < x + w - 6; xx += 10) if ((xx * 7 + y * 3) % 5 < 3) win += `<rect x="${xx}" y="${y}" width="5" height="7" fill="#ffd97a" opacity="0.85"/>`;
      return `<rect x="${x}" y="${top}" width="${w}" height="${230 - top}" fill="#262650"/>${win}`;
    }).join("")}
    <rect y="226" width="400" height="74" fill="url(#${p}road)"/>
    ${[60, 340].map((x) => `<rect x="${x - 2}" y="150" width="4" height="80" fill="#55557a"/><circle cx="${x}" cy="150" r="6" fill="#ffe9a8"/><circle cx="${x}" cy="150" r="40" fill="url(#${p}lamp)"/><ellipse cx="${x}" cy="250" rx="30" ry="6" fill="#ffe9a8" opacity="0.25"/>`).join("")}
    <g fill="#ff8fab" opacity="0.5">${[40, 140, 260, 370].map((x) => `<rect x="${x}" y="260" width="22" height="3"/>`).join("")}</g>`,

  studio: (p) => `
    <defs>
      ${lin(`${p}bg`, [[0, "#3b2f4f"], [0.75, "#65547d"], [1, "#2b2238"]])}
      ${rad(`${p}spot`, [[0, "#fff5e6", 0.55], [1, "#fff5e6", 0]])}
    </defs>
    <rect width="400" height="300" fill="url(#${p}bg)"/>
    <ellipse cx="200" cy="150" rx="150" ry="140" fill="url(#${p}spot)"/>
    ${[44, 356].map((x) => `
      <line x1="${x}" y1="110" x2="${x}" y2="280" stroke="#22222c" stroke-width="3"/>
      <line x1="${x}" y1="280" x2="${x - 16}" y2="296" stroke="#22222c" stroke-width="3"/><line x1="${x}" y1="280" x2="${x + 16}" y2="296" stroke="#22222c" stroke-width="3"/>
      <rect x="${x - 26}" y="64" width="52" height="46" rx="4" fill="#fdf7ff" transform="rotate(${x < 200 ? 12 : -12} ${x} 87)"/>
      <rect x="${x - 26}" y="64" width="52" height="46" rx="4" fill="none" stroke="#1d1d24" stroke-width="4" transform="rotate(${x < 200 ? 12 : -12} ${x} 87)"/>`).join("")}
    <g fill="#ffd6f0">${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 97) % 400}" cy="${20 + ((i * 37) % 120)}" r="${3 + (i % 4) * 2}" opacity="${0.15 + (i % 3) * 0.1}"/>`).join("")}</g>
    <ellipse cx="200" cy="282" rx="140" ry="16" fill="#000000" opacity="0.25"/>`,
};
