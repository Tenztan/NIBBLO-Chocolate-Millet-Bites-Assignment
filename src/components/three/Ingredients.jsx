"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { story, INGREDIENTS, INGREDIENTS_MOBILE } from "@/lib/story";
import { createGrain, seeded } from "./biteGeometry";
import { chocolate } from "./materials";
import { toWorld, viewSize } from "./viewport";

const smooth = t => t * t * (3 - 2 * t);

// Each ingredient is a little cluster of pieces, built from simple shapes.
function useClusters() {
  return useMemo(() => {
    const r = seeded(41), grain = createGrain(9);
    const mat = (color, roughness) => new THREE.MeshStandardMaterial({ color, roughness });
    const jowar = mat("#e2bf7a", .7), ragi = mat("#7b3d22", .6), cocoa = mat("#5e301b", .45),
      jaggery = new THREE.MeshPhysicalMaterial({ color: "#b8691f", roughness: .45, clearcoat: .5, clearcoatRoughness: .4 }),
      crisp = mat("#f0dbb2", .85), dark = chocolate(null);
    const box = new THREE.BoxGeometry(1, 1, 1), bean = new THREE.SphereGeometry(1, 24, 16);
    const pieces = {
      // a pinch of two millets
      millet: Array.from({ length: 16 }, (_, i) => ({ geo: grain, mat: i % 3 ? jowar : ragi, p: [(r() - .5) * .9, (r() - .5) * .6, (r() - .5) * .6], s: [.13, .13, .13] })),
      // a 2x2 square of dark chocolate
      choc: [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => ({ geo: box, mat: dark, p: [a * .26, b * .26, 0], s: [.48, .48, .2] })),
      // two cocoa beans
      cocoa: [{ geo: bean, mat: cocoa, p: [-.22, .05, 0], s: [.42, .24, .22], rz: .5 }, { geo: bean, mat: cocoa, p: [.25, -.1, .1], s: [.4, .23, .21], rz: -.4 }],
      // rough jaggery chunks
      jaggery: [[0, 0, .5], [.38, -.18, .32], [-.34, -.22, .3]].map(([x, y, s]) => ({ geo: box, mat: jaggery, p: [x, y, 0], s: [s, s * .8, s * .9], rz: r() })),
      // airy rice puffs
      crisp: Array.from({ length: 9 }, () => ({ geo: grain, mat: crisp, p: [(r() - .5) * .9, (r() - .5) * .5, (r() - .5) * .5], s: [.15, .15, .15] })),
    };
    return INGREDIENTS.map(ing => ({ key: ing.key, pieces: pieces[ing.key], spin: .3 + r() * .4, phase: r() * 6 }));
  }, []);
}

export default function Ingredients() {
  const { camera, size } = useThree();
  const clusters = useClusters();
  const refs = useRef([]);

  useFrame(state => {
    const k = story.explode, view = viewSize(camera, size), t = state.clock.elapsedTime;
    const slots = size.width <= 760 ? INGREDIENTS_MOBILE : INGREDIENTS;
    const [bx, by] = toWorld(view, story.bite.x, story.bite.y);
    const unit = view.h * (size.width <= 760 ? .085 : .11);
    clusters.forEach((c, i) => {
      const g = refs.current[i]; if (!g) return;
      // each piece leaves a little after the one before, then floats in its slot
      const local = smooth(Math.min(1, Math.max(0, k * 1.4 - i * .08)));
      g.visible = local > .001;
      const [sx, sy] = toWorld(view, slots[i].x, slots[i].y);
      const arc = Math.sin(Math.PI * local);
      const float = Math.sin(t * 1.2 + c.phase) * .04 * local;
      g.position.set(
        bx + (sx - bx) * local,
        by + (sy - by) * local + view.h * .07 * arc + float,
        -.5 * (1 - local)
      );
      g.scale.setScalar(unit * local);
      g.rotation.set(Math.sin(t * .5 + c.phase) * .3, t * c.spin + c.phase, arc * (i % 2 ? .55 : -.55));
    });
  });

  return clusters.map((c, i) => (
    <group key={c.key} ref={el => (refs.current[i] = el)}>
      {c.pieces.map((p, j) => (
        <mesh key={j} geometry={p.geo} material={p.mat} position={p.p} scale={p.s} rotation={[0, 0, p.rz || 0]} />
      ))}
    </group>
  ));
}
