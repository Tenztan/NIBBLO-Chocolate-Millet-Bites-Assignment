import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A chocolate-coated millet bite, made in code (no model download).
// Start from a dense sphere, squash it into a nugget, then push the surface out around ~70 random points
// so it reads as puffed grains clumped under a chocolate coat. Everything comes from one seed, so it looks
// the same on every load.

export function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// cheap smooth 3D noise (sum of sines), enough for low-frequency lumpiness
const lump = (x, y, z) =>
  Math.sin(x * 2.1 + 1.3) * Math.sin(y * 1.7 + .4) * Math.sin(z * 2.3 + 2.1) * .55 +
  Math.sin(x * 4.3 + 3.1) * Math.sin(y * 3.9 + 1.7) * Math.sin(z * 4.1 + .3) * .25;

// a welded (indexed) sphere, so displaced vertices share normals and the coat shades smoothly
function sphere(detail) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute("normal"); g.deleteAttribute("uv");
  return mergeVertices(g);
}

export function createBite({ seed = 7, detail = 34, bumps = 110 } = {}) {
  const rand = seeded(seed);
  const geo = sphere(detail);
  const pos = geo.attributes.position;

  // bump centres on the unit sphere: mostly small crisp-sized bumps, some broader lumps
  const centres = Array.from({ length: bumps }, () => {
    const u = rand() * 2 - 1, t = rand() * Math.PI * 2, r = Math.sqrt(1 - u * u);
    const big = rand() < .25;
    return { d: new THREE.Vector3(r * Math.cos(t), u, r * Math.sin(t)), big,
      w: big ? .05 + rand() * .05 : .014 + rand() * .02, h: big ? .075 + rand() * .06 : .05 + rand() * .045 };
  });

  // how far the surface is pushed out in a direction: soft lumps plus every bump close enough
  const surface = dir => {
    let push = lump(dir.x, dir.y, dir.z) * .21 + .035 * Math.sin(dir.x * 6 + dir.z * 3);
    for (const c of centres) {
      const d = 1 - dir.dot(c.d);                     // 0 at the centre, grows with angle
      if (d < c.w) push += c.h * Math.pow(1 - d / c.w, 2);
    }
    return 1 + push;
  };

  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    v.multiplyScalar(surface(v));
    v.set(v.x * 1.06, v.y * .9, v.z);                 // a little wider than tall, like the pack shot
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  // the puffs that poke through the chocolate: toasted grains sitting on about half of the small bumps
  const puffs = centres.filter(c => !c.big && rand() < .4).map(c => {
    const p = c.d.clone().multiplyScalar(surface(c.d) - .012);   // sitting on the coat, half poking out
    p.set(p.x * 1.06, p.y * .9, p.z);
    return { p, n: c.d.clone(), s: .05 + rand() * .04 };
  });

  return { geo, puffs };
}

// One small millet grain / rice puff: a squashed, slightly lumpy sphere.
export function createGrain(seed = 3) {
  const rand = seeded(seed);
  const geo = sphere(3);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.multiplyScalar(1 + (rand() - .5) * .12);
    pos.setXYZ(i, v.x * 1.15, v.y * .82, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
