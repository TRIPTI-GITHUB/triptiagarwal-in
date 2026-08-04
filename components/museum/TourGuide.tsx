"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WALK_SPEED } from "@/lib/museum/roomConstants";
import type { TourStop } from "@/lib/museum/layout";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface TourGuideProps {
  stops: TourStop[];
  targetStopIndex: number;
  onSelect: (sheet: ExhibitSheet) => void;
}

const ARRIVE_THRESHOLD = 0.15;
const CLICK_MOVE_THRESHOLD = 6;

/**
 * TourGuide
 * Client Component rendered inside <Canvas> when guided tour mode is
 * active. Every frame, glides the camera toward the current waypoint
 * in `stops`. Once close enough to arrive, if that waypoint isn't yet
 * `targetStopIndex` (the Entrance/sheet the person actually asked to
 * go to), it advances one waypoint further toward the target and
 * keeps gliding - seamlessly passing through any doorway waypoints in
 * between, rather than jumping straight there. Clicking the sheet
 * currently in view still opens it, same raycasting approach as
 * RoomFreeRoam.
 */
export function TourGuide({ stops, targetStopIndex, onSelect }: TourGuideProps) {
  const { camera, gl, scene } = useThree();
  const currentIndexRef = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3());
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    const start = stops[currentIndexRef.current];
    if (start) {
      camera.position.set(...start.position);
      currentLookAt.current.set(...start.lookAt);
      camera.lookAt(currentLookAt.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dom = gl.domElement;

    function handlePointerDown(e: PointerEvent) {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
    }

    function handlePointerUp(e: PointerEvent) {
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > CLICK_MOVE_THRESHOLD) return;

      const rect = dom.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const closest = hits[0];

      if (closest && closest.object.userData && closest.object.userData.isExhibitFrame) {
        onSelect(closest.object.userData.sheet as ExhibitSheet);
      }
    }

    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointerup", handlePointerUp);
    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, gl, scene, onSelect]);

  useFrame((_, delta) => {
    const stop = stops[currentIndexRef.current];
    if (!stop) return;

    const targetPos = new THREE.Vector3(...stop.position);
    const targetLook = new THREE.Vector3(...stop.lookAt);

    const t = 1 - Math.exp(-WALK_SPEED * delta);
    camera.position.lerp(targetPos, t);
    currentLookAt.current.lerp(targetLook, t);
    camera.lookAt(currentLookAt.current);

    const distance = camera.position.distanceTo(targetPos);
    if (distance < ARRIVE_THRESHOLD && currentIndexRef.current !== targetStopIndex) {
      currentIndexRef.current += Math.sign(targetStopIndex - currentIndexRef.current);
    }
  });

  return null;
}