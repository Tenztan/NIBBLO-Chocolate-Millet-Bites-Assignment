"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/story";
import { createBite, seeded } from "./biteGeometry";
import { chocolate } from "./materials";

const COUNT = 8;
const RIM_Y = 1.26;

// Positions are in the open pouch's local coordinates. At the zipper each
// bite fits between the lips. By the end it is hidden below the contents.
export default function Rain() {
  const mesh = useRef();
  const geo = useMemo(() => createBite({ seed: 19, detail: 14, bumps: 40 }).geo, []);
  const mat = useMemo(() => chocolate(null), []);
  const pose = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: COUNT }, (_, i) => ({
      startX: (r() - .5) * 1.8, landingX: (r() - .5) * .86,
      depth: (r() - .5) * .14, phase: (i + r() * .35) / COUNT,
      spin: 1.8 + r() * 2, radius: .09 + r() * .035, height: .72 + r() * .26
    }));
  }, []);

  useFrame(({ clock }) => {
    const rain = mesh.current;
    rain.visible = story.rain > .001 && !story.reduced;
    if (!rain.visible || !rain.parent.visible) return;
    const time = clock.elapsedTime;
    drops.forEach((drop, i) => {
      const f = (time * .53 + drop.phase) % 1;
      const y = THREE.MathUtils.lerp(RIM_Y + drop.height, .67, f * f);
      const approach = THREE.MathUtils.smoothstep(f, 0, .70);
      pose.position.set(
        THREE.MathUtils.lerp(drop.startX, drop.landingX, approach),
        y,
        drop.depth - Math.max(0, y - RIM_Y) * .52
      );
      pose.scale.setScalar(drop.radius * story.rain * THREE.MathUtils.smoothstep(f, 0, .12));
      pose.rotation.set(time * drop.spin, i + f * 3, f * drop.spin);
      pose.updateMatrix();
      rain.setMatrixAt(i, pose.matrix);
    });
    rain.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh name="Shop falling bites" ref={mesh} args={[geo, mat, COUNT]} frustumCulled={false} />;
}
