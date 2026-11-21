// Turn the page's viewport fractions into world units at the z = 0 plane for the scene's camera,
// so GSAP can say "put the bite at 70% across, 40% down, 30% of the screen tall".
export function viewSize(camera, size) {
  const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
  return { w: h * (size.width / size.height), h };
}
export const toWorld = (view, x, y) => [(x - 0.5) * view.w, (0.5 - y) * view.h];
