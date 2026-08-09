/**
 * noRaycast
 * Tells Three.js to skip an object entirely during ray intersection
 * tests - used on purely decorative meshes (poster labels, brass
 * plaques, vitrine glass) layered in front of a clickable surface, so
 * a click always reaches the tagged mesh underneath rather than being
 * silently absorbed by the decoration.
 */
export function noRaycast() {
  return null;
}
