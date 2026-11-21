"use client";

import { Component, Suspense, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import Bite from "./Bite";
import Ingredients from "./Ingredients";
import Pouch from "./Pouch";
import OpeningBites from "./OpeningBites";

function Studio() {
  const getState = useThree(state => state.get);
  useLayoutEffect(() => {
    const { gl, scene } = getState();
    const generator = new THREE.PMREMGenerator(gl);
    const studio = new THREE.Scene();
    studio.background = new THREE.Color("#443f3c");
    const rectangle = new THREE.PlaneGeometry(1, 1);
    const panel = (position, width, height, color, intensity) => {
      const material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
      material.color.multiplyScalar(intensity);
      const reflector = new THREE.Mesh(rectangle, material);
      reflector.position.set(...position);
      reflector.scale.set(width, height, 1);
      reflector.lookAt(0, 0, 0);
      studio.add(reflector);
    };
    // Large diffusers for the broad face and a narrow strip to trace the side fold.
    panel([-4, 3, 3], 3.6, 5.2, "#fff4e5", 4.3);
    panel([4, .8, -.7], .85, 5.6, "#edf2ff", 6.5);
    panel([0, 4, -1.8], 3.8, 2, "#fff1de", 3.8);
    panel([2,-1,4], 3, 2.5, "#fff6ee", 1.15);
    const target = generator.fromScene(studio, .035);
    scene.environment = target.texture;
    scene.environmentIntensity = .80;
    for (const reflector of studio.children) reflector.material.dispose();
    rectangle.dispose();
    generator.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [getState]);
  return <>
    <directionalLight position={[-3.7,4.2,4.1]} intensity={2.05} color="#fff4e7"/>
    <directionalLight position={[3,1.4,3]} intensity={.42} color="#eff3ff"/>
    <directionalLight position={[2,3,-3]} intensity={2.75} color="#ffe4c5"/>
    <hemisphereLight args={["#fff6e7","#674c3f",.68]}/>
  </>;
}

class SceneBoundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch() { document.documentElement.removeAttribute("data-pouch-ready"); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Scene() {
  const shopLanding = useRef();
  const phone = matchMedia("(max-width:760px)").matches;
  return <SceneBoundary><Canvas className="scene" aria-hidden="true"
    style={{ position:"fixed", inset:0, width:"100%", height:"100%", zIndex:30, pointerEvents:"none" }}
    dpr={phone ? [1,1.35] : [1,1.65]}
    gl={{ antialias:!phone, alpha:true, powerPreference:"high-performance", localClippingEnabled:true }}
    camera={{ fov:30, position:[0,0,10], near:.1, far:50 }} onCreated={({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.04;
      gl.localClippingEnabled = true;
    }}>
    <Studio/><OpeningBites/><Suspense fallback={null}><Pouch shopLanding={shopLanding}/></Suspense><Bite shopLanding={shopLanding}/><Ingredients/>
  </Canvas></SceneBoundary>;
}
