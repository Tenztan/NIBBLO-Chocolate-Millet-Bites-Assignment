import * as THREE from "three";

const PI = Math.PI;
const bell = (x, width) => Math.exp(-((x / width) ** 2));

// Both poses share a topology. Their matching side edges keep the bellows attached
// as the zipper spreads, and let the GPU interpolate between the two shapes.
function panel(u, v, sign, open) {
  const x = u * 2 - 1;
  const arch = Math.pow(Math.max(0, 1 - x * x), .65);
  const belly = Math.pow(Math.max(0, Math.sin(PI * v)), .65);
  const corner = .034 * (bell(v,.014) + bell(1-v,.015));
  const notch = .019 * bell(v - .936,.005);
  const width = .89 + .066 * v + .028 * belly - .028 * bell(v, .033) - .019 * bell(1-v, .024) - corner - notch;
  const seal = .016 * bell(v - .873, .006) + .013 * bell(v - .895, .007);
  const crimp = .003 * Math.cos(v * 630) * (bell(v, .021) + bell(1-v, .019));
  const crease = (.023 * Math.sin(v * 26 + x * 6) + .016 * Math.sin(v * 47 - x * 12))
    * Math.pow(Math.abs(x), 2.8) * belly;
  const fromEdge = 1 - Math.abs(x);
  const welded = bell(fromEdge,.028);
  const foldLine = (base, slope, reach) =>
    bell(v - base - slope * fromEdge - .012*Math.sin(fromEdge*10),.022) * Math.exp(-fromEdge/reach);
  const diagonal = .040 * foldLine(.10,.27,.28) - .023 * foldLine(.18,.17,.32)
    + .027 * foldLine(x < 0 ? .77 : .81,-.19,.25);
  const mouth = open * .43 * Math.pow(v, 4.8);
  const z = .012 + .155 * belly + arch * (.31 * belly + .065 * (1-v) + mouth) + seal + crease + crimp + diagonal - .028*welded*belly;
  return [
    width * x * (1 - open * .063 * Math.pow(v, 4)),
    (v - .5) * 2.76 + .042 * Math.abs(x) ** 6 * (1 - 2 * v) + .010 * Math.sin(x * 3) * v**7 - open * .12 * arch * v ** 6,
    sign * z
  ];
}

function sheet(cols, rows, sample, reverse = false, mirror = false) {
  const position = [], opened = [], uv = [], index = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols, v = j / rows;
      position.push(...sample(u, v, 0));
      opened.push(...sample(u, v, 1));
      uv.push(mirror ? 1-u : u, v);
      if (i === cols || j === rows) continue;
      const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
      index.push(...(reverse ? [a,c,b,b,c,d] : [a,b,c,b,d,c]));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(index);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  const target = new THREE.BufferGeometry();
  target.setIndex(index);
  target.setAttribute("position", new THREE.Float32BufferAttribute(opened, 3));
  target.computeVertexNormals();
  geometry.morphAttributes.position = [target.attributes.position];
  geometry.morphAttributes.normal = [target.attributes.normal];
  geometry.computeBoundingSphere();
  target.dispose();
  return geometry;
}

export function createPouch() {
  const parts = [];
  for (const sign of [1, -1]) {
    const face = (u,v,open) => panel(u,v,sign,open);
    parts.push({ material: sign > 0 ? "front" : "back", geo: sheet(54, 132, face, sign < 0, sign < 0) });
    // Warm foil lining and a narrow rolled lip remain visible through the open mouth.
    parts.push({ material: "lining", geo: sheet(54, 132, (u,v,open) => {
      const [x,y,z] = face(u,v,open);
      return [x * .997, y - .005, z - sign * .012];
    }, sign > 0) });
    parts.push({ material: "rim", geo: sheet(54, 2, (u,v,open) => {
      const [x,y,z] = face(u,1,open);
      return [x, y - v * .008, z - sign * v * .009];
    }) });
    for (const vZip of [.872, .895]) {
      parts.push({ material: "zipper", geo: sheet(40, 4, (u,v,open) => {
        const [x,y,z] = face(u, vZip + .004 * (2*v-1), open);
        return [x * .997, y, z - sign * (.018 + .014 * Math.sin(Math.PI*v))];
      }) });
    }
    // Accordion gusset collapses to a centre valley, especially near the base.
    parts.push({ material: "fold", geo: sheet(14, 132, (u,v,open) => {
      const [x,y,z] = panel(sign > 0 ? 1 : 0,v,1,open);
      const pleat = 1 - Math.abs(2*u - 1);
      return [x - sign * pleat * (.023 + .075 * Math.sin(PI*v)), y, z * (u*2-1)];
    }) });
  }
  parts.push({ material: "fold", geo: sheet(54, 4, (u,v,open) => {
    const [x,y,z] = panel(u,0,1,open);
    return [x, y + .024 * Math.sin(PI*v), z * (v*2-1)];
  }) });
  return parts;
}
