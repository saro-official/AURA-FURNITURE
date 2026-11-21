import React, { useState as S, useEffect as E, useRef as R } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./styles.css";

const FIN = [["Natural teak", 0xc98a45, 0], ["Walnut", 0x6d4328, 0], ["Mahogany", 0x7d3022, 0], ["Light oak", 0xdcb98a, 0], ["Ivory paint", 0xece6da, 1], ["Sage paint", 0x8ea58a, 1], ["Navy paint", 0x25344f, 1], ["Brick paint", 0x9a3f2f, 1]];
const hex = (n) => "#" + n.toString(16).padStart(6, "0");

const P = [
  {
    k: "w", short: "Wardrobe", name: "Open Wooden Wardrobe", price: 68500, dims: "120 × 56 × 200 cm",
    blurb: "A tall solid-wood wardrobe with doors that swing fully open, a brass hanging rail and a deep drawer. Built so the grain shows from every side.",
    aura: ["#f4b56a", "#f3a38f", "#9ccfe6"],
    bars: [["Door hinge life", 90, "20,000 cycles"], ["Hanging rail load", 82, "Up to 60 kg"], ["Moisture resistance", 78, "Kiln-dried to 8%"]],
    build: [["Wood", "Burma teak, single-batch"], ["Joinery", "Mortise and tenon, no nails"], ["Finish", "Hand-rubbed oil, matte"]],
    inc: ["Wardrobe frame with two open doors", "Brass hanging rail with two brackets", "Soft-close drawer with wooden knob", "Delivery, assembly and 5-year warranty"],
  },
  {
    k: "d", short: "Dining", name: "Ornate Carved Dining Set", price: 148000, dims: "200 × 100 × 78 cm, 4 chairs",
    blurb: "A carved pedestal dining table with a medallion top and four matching high-back chairs. Every scroll is cut by hand from solid teak.",
    aura: ["#f3a1b3", "#86d3d1", "#f5c37e"],
    bars: [["Tabletop hardness", 91, "Scratch-resistant"], ["Pedestal stability", 87, "Carved single base"], ["Carving depth", 93, "Up to 14 mm"]],
    build: [["Wood", "Seasoned teak, full solid"], ["Joinery", "Dowel and glue, clamped"], ["Finish", "Polyurethane, semi-gloss"]],
    inc: ["Pedestal table with carved top", "Four carved dining chairs", "Felt feet to protect your floor", "Delivery, assembly and 5-year warranty"],
  },
  {
    k: "r", short: "Dresser", name: "Mirrored Dresser with Cabinet", price: 92500, dims: "200 × 60 × 190 cm with mirror",
    blurb: "A seven-drawer dresser with a centre cabinet and a tri-fold arched mirror. Raised panel fronts and brushed metal knobs.",
    aura: ["#f0b27a", "#9fd0e8", "#d8b4f0"],
    bars: [["Drawer glide life", 89, "50,000 pulls"], ["Storage capacity", 86, "Seven drawers, one cabinet"], ["Mirror stability", 82, "Tri-fold, hinged frame"]],
    build: [["Wood", "Cherry-tone teak"], ["Joinery", "Dovetail drawers"], ["Finish", "Satin lacquer"]],
    inc: ["Dresser with seven drawers", "Two-door centre cabinet", "Tri-fold arched mirror", "Delivery, assembly and 5-year warranty"],
  },
  {
    k: "s", short: "Bed", name: "Storage Box Bed", price: 79900, dims: "180 × 210 × 95 cm",
    blurb: "A queen bed with a panelled headboard and a lift-up platform over a deep storage bay. Plain, strong and made for daily use.",
    aura: ["#a9d8b9", "#c6b6ee", "#f4d27b"],
    bars: [["Frame strength", 94, "Supports 400 kg"], ["Storage depth", 88, "Full-length bay"], ["Lid lift", 80, "Opens to 35°"]],
    build: [["Wood", "Sheesham, solid"], ["Joinery", "Wedged through-tenons"], ["Finish", "Natural wax, satin"]],
    inc: ["Bed frame with panelled headboard", "Lift-up storage platform", "Solid wood support bars", "Delivery, assembly and 5-year warranty"],
  },
  {
    k: "f", short: "Sofa", name: "Teak Sofa Set 3+1+1", price: 112000, dims: "Sofa 180 cm, chairs 85 cm",
    blurb: "A three-seater and two armchairs with slatted backs and carved crest rails. Open wooden frames that stay cool and last for decades.",
    aura: ["#f2c46d", "#f2a0a0", "#b9dba0"],
    bars: [["Frame strength", 92, "Supports 600 kg"], ["Slat spacing", 85, "Even, airy support"], ["Leg durability", 88, "Turned solid teak"]],
    build: [["Wood", "Seasoned teak, full solid"], ["Joinery", "Mortise and tenon"], ["Finish", "Hand-rubbed polish"]],
    inc: ["Three-seater sofa", "Two matching armchairs", "Cushion set on request", "Delivery, assembly and 5-year warranty"],
  },
];

let PH;
const mesh = (geo, x, y, z, g, alt) => { PH = PH || new THREE.MeshBasicMaterial(); const m = new THREE.Mesh(geo, PH); m.position.set(x, y, z); if (alt) m.userData.alt = alt; g.add(m); return m; };
const GC = {};
const bx = (w, h, d, x, y, z, g) => {
  const k = w + "," + h + "," + d;
  if (!GC[k]) {
    const e = Math.min(0.01, w / 3, h / 3, d / 3), s = new THREE.Shape();
    s.moveTo(-w / 2 + e, -h / 2 + e); s.lineTo(w / 2 - e, -h / 2 + e); s.lineTo(w / 2 - e, h / 2 - e); s.lineTo(-w / 2 + e, h / 2 - e); s.closePath();
    const q = new THREE.ExtrudeGeometry(s, { depth: Math.max(d - 2 * e, 0.0001), bevelEnabled: true, bevelThickness: e, bevelSize: e, bevelSegments: 2, curveSegments: 1 });
    q.translate(0, 0, -(d - 2 * e) / 2); GC[k] = q;
  }
  return mesh(GC[k], x, y, z, g);
};
const cy = (rt, rb, h, x, y, z, g, alt) => mesh(new THREE.CylinderGeometry(rt, rb, h, 20), x, y, z, g, alt);
const sp = (r, x, y, z, g) => mesh(new THREE.SphereGeometry(r, 16, 12), x, y, z, g);
const arch = (w, h, rise, dp) => {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.quadraticCurveTo(0, h + rise * 2, -w / 2, h); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: dp, bevelEnabled: false });
};
const sub = (g, x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); return c; };

