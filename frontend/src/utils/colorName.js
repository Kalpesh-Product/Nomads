// Nearest CSS-named-color lookup, so theme swatches can show a human name
// ("Burnt Orange"-style via the closest standard CSS color) on hover instead
// of a raw hex code. Pure client-side (Euclidean RGB distance) — no API/data
// changes needed, works for both the live catalog and the static fallback.
const CSS_NAMED_COLORS = {
  black: [0, 0, 0], dimgray: [105, 105, 105], gray: [128, 128, 128],
  darkgray: [169, 169, 169], silver: [192, 192, 192], lightgray: [211, 211, 211],
  gainsboro: [220, 220, 220], whitesmoke: [245, 245, 245], white: [255, 255, 255],
  snow: [255, 250, 250], ivory: [255, 255, 240], linen: [250, 240, 230],
  oldlace: [253, 245, 230], seashell: [255, 245, 238], beige: [245, 245, 220],
  antiquewhite: [250, 235, 215], cornsilk: [255, 248, 220], blanchedalmond: [255, 235, 205],
  bisque: [255, 228, 196], navajowhite: [255, 222, 173], wheat: [245, 222, 179],
  tan: [210, 180, 140], burlywood: [222, 184, 135], peru: [205, 133, 63],
  chocolate: [210, 105, 30], saddlebrown: [139, 69, 19], sienna: [160, 82, 45],
  brown: [165, 42, 42], maroon: [128, 0, 0], darkred: [139, 0, 0],
  firebrick: [178, 34, 34], red: [255, 0, 0], tomato: [255, 99, 71],
  coral: [255, 127, 80], salmon: [250, 128, 114], lightsalmon: [255, 160, 122],
  darksalmon: [233, 150, 122], indianred: [205, 92, 92], crimson: [220, 20, 60],
  orangered: [255, 69, 0], darkorange: [255, 140, 0], orange: [255, 165, 0],
  amber: [255, 191, 0], gold: [255, 215, 0], goldenrod: [218, 165, 32],
  darkgoldenrod: [184, 134, 11], khaki: [240, 230, 140], darkkhaki: [189, 183, 107],
  yellow: [255, 255, 0], lightyellow: [255, 255, 224], lemonchiffon: [255, 250, 205],
  olive: [128, 128, 0], olivedrab: [107, 142, 35], yellowgreen: [154, 205, 50],
  lawngreen: [124, 252, 0], chartreuse: [127, 255, 0], greenyellow: [173, 255, 47],
  lime: [0, 255, 0], limegreen: [50, 205, 50], springgreen: [0, 255, 127],
  mediumspringgreen: [0, 250, 154], seagreen: [46, 139, 87], mediumseagreen: [60, 179, 113],
  forestgreen: [34, 139, 34], green: [0, 128, 0], darkgreen: [0, 100, 0],
  emerald: [80, 200, 120], mint: [62, 180, 137], sage: [138, 154, 134],
  teal: [0, 128, 128], darkslategray: [47, 79, 79], darkcyan: [0, 139, 139],
  lightseagreen: [32, 178, 170], cadetblue: [95, 158, 160], mediumaquamarine: [102, 205, 170],
  aquamarine: [127, 255, 212], turquoise: [64, 224, 208], mediumturquoise: [72, 209, 204],
  cyan: [0, 255, 255], lightcyan: [224, 255, 255], paleturquoise: [175, 238, 238],
  powderblue: [176, 224, 230], lightblue: [173, 216, 230], skyblue: [135, 206, 235],
  lightskyblue: [135, 206, 250], deepskyblue: [0, 191, 255], dodgerblue: [30, 144, 255],
  cornflowerblue: [100, 149, 237], steelblue: [70, 130, 180], royalblue: [65, 105, 225],
  blue: [0, 0, 255], mediumblue: [0, 0, 205], darkblue: [0, 0, 139],
  navy: [0, 0, 128], midnightblue: [25, 25, 112], slateblue: [106, 90, 205],
  mediumslateblue: [123, 104, 238], indigo: [75, 0, 130], darkslateblue: [72, 61, 139],
  blueviolet: [138, 43, 226], purple: [128, 0, 128], darkorchid: [153, 50, 204],
  darkviolet: [148, 0, 211], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219],
  orchid: [218, 112, 214], violet: [238, 130, 238], plum: [221, 160, 221],
  thistle: [216, 191, 216], lavender: [230, 230, 250], magenta: [255, 0, 255],
  fuchsia: [255, 0, 255], deeppink: [255, 20, 147], hotpink: [255, 105, 180],
  palevioletred: [219, 112, 147], pink: [255, 192, 203], lightpink: [255, 182, 193],
  mistyrose: [255, 228, 225], peachpuff: [255, 218, 185], moccasin: [255, 228, 181],
  papayawhip: [255, 239, 213], mintcream: [245, 255, 250], honeydew: [240, 255, 240],
  aliceblue: [240, 248, 255], ghostwhite: [248, 248, 255], azure: [240, 255, 255],
  lavenderblush: [255, 240, 245], charcoal: [54, 69, 79], jet: [52, 52, 52],
  slategray: [112, 128, 144], lightslategray: [119, 136, 153], lightsteelblue: [176, 196, 222],
};

const NAMED_ENTRIES = Object.entries(CSS_NAMED_COLORS);

const hexToRgb = (hex) => {
  const normalized = String(hex || "").replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;
  const int = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(int)) return null;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const toTitleCase = (slug) => slug.replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

// Nearest match by plain Euclidean distance in RGB space — not perceptually
// uniform (CIE-Lab would be), but more than good enough for a hover label.
export const nearestColorName = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let closestName = null;
  let closestDistance = Infinity;
  for (const [name, [r, g, b]] of NAMED_ENTRIES) {
    const distance = (rgb[0] - r) ** 2 + (rgb[1] - g) ** 2 + (rgb[2] - b) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }
  return closestName ? toTitleCase(closestName) : hex;
};
