"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/story";
import { createBite, seeded } from "./biteGeometry";
import { chocolate } from "./materials";
import { viewSize } from "./viewport";

const random = seeded(128);
const clusters = Array.from({length:20}, (_,i) => ({
  x:i%5 === 0 ? .15+random()*.18 : .39+random()*.6,
  y:random(), speed:.026+random()*.031, phase:random()*Math.PI*2,
  radius:.009+random()**2*.021, depth:-.6+random()*.85
}));

export default function OpeningBites() {
  const mesh = useRef(), section = useRef(), clock = useRef(0);
  useLayoutEffect(() => {section.current=document.getElementById("story");},[]);
  const geometry = useMemo(()=>createBite({seed:24,detail:12,bumps:52}).geo,[]);
  const material = useMemo(()=>chocolate(null),[]);
  const dummy = useMemo(()=>new THREE.Object3D(),[]);
  useFrame(({camera,size},dt)=>{
    const rect=section.current?.getBoundingClientRect();
    const field=mesh.current;
    field.visible=!!rect && rect.top<size.height && rect.bottom>0;
    if(!field.visible) return;
    const view=viewSize(camera,size);
    if(!story.reduced) clock.current+=Math.min(dt,.08);
    const t=clock.current;
    const count=size.width<760 ? 10 : clusters.length;
    field.count=count;
    for(let i=0;i<count;i++){
      const c=clusters[i], y=((c.y+t*c.speed)%1.24)-.12;
      const x=c.x+.032*Math.sin(t*.55+c.phase);
      const radius=c.radius*view.h;
      const localY=rect.top + y*rect.height;
      // Scale each end of a particle's path to avoid a pop where the panel wipes in.
      const fade=THREE.MathUtils.smoothstep(y,0,.08)*(1-THREE.MathUtils.smoothstep(y,.95,1));
      const perspective=(camera.position.z-c.depth)/camera.position.z;
      dummy.position.set((x-.5)*view.w*perspective,(.5-localY/size.height)*view.h*perspective,c.depth);
      dummy.rotation.set(c.phase+t*.63,t*.41+i,c.phase+t*.19);
      dummy.scale.set(radius*fade,radius*.84*fade,radius*.79*fade);
      dummy.updateMatrix();
      field.setMatrixAt(i,dummy.matrix);
    }
    field.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh ref={mesh} args={[geometry,material,clusters.length]} frustumCulled={false}/>;
}