const chair = (g, x, z, ry) => {
  const c = sub(g, x, z, ry);
  bx(0.52, 0.07, 0.5, 0, 0.46, 0, c); bx(0.46, 0.08, 0.04, 0, 0.4, 0.22, c);
  [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([a, b]) => cy(0.035, 0.025, 0.44, a, 0.22, b, c));
  [-1, 1].forEach((s) => bx(0.05, 0.62, 0.05, s * 0.23, 0.78, -0.23, c));
  bx(0.5, 0.06, 0.05, 0, 1.1, -0.23, c); mesh(arch(0.38, 0.3, 0.14, 0.03), 0, 0.56, -0.25, c);
};
const seat = (g, w, x, z, ry) => {
  const c = sub(g, x, z, ry), n = Math.round(w / 0.11);
  bx(w, 0.1, 0.7, 0, 0.3, 0, c);
  for (let i = 0; i < 6; i++) bx(w - 0.1, 0.04, 0.1, 0, 0.37, -0.28 + i * 0.11, c);
  for (let i = 0; i < n; i++) bx(0.05, 0.62, 0.035, -w / 2 + 0.12 + (i * (w - 0.24)) / (n - 1), 0.72, -0.32, c).rotation.x = -0.12;
  bx(w, 0.09, 0.07, 0, 1.07, -0.34, c); mesh(arch(w * 0.35, 0.01, 0.07, 0.04), 0, 1.11, -0.37, c);
  [-1, 1].forEach((s) => {
    const X = s * (w / 2 - 0.03);
    bx(0.1, 0.07, 0.7, X, 0.62, 0, c); bx(0.07, 0.3, 0.07, X, 0.46, 0.28, c); bx(0.07, 0.8, 0.07, X, 0.7, -0.32, c);
    [0.28, -0.28].forEach((q) => { cy(0.055, 0.04, 0.2, X, 0.1, q, c); sp(0.07, X, 0.04, q, c); });
  });
};

const BUILD = {
  d: () => {
    const g = new THREE.Group();
    bx(2, 0.1, 1, 0, 0.8, 0, g); bx(1.7, 0.14, 0.8, 0, 0.7, 0, g);
    [[2, 0.05, 0.08, 0, 0.87, 0.46], [2, 0.05, 0.08, 0, 0.87, -0.46], [0.08, 0.05, 0.9, 0.96, 0.87, 0], [0.08, 0.05, 0.9, -0.96, 0.87, 0]].forEach((a) => bx(...a, g));
    bx(1.6, 0.03, 0.62, 0, 0.86, 0, g);
    const ring = mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 32), 0, 0.89, 0, g); ring.rotation.x = Math.PI / 2; ring.scale.set(1.7, 1.1, 1);
    for (let k = -3; k <= 3; k++) cy(0.06, 0.06, 0.03, k * 0.2, 0.885, 0, g);
    [-1, 1].forEach((a) => [-1, 1].forEach((b) => cy(0.09, 0.09, 0.03, a * 0.62, 0.885, b * 0.2, g)));
    const pts = [[0, 0], [0.34, 0], [0.34, 0.08], [0.22, 0.14], [0.2, 0.25], [0.3, 0.4], [0.14, 0.5], [0.12, 0.6], [0.28, 0.66], [0, 0.68]].map((p) => new THREE.Vector2(p[0], p[1]));
    mesh(new THREE.LatheGeometry(pts, 28), 0, 0, 0, g);
    [0.5, -0.5].forEach((a) => { bx(1.5, 0.1, 0.2, 0, 0.06, 0, g).rotation.y = a; [-1, 1].forEach((s) => sp(0.12, s * 0.75 * Math.cos(a), 0.06, -s * 0.75 * Math.sin(a), g)); });
    chair(g, -0.45, 0.88, Math.PI); chair(g, 0.45, 0.88, Math.PI); chair(g, -0.45, -0.88, 0); chair(g, 0.45, -0.88, 0);
    return g;
  },
  r: () => {
    const g = new THREE.Group();
    bx(2, 0.86, 0.6, 0, 0.5, 0, g); bx(2.1, 0.06, 0.66, 0, 0.96, 0, g);
    [-0.95, 0.95].forEach((x) => bx(0.16, 0.14, 0.5, x, 0.07, 0, g));
    const knob = (x, y) => (cy(0.025, 0.025, 0.05, x, y, 0.35, g, "metal").rotation.x = Math.PI / 2);
    const dr = (w, h, x, y) => { bx(w, h, 0.04, x, y, 0.31, g); knob(x, y); };
    [-0.72, 0.72].forEach((x) => [0.8, 0.52, 0.24].forEach((y) => dr(0.5, 0.24, x, y)));
    dr(0.84, 0.24, 0, 0.8);
    [-0.21, 0.21].forEach((x) => { bx(0.4, 0.47, 0.03, x, 0.36, 0.31, g); mesh(arch(0.26, 0.2, 0.07, 0.02), x, 0.3, 0.325, g); knob(x * 0.2, 0.4); });
    mesh(arch(0.86, 0.9, 0.15, 0.05), 0, 1, -0.15, g); mesh(arch(0.72, 0.82, 0.12, 0.02), 0, 1.04, -0.1, g, "glass");
    [-1, 1].forEach((s) => {
      const h = new THREE.Group(); h.position.set(s * 0.48, 1, -0.12); h.rotation.y = -s * 0.35; g.add(h);
      mesh(arch(0.5, 0.72, 0.08, 0.05), s * 0.27, 0, 0, h); mesh(arch(0.4, 0.64, 0.07, 0.02), s * 0.27, 0.04, 0.05, h, "glass");
    });
    return g;
  },
  s: () => {
    const g = new THREE.Group(), W = 1.8, L = 2.1, H = 0.42;
    bx(W - 0.1, 0.05, L - 0.1, 0, 0.14, 0, g);
    [-1, 1].forEach((s) => {
      bx(0.07, H, L, s * (W / 2), H / 2 + 0.08, 0, g);
      for (let i = 0; i < 5; i++) bx(0.02, H - 0.14, 0.34, s * (W / 2 + 0.04), H / 2 + 0.08, -0.8 + i * 0.4, g);
      bx(0.09, 1.03, 0.09, s * (W / 2), 0.595, -L / 2, g); bx(0.1, 0.14, 0.1, s * (W / 2), 0.07, L / 2, g);
    });
    bx(W, H, 0.07, 0, H / 2 + 0.08, L / 2, g);
    for (let i = 0; i < 4; i++) bx(0.38, H - 0.14, 0.02, -0.66 + i * 0.44, H / 2 + 0.08, L / 2 + 0.04, g);
    bx(W, 0.95, 0.07, 0, 0.555, -L / 2, g);
    for (let i = 0; i < 3; i++) [0.88, 0.52].forEach((y) => bx(0.52, 0.28, 0.02, -0.57 + i * 0.57, y, -L / 2 + 0.045, g));
    bx(W - 0.1, 0.05, L / 2 - 0.05, 0, 0.48, 0.52, g);
    const h = new THREE.Group(); h.position.set(0, 0.5, -0.02); h.rotation.x = 0.6; g.add(h);
    bx(W - 0.1, 0.05, L / 2 - 0.1, 0, 0.02, -(L / 2 - 0.1) / 2, h);
    [-0.35, -0.8].forEach((z) => bx(W - 0.2, 0.05, 0.07, 0, 0.2, z, g));
    return g;
  },
  f: () => { const g = new THREE.Group(); seat(g, 1.8, 0, -0.8, 0); seat(g, 0.85, -1.5, 0.2, 1.1); seat(g, 0.85, 1.5, 0.2, -1.1); return g; },
};

