"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/story";
import { createPouch } from "./pouchGeometry";
import { createBite } from "./biteGeometry";
import { chocolate } from "./materials";
import Rain from "./Rain";
import { viewSize } from "./viewport";

// The visible upper layer of the contents sits below the zipper. The front wall
// occludes the clusters until the lips separate and the pouch tips forward.
const contents = [[-.5,1.02,0,.19],[-.19,1.01,-.09,.2],[.17,1.04,-.1,.2],[.5,1.02,-.02,.17],
  [-.33,.98,.14,.19],[.04,.99,.12,.21],[.32,.99,.12,.16]];
const flight = [
  [-.73, .64, .22], [.2, .92, .18], [.84, .51, .145]
];

export default function Pouch({ shopLanding }) {
  const rig = useRef(), body = useRef(), cast = useRef(), filling = useRef();
  const pour = useRef();
  const anchors = useRef([]), studio = useRef(null);
  const pose = useRef({ open: 0, turn: 0, last: "", ready: false });
  const [front, back, normal, frontFinish, backFinish] = useLoader(THREE.TextureLoader, [
    "/pack/panel-front.webp", "/pack/panel-back.webp", "/pack/laminate-normal.png",
    "/pack/film-front.webp", "/pack/film-back.webp"
  ]);
  const pieces = useMemo(() => createPouch(), []);
  const materials = useMemo(() => {
    for (const map of [front, back]) {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 4;
    }
    const print = (map, roughnessMap) => new THREE.MeshPhysicalMaterial({
      map, roughnessMap, roughness: .87, metalness: 0, ior: 1.48,
      normalMap: normal, normalScale: new THREE.Vector2(.68,.68),
      clearcoat: .24, clearcoatRoughness: .37, envMapIntensity: .65
    });
    return { front: print(front,frontFinish), back: print(back,backFinish),
      fold: new THREE.MeshPhysicalMaterial({ color: "#4d2719", roughness: .54, clearcoat: .16, clearcoatRoughness: .43, side: THREE.DoubleSide }),
      rim: new THREE.MeshStandardMaterial({ color: "#e9c896", roughness: .43, side: THREE.DoubleSide }),
      zipper: new THREE.MeshStandardMaterial({ color: "#b49c7f", roughness: .55, side: THREE.DoubleSide }),
      lining: new THREE.MeshStandardMaterial({ color: "#857867", roughness: .43, metalness: .62 }) };
  }, [front, back, normal, frontFinish, backFinish]);
  const nugget = useMemo(() => createBite({ seed: 93, detail: 18, bumps: 70 }).geo, []);
  const coat = useMemo(() => chocolate(null), []);
  useLayoutEffect(() => {
    anchors.current = ["hero","product","shop"].map(id => document.querySelector('[data-pouch-anchor="'+id+'"]'));
    studio.current = document.getElementById("product");
  }, []);
  useEffect(() => () => {
    document.documentElement.removeAttribute("data-pouch-ready");
    pose.current.ready = false;
  }, []);
  useFrame(({ camera, size, clock }, delta) => {
    const g = rig.current, state = pose.current;
    const [cover, turntable] = anchors.current;
    const studioTop = studio.current.getBoundingClientRect().top;
    const motion = !story.reduced;
    // Pinned elements may sit a fractional CSS pixel below zero on phones.
    const bridging = motion && studioTop > 1 && studioTop < size.height-1;
    const carrying = motion && story.insideTravel > 0 && story.insideTravel < 1;
    const blend = bridging ? THREE.MathUtils.smoothstep(1-studioTop/size.height, 0, 1) : 0;
    const liftPose = story.liftedBite;
    liftPose.active = false;

    let anchor, rect;
    if (bridging || carrying) {
      anchor = turntable;
      rect = anchor.getBoundingClientRect();
    } else {
      for (const node of anchors.current) {
        const bounds = node.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < size.height && bounds.height > 0) {
          anchor = node;
          rect = bounds;
          break;
        }
      }
    }
    // During the handoff the landing point is needed even just below the viewport.
    if (!anchor && story.shopTravel > 0 && story.shopTravel < 1) {
      anchor = anchors.current[2];
      rect = anchor.getBoundingClientRect();
    }
    pour.current.visible = anchor?.dataset.pouchAnchor === "shop";
    g.visible = !!anchor;
    if (!anchor) return;
    const section = anchor.dataset.pouchAnchor;
    const hero = section === "hero", shop = section === "shop";
    pour.current.visible = shop;
    const t = clock.elapsedTime, view = viewSize(camera, size);
    let cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    let pixels = Math.min(rect.height/2.76, rect.width/1.92);
    let coverWeight = hero ? 1 : 0;
    const arc = bridging ? Math.sin(Math.PI*blend) : 0;
    if (bridging) {
      // Both endpoints are measured in their resting viewport. The two pages
      // can slide under the mesh without dragging either endpoint off screen.
      const src = cover.getBoundingClientRect();
      const coverTop = cover.parentElement.getBoundingClientRect().top;
      cx = THREE.MathUtils.lerp(src.left + src.width/2, cx, blend) - size.width*.035*arc;
      cy = THREE.MathUtils.lerp(src.top + src.height/2 - coverTop, cy-studioTop, blend) - size.height*.047*arc;
      pixels = THREE.MathUtils.lerp(Math.min(src.height/2.76, src.width/1.92), pixels, blend) * (1+.07*arc);
      coverWeight = 1-blend;
    }
    const lift = motion ? .025*Math.sin(t*1.1)*coverWeight : 0;
    g.position.set((cx/size.width-.5)*view.w, (.5-cy/size.height)*view.h+lift, 0);
    g.scale.setScalar(pixels*view.h/size.height);

    const travel = story.openingTravel;
    const turn = motion ? Math.PI*2 : 0;
    const coverAngle = .18 + travel*(turn+.10+(story.openingView===1 ? Math.PI : 0));
    const studioAngle = turn + THREE.MathUtils.degToRad(story.packAngle + story.dragAngle - 12);
    const angle = shop ? -.14 : THREE.MathUtils.lerp(studioAngle, coverAngle, coverWeight) + arc*.52;
    const open = shop ? 1 : THREE.MathUtils.lerp(story.manualOpen ?? story.packOpen,
      story.openingView === 2 ? travel : 0, coverWeight);
    if (!state.last || !motion || (section!==state.last && (shop || state.last==="shop"))) {
      state.turn = angle;
      state.open = open;
    }
    state.last = section;
    state.open = THREE.MathUtils.damp(state.open, open, 8, delta);
    state.turn = THREE.MathUtils.damp(state.turn, angle, 13, delta);
    const k = state.open;
    const wiggle = motion ? Math.sin(k * Math.PI * 2) * Math.sin(k * Math.PI) : 0;
    body.current.rotation.set(.12 - .04*coverWeight + .52*k, state.turn + (motion ? story.pointer.x*.13*coverWeight : 0),
      (shop ? -.035 : THREE.MathUtils.lerp(.018, -.02-.115*travel, coverWeight)) - .12*arc + wiggle*.085);
    body.current.scale.set(1+.035*wiggle, 1-.04*wiggle, 1);
    for (const mesh of body.current.children) {
      if (mesh.isMesh) mesh.morphTargetInfluences[0] = k;
    }
    filling.current.visible = k > .35;
    filling.current.scale.z = .3 + .7*k;
    const reveal = shop || hero ? 0 : THREE.MathUtils.smoothstep(k, .2, .93);
    // The centre cluster is the full bite model. Keep it above the pouch as
    // the other two drop back in, then use its exact pose for the ingredient shot.
    if (section==="product" && !bridging && motion && story.insideTravel<1) {
      const jump = Math.max(THREE.MathUtils.smoothstep(k,.325,.895),
        story.manualOpen===null ? THREE.MathUtils.smoothstep(story.packProgress,.72,.79) : 0);
      const [x,y,r] = flight[1];
      const unit = g.scale.x;
      liftPose.active = true;
      liftPose.x = g.position.x + x*jump*unit;
      liftPose.y = g.position.y + (1+(y+.21)*jump+.29*Math.sin(jump*Math.PI))*unit;
      if (carrying) liftPose.y += studioTop*view.h/size.height;
      liftPose.z = (.14+.26*jump)*unit;
      liftPose.radius = r*jump*unit;
    }
    cast.current.visible = reveal > .001;
    if (cast.current.visible) cast.current.children.forEach((bite,i) => {
      bite.visible = i!==1 || !liftPose.active;
      const [x,y,s] = flight[i];
      const jump = THREE.MathUtils.smoothstep(k, .25+i*.075, .82+i*.075);
      const hop = Math.sin(jump * Math.PI);
      bite.position.set(x*jump, 1 + (y+.21)*jump + .29*hop + (motion ? .037*Math.sin(t*2+i)*jump : 0), .14+.26*jump);
      bite.scale.setScalar(s*jump);
      bite.rotation.set(i+reveal*2, i*1.9+reveal*3+(motion ? t*.26 : 0), reveal*.6);
    });
    if (!state.ready) {
      document.documentElement.setAttribute("data-pouch-ready", "");
      window.dispatchEvent(new Event("pouch-ready"));
      state.ready = true;
    }
  }, -1);
  return <group ref={rig} visible={false}>
    <group ref={body}>{pieces.map(({ material, geo },i) =>
      <mesh key={i} args={[geo, materials[material]]} />)}
      <group ref={pour} visible={false}>
        <group ref={shopLanding} position={[0, .72, 0]} />
        <Rain />
      </group>
      <group ref={filling}>{contents.map(([x,y,z,s],i) => <mesh key={i} geometry={nugget} material={coat}
        position={[x,y,z]} rotation={[i*.9,i*.62,i]} scale={[s*1.18,s*.87,s]}/>)}</group>
    </group>
    <group ref={cast}>{flight.map((_,i) => <mesh key={i} geometry={nugget} material={coat} />)}</group>
  </group>;
}
