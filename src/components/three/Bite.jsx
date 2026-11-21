"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { story } from "@/lib/story";
import { createBite, createGrain, seeded } from "./biteGeometry";
import { chocolate, core, puff } from "./materials";
import { toWorld, viewSize } from "./viewport";

const damp = THREE.MathUtils.damp;
const X = new THREE.Vector3(1, 0, 0);

// One half of the bite: chocolate shell + crunchy core + the puffs on its surface, all clipped by a plane that
// follows the half in world space, so with split = 0 the two halves make one seamless bite.
// grains packed through the core: the clip plane slices them, so the broken face shows a crunchy cross-section
const INNER = (() => {
  const r = seeded(31), out = [];
  while (out.length < 150) {
    const p = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (p.length() > 1) continue;
    p.multiplyScalar(.8).set(p.x * 1.06, p.y * .9, p.z);
    out.push({ p, s: .07 + r() * .06, rot: new THREE.Euler(r() * 6, r() * 6, r() * 6), light: r() < .55 });
  }
  return out;
})();

function Half({ shell, puffs, clip }) {
  const puffsRef = useRef(), innerA = useRef(), innerB = useRef();
  const grain = useMemo(() => createGrain(11), []);
  const mats = useMemo(() => ({
    shell: chocolate(clip), core: core(clip), puff: puff(clip),
    crumbLight: new THREE.MeshStandardMaterial({ color: "#d9ab70", roughness: .85, clippingPlanes: [clip], side: THREE.DoubleSide }),
    crumbDark: new THREE.MeshStandardMaterial({ color: "#9a5f34", roughness: .8, clippingPlanes: [clip], side: THREE.DoubleSide }),
  }), [clip]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    puffs.forEach((p, i) => {
      q.setFromUnitVectors(up, p.n);
      m.compose(p.p, q, new THREE.Vector3(p.s, p.s * .7, p.s));
      puffsRef.current.setMatrixAt(i, m);
    });
    puffsRef.current.instanceMatrix.needsUpdate = true;
    let a = 0, b = 0;
    INNER.forEach(g => {
      m.compose(g.p, q.setFromEuler(g.rot), new THREE.Vector3(g.s, g.s * .75, g.s));
      if (g.light) innerA.current.setMatrixAt(a++, m); else innerB.current.setMatrixAt(b++, m);
    });
    innerA.current.count = a; innerB.current.count = b;
    innerA.current.instanceMatrix.needsUpdate = innerB.current.instanceMatrix.needsUpdate = true;
  }, [puffs]);
  return (
    <>
      <mesh geometry={shell} material={mats.shell} />
      <mesh geometry={shell} material={mats.core} scale={0.86} />
      <instancedMesh ref={puffsRef} args={[grain, mats.puff, puffs.length]} />
      <instancedMesh ref={innerA} args={[grain, mats.crumbLight, INNER.length]} />
      <instancedMesh ref={innerB} args={[grain, mats.crumbDark, INNER.length]} />
    </>
  );
}