const ring = (r, t, x, y, z, g, sx = 1, sy = 1) => { const m = mesh(new THREE.TorusGeometry(r, t, 8, 28), x, y, z, g); m.scale.set(sx, sy, 1); return m; };
const rose = (x, y, z, g, r) => { ring(r, r * 0.14, x, y, z, g); ring(r * 0.6, r * 0.1, x, y, z, g); cy(r * 0.3, r * 0.3, 0.03, x, y, z, g).rotation.x = Math.PI / 2; };
const panel = (g, w, h, x, y, z, c) => { bx(w, h, 0.03, x, y, z, g); bx(w * 0.8, h * 0.8, 0.03, x, y, z + 0.02, g); if (c) rose(x, y, z + 0.045, g, Math.min(w, h) * 0.3); };
const jamb = (g, W, H, t = 0.1) => { bx(t, H, 0.2, -W / 2 - t / 2, H / 2, 0, g); bx(t, H, 0.2, W / 2 + t / 2, H / 2, 0, g); bx(W + 2 * t, t, 0.2, 0, H + t / 2, 0, g); };
const handle = (x, y, g) => { cy(0.03, 0.03, 0.04, x, y, 0.05, g, "metal").rotation.x = Math.PI / 2; bx(0.13, 0.025, 0.025, x + 0.07, y, 0.08, g).userData.alt = "metal"; };
const wf = (g, W, H) => { const t = 0.08; bx(W, t, 0.14, 0, H - t / 2, 0, g); bx(W, t, 0.14, 0, t / 2, 0, g); bx(t, H, 0.14, -W / 2 + t / 2, H / 2, 0, g); bx(t, H, 0.14, W / 2 - t / 2, H / 2, 0, g); };
const leaf = (g, w, h, x, y, cols, rows) => {
  bx(w, 0.05, 0.06, x, y + h / 2 - 0.025, 0, g); bx(w, 0.05, 0.06, x, y - h / 2 + 0.025, 0, g);
  bx(0.05, h, 0.06, x - w / 2 + 0.025, y, 0, g); bx(0.05, h, 0.06, x + w / 2 - 0.025, y, 0, g);
  bx(w - 0.1, h - 0.1, 0.012, x, y, 0, g).userData.alt = "glass";
  for (let i = 1; i < cols; i++) bx(0.025, h - 0.1, 0.05, x - w / 2 + 0.05 + (i * (w - 0.1)) / cols, y, 0.01, g);
  for (let j = 1; j < rows; j++) bx(w - 0.1, 0.025, 0.05, x, y - h / 2 + 0.05 + (j * (h - 0.1)) / rows, 0.01, g);
};
Object.assign(BUILD, {
  o1: () => {
    const g = new THREE.Group(), W = 0.95, H = 2.1; jamb(g, W, H); bx(W, H, 0.07, 0, H / 2, 0, g);
    panel(g, 0.7, 0.55, 0, 1.45, 0.035, 1); panel(g, 0.3, 0.6, -0.18, 0.62, 0.035); panel(g, 0.3, 0.6, 0.18, 0.62, 0.035); panel(g, 0.7, 0.3, 0, 1.0, 0.035);
    mesh(arch(1.4, 0.1, 0.28, 0.12), 0, H + 0.1, -0.06, g); [-1, 1].forEach((s) => sp(0.05, s * 0.66, H + 0.14, 0.05, g)); handle(0.36, 1.05, g);
    return g;
  },
  o2: () => {
    const g = new THREE.Group(), H = 2.1; jamb(g, 1.5, H); bx(0.06, H, 0.09, 0, H / 2, 0.02, g);
    [-1, 1].forEach((s) => {
      const x = s * 0.37; bx(0.72, H, 0.07, x, H / 2, 0, g);
      mesh(arch(0.5, 0.2, 0.14, 0.03), x, 1.62, 0.04, g); rose(x, 1.85, 0.075, g, 0.14);
      panel(g, 0.5, 0.62, x, 1.1, 0.035, 1); ring(0.17, 0.02, x, 1.1, 0.07, g, 0.8, 1.35); panel(g, 0.5, 0.36, x, 0.4, 0.035, 1); handle(s * 0.1 - 0.07, 1.0, g);
    });
    return g;
  },
  o3: () => {
    const g = new THREE.Group(), H = 2.2; bx(0.9, H, 0.07, 0, H / 2, 0, g);
    for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) panel(g, 0.32, 0.38, c ? 0.19 : -0.19, 0.28 + r * 0.46, 0.035, 1);
    [-1, 1].forEach((s) => { bx(0.3, H, 0.1, s * 0.75, H / 2, 0, g); for (let i = -2; i <= 2; i++) cy(0.014, 0.014, H - 0.1, s * 0.75 + i * 0.05, H / 2, 0.06, g); });
    mesh(arch(1.9, 0.1, 0.3, 0.1), 0, H + 0.02, -0.02, g); [-1, 1].forEach((s) => ring(0.12, 0.025, s * 0.5, H + 0.12, 0.06, g)); rose(0, H + 0.2, 0.06, g, 0.13); handle(0.32, 1.05, g);
    return g;
  },
  n1: () => {
    const g = new THREE.Group(); wf(g, 1.5, 1.5); bx(0.05, 1.3, 0.14, -0.25, 0.7, 0, g); bx(0.05, 1.3, 0.14, 0.25, 0.7, 0, g);
    [-0.5, 0, 0.5].forEach((x) => { leaf(g, 0.46, 0.88, x, 0.5, 1, 1); ring(0.15, 0.012, x, 0.5, 0.04, g, 0.7, 2); ring(0.07, 0.01, x, 0.78, 0.04, g); ring(0.07, 0.01, x, 0.22, 0.04, g); });
    [-0.37, 0.37].forEach((x) => leaf(g, 0.7, 0.32, x, 1.2, 1, 3));
    return g;
  },
  n2: () => {
    const g = new THREE.Group(); wf(g, 1.3, 1.7);
    leaf(g, 0.55, 0.3, -0.32, 1.45, 1, 1); leaf(g, 0.55, 0.3, 0.32, 1.45, 1, 1); leaf(g, 0.55, 1.0, -0.32, 0.72, 1, 1);
    leaf(g, 0.55, 0.62, 0.32, 0.88, 1, 1); leaf(g, 0.55, 0.3, 0.32, 0.4, 1, 2);
    [0.4, 1.0].forEach((y) => bx(0.02, 0.08, 0.04, -0.05, y, 0.05, g).userData.alt = "metal");
    return g;
  },
  n3: () => {
    const g = new THREE.Group(); wf(g, 2, 1.9);
    [-0.7, -0.23, 0.23, 0.7].forEach((x) => leaf(g, 0.44, 1.2, x, 0.72, 1, 3));
    [-0.65, 0, 0.65].forEach((x) => leaf(g, 0.6, 0.38, x, 1.55, 2, 2));
    return g;
  },
  c1: () => {
    const g = new THREE.Group(); bx(0.55, 0.06, 0.5, 0, 0.46, 0, g);
    [[-0.24, -0.22], [0.24, -0.22], [-0.24, 0.22], [0.24, 0.22]].forEach(([a, b]) => bx(0.06, 0.44, 0.06, a, 0.22, b, g));
    bx(0.5, 0.04, 0.04, 0, 0.18, 0.22, g); bx(0.5, 0.04, 0.04, 0, 0.18, -0.22, g);
    [-1, 1].forEach((s) => { bx(0.06, 0.62, 0.05, s * 0.24, 0.78, -0.24, g); bx(0.05, 0.04, 0.52, s * 0.29, 0.74, 0.02, g); bx(0.04, 0.28, 0.1, s * 0.27, 0.6, 0.2, g); });
    bx(0.5, 0.07, 0.04, 0, 1.04, -0.24, g); for (let i = 0; i < 5; i++) bx(0.05, 0.44, 0.025, -0.18 + i * 0.09, 0.8, -0.24, g);
    return g;
  },
  c2: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) bx(0.56, 0.03, 0.08, 0, 0.42 + i * 0.002, -0.2 + i * 0.12, g);
    for (let i = 0; i < 9; i++) bx(0.035, 0.7, 0.02, -0.25 + i * 0.0625, 0.78, -0.3, g).rotation.x = -0.3;
    bx(0.6, 0.09, 0.04, 0, 1.16, -0.4, g).rotation.x = -0.3;
    [-1, 1].forEach((s) => {
      bx(0.05, 0.42, 0.05, s * 0.3, 0.21, 0.24, g); bx(0.05, 0.55, 0.05, s * 0.3, 0.26, -0.32, g).rotation.x = 0.25;
      bx(0.05, 0.04, 0.62, s * 0.31, 0.64, -0.02, g); bx(0.04, 0.24, 0.05, s * 0.31, 0.52, 0.24, g); bx(0.04, 0.05, 0.6, s * 0.3, 0.2, 0, g);
    });
    return g;
  },
  b2: () => {
    const g = new THREE.Group(), W = 1.7, L = 2.1;
    bx(W, 0.22, L, 0, 0.32, 0, g); [-1, 1].forEach((a) => [-1, 1].forEach((b) => bx(0.14, 0.2, 0.14, a * (W / 2 - 0.1), 0.1, b * (L / 2 - 0.1), g)));
    mesh(arch(W, 0.7, 0.25, 0.08), 0, 0.43, -L / 2 - 0.04, g); rose(0, 0.95, -L / 2 + 0.06, g, 0.2);
    [-1, 1].forEach((s) => { ring(0.2, 0.025, s * 0.5, 0.78, -L / 2 + 0.06, g, 1.3, 0.8); ring(0.14, 0.02, s * 0.55, 0.62, L / 2 + 0.05, g); });
    mesh(arch(W, 0.4, 0.14, 0.08), 0, 0.43, L / 2 - 0.04, g); rose(0, 0.72, L / 2 + 0.05, g, 0.14);
    return g;
  },
});

