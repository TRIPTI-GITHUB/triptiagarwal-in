/**
 * dampedEaseFactor
 * Framerate-independent interpolation factor for a per-frame lerp
 * toward a moving target: `position.lerp(target, dampedEaseFactor(speed, delta))`
 * eases smoothly (fast when far, slowing as it arrives) regardless of
 * frame rate, unlike a fixed lerp factor. Shared by TourGuide,
 * ExhibitDolly, and DakCompanion so every eased camera/character motion
 * in the museum uses the same curve.
 */
export function dampedEaseFactor(speed: number, delta: number): number {
  return 1 - Math.exp(-speed * delta);
}
