import * as THREE from "three";

// Shared materials. Chocolate: dark, glossy coat with a clear-coat sheen. Puff: matte toasted grain.
export const chocolate = (clip) => new THREE.MeshPhysicalMaterial({
  color: "#48210e", roughness: 0.43, metalness: 0, clearcoat: 0.38, clearcoatRoughness: 0.34, envMapIntensity: .72,
  sheen: 0.12, sheenColor: new THREE.Color("#a0603a"), sheenRoughness: 0.6,
  side: THREE.DoubleSide, clippingPlanes: clip ? [clip] : null,
});

export const puff = (clip) => new THREE.MeshStandardMaterial({
  color: "#a66535", roughness: 0.52, metalness: 0, clippingPlanes: clip ? [clip] : null,
});

// the crunchy inside you see when the bite breaks: toasted millet packed tight
export const core = (clip) => new THREE.MeshStandardMaterial({
  color: "#b9824d", roughness: 0.92, side: THREE.DoubleSide, clippingPlanes: clip ? [clip] : null,
});