const BGC = {
  d: { iw: 1700, ih: 624, ax: 0.65, ay: 0.75, fh: 0.52, ang: 0 },
  w: { iw: 1700, ih: 632, ax: 0.645, ay: 0.9, fh: 0.88, ang: 0 },
  f: { iw: 1700, ih: 596, ax: 0.635, ay: 0.785, fh: 0.54, ang: 0 },
  r: { iw: 1700, ih: 635, ax: 0.66, ay: 0.9, fh: 0.88, ang: 0 },
  s: { iw: 1700, ih: 627, ax: 0.675, ay: 0.845, fh: 0.58, ang: 1.3 },
};
P.forEach((p) => (p.bg = BGC[p.k]));
const bgRect = (W, H, c, wide) => {
  const s = Math.max(W / c.iw, H / c.ih) * (wide ? 1 : 1.3), w = c.iw * s, h = c.ih * s;
  return { w, h, x: Math.min(0, Math.max(W - w, W * (wide ? 0.66 : 0.5) - c.ax * w)), y: Math.min(0, Math.max(H - h, wide ? H - h : H * 0.55 - c.ay * h)) };
};
const bgSrc = (k) => "/bg/" + k + ".jpg";
const picSrc = (k) => "/pics/" + k + ".webp";
const ROOM = { w: ["w", 66], d: ["d", 66], r: ["r", 66], s: ["s", 62], f: ["f", 60], o1: ["w", 14], o2: ["d", 12], o3: ["f", 8], n1: ["d", 2], n2: ["s", 3], n3: ["r", 4], c1: ["d", 42], c2: ["r", 50], b2: ["s", 34] };
const CATS = ["Doors", "Windows", "Sofas", "Beds", "Chairs", "Dining", "Storage"];
const CATOF = { w: "Storage", d: "Dining", r: "Storage", s: "Beds", f: "Sofas" };
const NEW = [
  ["o1", "Door", "Arched Panel Door Set", "Doors", 38500, "95 × 210 cm with frame", "A raised-panel door with a carved medallion, an arched pediment and a solid frame.", ["#f0b27a", "#e8d5b5", "#9fd0e8"]],
  ["o2", "Double Door", "Carved Double Door Set", "Doors", 112000, "150 × 210 cm with frame", "Twin leaves with arched headers, carved oval panels and a fluted centre post.", ["#e9c27a", "#f3a38f", "#b9dba0"]],
  ["o3", "Grand Door", "Crown Pediment Door Set", "Doors", 96000, "190 × 240 cm with crown", "Eight carved panels, fluted pilasters and a scrolled crown for a grand entrance.", ["#f4b56a", "#c6b6ee", "#86d3d1"]],
  ["n1", "Lattice", "Lattice Window Set", "Windows", 26500, "150 × 150 cm", "Three glazed leaves with hand-cut oval lattice and a slatted ventilation transom.", ["#a9d8b9", "#f4d27b", "#9fd0e8"]],
  ["n2", "Casement", "Casement Window Set", "Windows", 31800, "130 × 170 cm", "A mixed casement with top-hung transoms, tall side leaf and a bottom vent.", ["#9fd0e8", "#f0b27a", "#d8b4f0"]],
  ["n3", "Glazed", "Glazed Grid Window Set", "Windows", 44900, "200 × 190 cm", "Four tall glazed leaves with fine bars and a grid transom above.", ["#86d3d1", "#f5c37e", "#f3a1b3"]],
  ["c1", "Arm Chair", "Slat Arm Chair", "Chairs", 9800, "58 × 55 × 98 cm", "A sturdy slat-back armchair with curved arm supports and a solid seat.", ["#f2c46d", "#f2a0a0", "#b9dba0"]],
  ["c2", "Lounge", "Slatted Lounge Chair", "Chairs", 14500, "62 × 80 × 100 cm", "A reclined lounge chair with a long slatted back and open arms.", ["#f3a38f", "#a9d8b9", "#f4d27b"]],
  ["b2", "Carved Cot", "Carved Cot Bed", "Beds", 118000, "170 × 210 × 120 cm", "A heritage cot with an arched carved headboard, rose medallions and scroll work.", ["#f4b56a", "#f3a1b3", "#9fd0e8"]],
].map(([k, short, name, cat, price, dims, blurb, aura]) => ({ k, short, name, cat, price, dims, blurb, aura }));
const INC1 = { Doors: "Door leaf, frame and handles", Windows: "Window leaves, frame and hinges", Chairs: "Chair made to your seat height", Beds: "Bed frame and carved headboard" };
const G = (c) => ({
  bars: [["Joint strength", 92, "Pegged joinery"], ["Seasoning", 88, "12 months, air and kiln dried"], ["Finish durability", 85, "3-coat polish or paint"]],
  build: [["Wood", "Seasoned Burma teak"], ["Joinery", "Mortise and tenon"], ["Finish", "Any wood tone or paint"]],
  inc: [INC1[c], "Site visit and measuring", "Fitting or assembly", "5-year warranty"],
});
const ALL = [...P.map((p) => ({ ...p, cat: CATOF[p.k] })), ...NEW.map((p) => ({ ...G(p.cat), ...p }))].sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));
const WORKSHOP_VIDEO = ""; // put your workshop film URL here, e.g. "/workshop.mp4"
const money = (n) => "₹" + n.toLocaleString("en-IN");

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
let GP;
const glb = () => GP || (GP = new Promise((res) => new GLTFLoader().load("/models/01_open_wooden_wardrobe.glb", (gl) => { gl.scene.rotation.x = -Math.PI / 2; res(gl.scene); }, undefined, () => res(null))));
const model = (k) => (k === "w" ? glb().then((o) => o && o.clone()) : Promise.resolve(BUILD[k]()));