export default function Bite({ shopLanding }) {
  const { camera, size } = useThree();
  const root = useRef(), spin = useRef(), halfA = useRef(), halfB = useRef(), orbit = useRef();
  const outline = useRef();
  const { geo, puffs } = useMemo(() => createBite({ seed: 7 }), []);
  // world-space planes, refreshed every frame from each half's transform (a small overlap hides the seam)
  const clipA = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.004), []);
  const clipB = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.004), []);

  // millet grains that circle the bite in the story chapter
  const orbitGrains = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 22 }, (_, i) => ({ a: (i / 22) * Math.PI * 2, rad: 1.5 + r() * .5, tilt: (r() - .5) * .8, s: .05 + r() * .05, sp: .25 + r() * .3, ragi: r() < .4 }));
  }, []);
  const grainGeo = useMemo(() => createGrain(5), []);
  const grainMats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: "#e2bf7a", roughness: .7 }),   // jowar: pale gold
    new THREE.MeshStandardMaterial({ color: "#7b3d22", roughness: .6 }),   // ragi: red-brown
  ], []);

  const eased = useRef({ px: 0, py: 0 });
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), n: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const b = story.bite, view = viewSize(camera, size), t = state.clock.elapsedTime;
    const e = eased.current;
    e.px = damp(e.px, story.pointer.x, 3, dt); e.py = damp(e.py, story.pointer.y, 3, dt);

    let [wx, wy] = toWorld(view, b.x, b.y);
    let scale = b.s*view.h/2.1, wz=0;
    const lifted = story.liftedBite;
    const closeup = lifted.active ? story.insideTravel : 1;
    if (lifted.active) {
      const arc = Math.sin(Math.PI*closeup);
      wx = THREE.MathUtils.lerp(lifted.x,wx,closeup) - arc*.035*view.w;
      wy = THREE.MathUtils.lerp(lifted.y,wy,closeup) + arc*.105*view.h;
      wz = lifted.z*(1-closeup);
      scale = THREE.MathUtils.lerp(lifted.radius,scale,closeup);
    }
    const travel = story.shopTravel;
    const g = root.current;
    g.visible = scale > .001 && travel < 1;
    if (!g.visible) return;
    const landing = shopLanding.current;
    if (travel > 0 && landing?.parent.visible) {
      const target = landing.getWorldPosition(tmp.p);
      const landingSize = landing.getWorldScale(tmp.n).x * .12;
      const approach = THREE.MathUtils.smoothstep(travel, 0, .80);
      wx = THREE.MathUtils.lerp(wx, target.x, approach);
      wz = THREE.MathUtils.lerp(wz, target.z, approach);
      wy = THREE.MathUtils.lerp(wy, target.y, travel) + Math.sin(Math.PI * travel) * .16 * view.h;
      scale = THREE.MathUtils.lerp(scale, landingSize, approach);
    }
    const drift = closeup * (1 - travel);
    g.position.set(wx + e.px*.12*drift, wy + (Math.sin(t*1.1)*.06*scale + e.py*.08)*drift, wz);
    g.scale.setScalar(Math.max(scale, .0001));

    // idle spin + cursor tilt + whatever the timeline asks for (and rolling, for the "Why" row);
    // while it breaks open it settles face-on, so the halves part sideways and show their cut faces
    const s = b.split, face = s * s * (3 - 2 * s);
    const yIdle = t * .35 + b.ry + e.px * .45, yFront = Math.round(yIdle / (Math.PI * 2)) * Math.PI * 2;
    spin.current.rotation.set(
      THREE.MathUtils.lerp(.35 + b.rx + e.py * .25, .12 + e.py * .1, face),
      THREE.MathUtils.lerp(yIdle, yFront + e.px * .2, face),
      (b.rz - b.roll) * (1 - face),
    );

    outline.current.visible = story.outline > .001 && s < .001;
    outline.current.scale.setScalar(1 + .035 * story.outline);

    // break open: the halves slide apart and turn their faces toward us
    // (the left half's cut faces +x: turning it by −y brings that face round toward the camera, and vice versa)
    halfA.current.position.x = -s * .95; halfA.current.rotation.y = -s * 1.05;
    halfB.current.position.x = s * .95;  halfB.current.rotation.y = s * 1.05;

    // clip planes follow each half (normal = the half's local x axis in world space)
    for (const [half, plane, sign] of [[halfA.current, clipA, -1], [halfB.current, clipB, 1]]) {
      half.updateWorldMatrix(true, false);
      tmp.n.copy(X).transformDirection(half.matrixWorld).multiplyScalar(sign);
      tmp.p.setFromMatrixPosition(half.matrixWorld);
      plane.setFromNormalAndCoplanarPoint(tmp.n, tmp.p);
      plane.constant += 0.004 * scale;
    }

    // the grain halo
    const o = orbit.current, k = story.orbit;
    o.visible = k > .01;
    if (o.visible) o.children.forEach((m, i) => {
      const d = orbitGrains[i], a = d.a + t * d.sp, rad = d.rad * (0.6 + 0.4 * k);
      m.position.set(Math.cos(a) * rad, Math.sin(a * 2) * .25 + d.tilt, Math.sin(a) * rad);
      m.scale.setScalar(d.s * k);
      m.rotation.set(t * .8 + i, t * .6, 0);
    });
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        <mesh ref={outline} geometry={geo} visible={false}>
          <meshBasicMaterial color="#fffaf1" side={THREE.BackSide} toneMapped={false} />
        </mesh>
        <group ref={halfA}><Half shell={geo} puffs={puffs} clip={clipA} /></group>
        <group ref={halfB}><Half shell={geo} puffs={puffs} clip={clipB} /></group>
      </group>
      <group ref={orbit}>
        {orbitGrains.map((d, i) => <mesh key={i} geometry={grainGeo} material={grainMats[d.ragi ? 1 : 0]} />)}
      </group>
    </group>
  );
}