const mkMat = () => {
  const m = new THREE.MeshPhysicalMaterial({ color: FIN[0][1], roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4, transparent: true, opacity: 0 });
  m.onBeforeCompile = (s) => {
    s.uniforms.uG = { value: 0.3 }; m.userData.u = s.uniforms.uG;
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vP;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvP=position;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vP;\nuniform float uG;").replace("#include <color_fragment>", "#include <color_fragment>\nfloat g=sin(vP.x*38.+sin(vP.z*9.+vP.y*5.)*1.6+sin(vP.y*23.)*.4)*.5+.5; diffuseColor.rgb*=1.-uG+uG*(.6+.8*g);");
  };
  return m;
};
let shT;
const shTex = () => {
  if (shT) return shT;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(40,25,10,.4)"); g.addColorStop(1, "rgba(40,25,10,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return (shT = new THREE.CanvasTexture(c));
};
const lights = (sc, shadow, warm) => {
  sc.add(new THREE.HemisphereLight(warm ? 0xffe3c0 : 0xffffff, warm ? 0x7a4a22 : 0xcdb79e, warm ? 0.85 : 0.9));
  const d = new THREE.DirectionalLight(warm ? 0xffd7a0 : 0xfff0dd, warm ? 1.4 : 1.6); d.position.set(4, 6, 5);
  if (shadow) { d.castShadow = true; d.shadow.mapSize.set(1024, 1024); const c = d.shadow.camera; c.left = c.bottom = -4; c.right = c.top = 4; c.near = 1; c.far = 20; d.shadow.bias = -0.0005; }
  sc.add(d); const r = new THREE.DirectionalLight(0xc6d6ff, 0.7); r.position.set(-5, 2, -4); sc.add(r);
};
const prep = (o) => {
  const mat = mkMat(), alt = { glass: new THREE.MeshStandardMaterial({ color: 0xe6edf2, roughness: 0.1, metalness: 0.2, transparent: true, depthWrite: false }), metal: new THREE.MeshStandardMaterial({ color: 0xcbc6bd, roughness: 0.35, metalness: 0.35, transparent: true }) };
  o.traverse((n) => { if (n.isMesh) { n.material = n.userData.alt ? alt[n.userData.alt] : mat; n.castShadow = n.receiveShadow = true; if (!n.geometry.attributes.normal) n.geometry.computeVertexNormals(); } });
  const hold = new THREE.Group(); hold.add(o); hold.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(hold), sz = bb.getSize(new THREE.Vector3());
  hold.position.copy(bb.getCenter(new THREE.Vector3())).negate();
  const k = 3.2 / Math.max(sz.x, sz.y, sz.z), sg = new THREE.Group(); sg.scale.setScalar(k); sg.add(hold);
  const spin = new THREE.Group(); spin.add(sg); const piv = new THREE.Group(); piv.add(spin); piv.scale.setScalar(0.01);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shTex(), transparent: true, depthWrite: false, opacity: 0 }));
  const fy = (-sz.y * k) / 2; sh.rotation.x = -Math.PI / 2; sh.position.y = fy - 0.03;
  const f = Math.max(sz.x, sz.z) * k * 1.5; sh.scale.set(f, f * 0.8, 1); piv.add(sh);
  return { piv, spin, mat, alt, sh, fy, ww: Math.max(sz.x, sz.z) * k, o: 0, v: 0.35 };
};
async function thumbs(list) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(420, 420); r.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 1.4, 10); cam.lookAt(0, 0, 0); lights(sc);
  const out = {};
  for (const p of list) {
    const o = await model(p.k); if (!o) continue;
    const it = prep(o); it.mat.opacity = 1; it.mat.transparent = false; it.sh.material.opacity = 1; it.piv.scale.setScalar(1.05); it.spin.rotation.y = p.k[0] === "o" || p.k[0] === "n" ? 0.5 : 0.6;
    sc.add(it.piv); r.render(sc, cam); out[p.k] = r.domElement.toDataURL("image/png"); sc.remove(it.piv);
  }
  r.dispose(); r.forceContextLoss(); return out;
}

function Stage({ list, active, detail, fin, solo, onReady }) {
  const box = R(null), live = R({});
  live.current = { active, detail, fin };
  E(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputEncoding = THREE.sRGBEncoding;
    if (solo) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
    box.current.appendChild(r.domElement);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, solo ? 0.5 : 0, 10.5); cam.lookAt(0, 0, 0); lights(sc, solo, !solo);
    const size = () => { const w = box.current.clientWidth, h = box.current.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener("resize", size);
    const items = []; let dead = false;
    Promise.all(list.map((p) => model(p.k))).then((scs) => {
      if (dead) return;
      scs.forEach((o, idx) => {
        if (!o) return; const it = prep(o); it.bg = list[idx].bg; it.drag = 0; it.ry = 0;
        if (solo) { it.sh.visible = false; const gd = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.22 })); gd.rotation.x = -Math.PI / 2; gd.position.y = it.fy - 0.03; gd.receiveShadow = true; it.piv.add(gd); }
        sc.add(it.piv); items.push(it);
      });
      onReady && onReady();
    });
    let mx = 0, my = 0, drag = null, prev = -1, raf;
    const dn = (e) => { if (e.target === r.domElement) { drag = { x: e.clientX }; r.domElement.style.cursor = "grabbing"; } };
    const mv = (e) => {
      mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1;
      if (drag) { const it = items[live.current.active]; if (it) { if (solo) it.spin.rotation.y += (e.clientX - drag.x) * 0.011; else it.drag += (e.clientX - drag.x) * 0.011; } drag.x = e.clientX; }
    };
    const up = () => { drag = null; r.domElement.style.cursor = "grab"; };
    addEventListener("pointerdown", dn); addEventListener("pointermove", mv); addEventListener("pointerup", up);
    const clock = new THREE.Clock(), tc = new THREE.Color();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const rc = box.current.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > innerHeight) { clock.getDelta(); return; }
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, L = live.current, cw = box.current.clientWidth, ch = box.current.clientHeight, wide = cw > 900;
      const kk = 1 - Math.exp(-dt * (rm ? 20 : 4.2));
      if (!solo && L.active !== prev) { prev = L.active; if (items[L.active] && !rm) items[L.active].ry = 3.2; }
      tc.setHex(FIN[L.fin][1]);
      items.forEach((it, i) => {
        const d = i - L.active, a = d === 0, p = it.piv;
        let tx = 0, ty = 0, ts = 1.08, to = 1;
        if (!solo) {
          const fhh = wide ? 0.5 : 0.32, upp = 5.627 / ch;
          ts = Math.min((fhh * ch * upp) / -(2 * it.fy), ((wide ? 0.34 : 0.7) * cw * upp) / it.ww) * (a ? 1 : 0.92); to = a ? 1 : 0;
          tx = ((wide ? 0.78 : 0.5) * cw - cw / 2) * upp; ty = -((wide ? 0.93 : 0.56) * ch - ch / 2) * upp - it.fy * ts;
        }
        ty += rm ? 0 : Math.sin(t * 1.1 + i * 2) * 0.03;
        p.position.x += (tx - p.position.x) * kk; p.position.y += (ty - p.position.y) * kk;
        p.scale.setScalar(p.scale.x + (ts - p.scale.x) * kk);
        it.o += (to - it.o) * kk; it.mat.opacity = it.o; it.mat.transparent = it.o < 0.99; it.sh.material.opacity = it.o; it.alt.metal.opacity = it.o; it.alt.glass.opacity = it.o * 0.35; p.visible = it.o > 0.01;
        it.mat.color.lerp(tc, kk); const u = it.mat.userData.u; if (u) u.value += ((FIN[L.fin][2] ? 0.04 : 0.3) - u.value) * kk;
        if (solo) { it.v += ((rm ? 0 : 0.35) - it.v) * (1 - Math.exp(-dt * 2)); if (!drag) it.spin.rotation.y += it.v * dt; }
        else { it.ry += (0 - it.ry) * (1 - Math.exp(-dt * 2.2)); if (!drag) it.drag *= Math.exp(-dt * 0.35); it.spin.rotation.y = (it.bg.ang || 0) + it.drag + it.ry + (rm ? 0 : Math.sin(t * 0.6 + i) * 0.3); }
        p.rotation.x += ((a ? my * 0.08 : 0) - p.rotation.x) * kk; p.rotation.z += ((a ? -mx * 0.04 : 0) - p.rotation.z) * kk;
      });
      r.render(sc, cam);
    };
    r.domElement.style.cursor = "grab"; r.domElement.style.touchAction = "pan-y"; loop();
    return () => { dead = true; cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("pointerdown", dn); removeEventListener("pointermove", mv); removeEventListener("pointerup", up); r.dispose(); r.domElement.remove(); };
  }, []);
  return <div className="stage" ref={box} />;
}

const Words = ({ text }) => (<>{text.split(" ").map((w, j) => <span className="w" key={j}><span style={{ animationDelay: 0.05 * j + "s" }}>{w}&nbsp;</span></span>)}</>);
const Swatches = ({ v, set }) => FIN.map(([nm, c, pt], j) => <button key={nm} role="radio" aria-checked={v === j} aria-label={nm} title={nm} className={(v === j ? "on " : "") + (pt ? "pt" : "")} style={{ background: hex(c) }} onClick={() => set(j)} />);
const go2 = (id) => document.getElementById(id).scrollIntoView({ behavior: "smooth" });

function App() {
  const [i, setI] = S(0), [det, setDet] = S(false), [fin, setFin] = S(0), [tab, setTab] = S(0), [ok, setOk] = S(false);
  const [n, setN] = S(0), [toast, setToast] = S(""), [cat, setCat] = S("All"), [view, setView] = S(null), [vf, setVf] = S(0);
  const [vid, setVid] = S(WORKSHOP_VIDEO), tm = R(0), ir = R(0), p = P[i];
  const hr = R(null), [dm, setDm] = S([innerWidth, innerHeight]);
  E(() => { const f = () => hr.current && setDm([hr.current.clientWidth, hr.current.clientHeight]); f(); addEventListener("resize", f); return () => removeEventListener("resize", f); }, []);
  ir.current = i; const go = (d) => setI((v) => (v + d + P.length) % P.length);
  const say = (t) => { setToast(t); clearTimeout(tm.current); tm.current = setTimeout(() => setToast(""), 2800); };
  const enq = (nm, f) => { setN((v) => v + 1); say(`${nm} in ${FIN[f][0]} added to your enquiry list`); };
  const open = (q) => { setVf(0); setView(q); };
  const shift = (d) => { const j = (ALL.indexOf(view) + d + ALL.length) % ALL.length; setView(ALL[j]); };

  E(() => { document.body.style.overflow = view ? "hidden" : ""; document.body.dataset.modal = view ? "1" : ""; }, [view]);
  E(() => {
    const h = (e) => { if (e.key === "Escape") { setView(null); setDet(false); } if (!det && !view && scrollY < 20 && e.key === "ArrowRight") go(1); if (!det && !view && scrollY < 20 && e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [det, view]);
  E(() => {
    let acc = 0, last = 0, y0 = null, d0 = null;
    const wh = (e) => {
      if (det || scrollY > 20 || document.body.dataset.modal) return;
      const dir = e.deltaY > 0 ? 1 : -1, c = ir.current;
      if ((dir > 0 && c >= P.length - 1) || (dir < 0 && c <= 0)) return;
      e.preventDefault(); const now = Date.now(); if (now - last < 650) return;
      acc += e.deltaY; clearTimeout(wh.t); wh.t = setTimeout(() => (acc = 0), 200);
      if (Math.abs(acc) > 40) { go(dir); acc = 0; last = now; }
    };
    const ts = (e) => { y0 = e.touches[0].clientY; };
    const te = (e) => { if (!det && scrollY < 20 && y0 !== null && Math.abs(y0 - e.changedTouches[0].clientY) > 60) go(y0 > e.changedTouches[0].clientY ? 1 : -1); y0 = null; };
    const pd = (e) => { d0 = [e.clientX, e.clientY]; };
    const ck = (e) => { if (!det || !d0 || Math.hypot(e.clientX - d0[0], e.clientY - d0[1]) > 6) return; if (!e.target.closest(".copy,.fin,.nav,.toast")) setDet(false); };
    addEventListener("wheel", wh, { passive: false }); addEventListener("touchstart", ts, { passive: true }); addEventListener("touchend", te);
    addEventListener("pointerdown", pd); addEventListener("click", ck);
    return () => { removeEventListener("wheel", wh); removeEventListener("touchstart", ts); removeEventListener("touchend", te); removeEventListener("pointerdown", pd); removeEventListener("click", ck); };
  }, [det]);

  const tilt = (e) => { const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; e.currentTarget.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`; };
  const flat = (e) => { e.currentTarget.style.transform = ""; };
  const shown = ALL.filter((q) => cat === "All" || q.cat === cat);

  return (
    <>
      <header className="nav">
        <button className="brand" onClick={() => go2("top")} aria-label="AURA FURNITURES home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7.5" opacity=".6" /><circle cx="12" cy="12" r="11" opacity=".3" /></svg>AURA FURNITURES
        </button>
        <nav aria-label="Sections">
          <button onClick={() => go2("top")}>Showcase</button><button onClick={() => go2("rooms")}>Rooms</button><button onClick={() => go2("catalogue")}>Catalogue</button><button onClick={() => go2("workshop")}>Workshop</button>
          <button onClick={() => n && say(`${n} piece${n > 1 ? "s" : ""} in your enquiry list`)}>Enquiries <b>{n}</b></button>
        </nav>
        <button className="cta sm" onClick={() => go2("workshop")}>Visit the Workshop</button>
      </header>

      <section className="hero" id="top" ref={hr}>
        {P.map((q, j) => { const r = bgRect(dm[0], dm[1], q.bg, dm[0] > 900); return <img key={q.k} className={"bg" + (j === i ? " on" : "")} src={bgSrc(q.k)} alt="" draggable={false} style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />; })}
        <div className="scrim" />
        <Stage list={P} active={i} detail={det} fin={fin} onReady={() => setOk(true)} />
        {!ok && <div className="load" role="status">Preparing the workshop</div>}
        <main className="ui">
          {!det ? (
            <section className="copy" key={"s" + i}>
              <h1><Words text={p.name} /></h1><p>{p.blurb}</p>
              <button className="link" onClick={() => { setDet(true); setTab(0); }}>Product details <span aria-hidden>↗</span></button>
            </section>
          ) : (
            <section className="copy det" key={"d" + i}>
              <button className="back" onClick={() => setDet(false)}>← All pieces</button>
              <h2><Words text={p.name} /></h2><p className="dims">{p.dims}</p>
              <div className="tabs" role="tablist">{["Performance", "Build", "In the set"].map((t, j) => <button key={t} role="tab" aria-selected={tab === j} className={tab === j ? "on" : ""} onClick={() => setTab(j)}>{t}</button>)}</div>
              <div className="panel" key={tab}>
                {tab === 0 && p.bars.map(([l, v, t]) => <div className="bar" key={l}><div><span>{l}</span><em>{t}</em></div><i><b style={{ width: v + "%" }} /></i></div>)}
                {tab === 1 && <div className="cols">{p.build.map(([l, t]) => <div key={l}><h4>{l}</h4><p>{t}</p></div>)}</div>}
                {tab === 2 && <ul>{p.inc.map((t) => <li key={t}>{t}</li>)}</ul>}
              </div>
              <div className="buy"><strong>{money(p.price)}</strong><button className="cta" onClick={() => enq(p.name, fin)}>Add to enquiry</button></div>
            </section>
          )}
          <div className="fpanel"><b>Choose finish</b><div className="sw" role="radiogroup" aria-label="Finish"><Swatches v={fin} set={setFin} /></div><span>{FIN[fin][0]}</span></div>
          {!det && <div className="count"><button onClick={() => go(-1)} aria-label="Previous piece">←</button><span key={i}>{String(i + 1).padStart(2, "0")} / {String(P.length).padStart(2, "0")}</span><button onClick={() => go(1)} aria-label="Next piece">→</button></div>}
        </main>
      </section>

      <div className="tick" aria-hidden="true"><div>{Array(2).fill("DOOR SETS ✦ WINDOW SETS ✦ SOFA SETS ✦ BEDS ✦ CHAIRS ✦ DINING ✦ MADE TO MEASURE ✦ PURE TEAK ✦ ").join("")}</div></div>

      <section className="sec" id="rooms">
        <div className="hd"><div><p className="eb">The Aura Archive</p><h2>Six Rooms. <em>Real Wood.</em></h2></div><p className="side">Cut by hand, finished in your colour.</p></div>
        <div className="arches">
          {CATS.slice(0, 6).map((c) => { const it = ALL.find((x) => x.cat === c); return (
            <button className="arch" key={c} onClick={() => { setCat(c); go2("catalogue"); }}>
              <span className="win" style={{ "--c": it.aura[0] }}><img className="rb" src={bgSrc(ROOM[it.k][0])} alt="" style={{ objectPosition: ROOM[it.k][1] + "% 50%" }} /><s className="ov" /><img className="pic" src={picSrc(it.k)} alt={it.name} /></span><b>{c}</b>
            </button>); })}
        </div>
      </section>

      <section className="sec" id="catalogue">
        <div className="hd"><div><p className="eb">The Catalogue</p><h2>Pick a <em>Piece</em></h2></div><p className="side">Tap a card for the full 3D view, wood tones and paint colours.</p></div>
        <div className="chips" role="tablist">{["All", ...CATS].map((c) => <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c} <b>{c === "All" ? ALL.length : ALL.filter((x) => x.cat === c).length}</b></button>)}</div>
        <div className="grid">
          {shown.map((q) => (
            <article className="card" key={q.k} style={{ "--c": q.aura[0], "--d": q.aura[1] }} onPointerMove={tilt} onPointerLeave={flat} onClick={() => open(q)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(q)}>
              <img className="rb" src={bgSrc(ROOM[q.k][0])} alt="" style={{ objectPosition: ROOM[q.k][1] + "% 50%" }} /><s className="ov" /><h3>{q.short.toUpperCase()}</h3><img className="pic" src={picSrc(q.k)} alt={q.name} />
              <span className="nm">{q.name}</span><span className="pr">{money(q.price)}</span>
              <button className="plus" aria-label={"Add " + q.name} onClick={(e) => { e.stopPropagation(); enq(q.name, 0); }}>+</button>
            </article>))}
        </div>
      </section>

      <section className="sec work" id="workshop">
        <div className="hd"><div><p className="eb">Contact and Workshop</p><h2>Watch it <em>being made</em></h2></div><p className="side">Every piece is built in front of the camera, start to finish.</p></div>
        <div className="film">
          <i className="cn a" /><i className="cn b" /><i className="cn c" /><i className="cn d" />
          {vid ? <video src={vid} controls autoPlay muted loop playsInline /> : (
            <label className="drop"><input type="file" accept="video/*" onChange={(e) => e.target.files[0] && setVid(URL.createObjectURL(e.target.files[0]))} />
              <b>Your workshop film goes here</b><small>Add your real-time making video. Choose an MP4 to preview it, or set WORKSHOP_VIDEO in the code.</small></label>)}
          <span className="live">● Live from the workshop</span>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); say("Thank you. We will call you back within a day."); e.target.reset(); }}>
          <h3>Start a custom order</h3>
          <input required placeholder="Your name" aria-label="Name" /><input required type="tel" placeholder="Phone number" aria-label="Phone" />
          <select aria-label="Piece" defaultValue=""><option value="" disabled>Which piece?</option>{ALL.map((q) => <option key={q.k}>{q.name}</option>)}<option>Something else</option></select>
          <textarea rows="3" placeholder="Size, wood, colour, anything we should know" aria-label="Message" />
          <button className="cta" type="submit">Send enquiry</button>
        </form>
      </section>
      <footer className="foot2"><b>AURA FURNITURES</b><span>Solid wood furniture, made to order. Doors, windows, sofas, beds and chairs.</span></footer>

      {view && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={view.name} onClick={(e) => e.target === e.currentTarget && setView(null)}>
          <div className="vwr">
            <div className="vl" style={{ "--a": view.aura[0], "--b": view.aura[1] }}>
              <img className="rb big" src={bgSrc(ROOM[view.k][0])} alt="" style={{ objectPosition: ROOM[view.k][1] + "% 60%" }} /><s className="ov" />
              <Stage key={view.k} list={[view]} solo active={0} detail={false} fin={vf} />
              <figure className="rp"><img src={picSrc(view.k)} alt={"Real " + view.name} /><figcaption>Real piece</figcaption></figure>
              <div className="dock sw" role="radiogroup" aria-label="Wood tone or paint"><Swatches v={vf} set={setVf} /><span>{FIN[vf][0]}</span></div>
              <button className="nx l" onClick={() => shift(-1)} aria-label="Previous piece">←</button><button className="nx r" onClick={() => shift(1)} aria-label="Next piece">→</button>
              <span className="hint">Drag to rotate</span>
            </div>
            <aside key={view.k}>
              <button className="x" onClick={() => setView(null)}>Close ×</button>
              <p className="eb">{view.cat}</p><h2>{view.name}</h2><p className="dims">{view.dims}</p><p className="bl">{view.blurb}</p>
              <p className="cur">Finish: {FIN[vf][0]}. Change it with the colour bar on the 3D view.</p>
              {view.bars.map(([l, v, t]) => <div className="bar" key={l}><div><span>{l}</span><em>{t}</em></div><i><b style={{ width: v + "%" }} /></i></div>)}
              <div className="buy"><strong>{money(view.price)}</strong><button className="cta" onClick={() => enq(view.name, vf)}>Add to enquiry</button></div>
            </aside>
          </div>
        </div>
      )}
      <div className="toast" role="status" aria-live="polite" data-on={!!toast}>{toast}</div>
    </>
  );
}

export default App;
