"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface FrameInteractionProps {
  onHoverChange: (sheet: ExhibitSheet | null) => void;
  onSelect: (sheet: ExhibitSheet) => void;
}

const MAX_INTERACT_DISTANCE = 4;

/**
 * FrameInteraction
 * Client Component rendered inside <Canvas>. Every frame, casts an
 * invisible ray straight out from the center of the screen (the
 * crosshair position) and checks the closest thing it hits. If that's
 * a frame's artwork mesh (tagged with userData.isExhibitFrame) within
 * MAX_INTERACT_DISTANCE, that sheet is considered "hovered." Clicking
 * the canvas while hovering a sheet selects it and releases pointer
 * lock, so the modal that opens next has a normal usable cursor.
 */
export function FrameInteraction({ onHoverChange, onSelect }: FrameInteractionProps) {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerNDC = useRef(new THREE.Vector2(0, 0));
  const hoveredRef = useRef<ExhibitSheet | null>(null);

  useFrame(() => {
    raycaster.current.setFromCamera(centerNDC.current, camera);
    const hits = raycaster.current.intersectObjects(scene.children, true);
    const closest = hits[0];

    let found: ExhibitSheet | null = null;
    if (
      closest &&
      closest.object.userData &&
      closest.object.userData.isExhibitFrame &&
      closest.distance < MAX_INTERACT_DISTANCE
    ) {
      found = closest.object.userData.sheet as ExhibitSheet;
    }

    const prevId = hoveredRef.current ? hoveredRef.current.id : null;
    const foundId = found ? found.id : null;

    if (prevId !== foundId) {
      hoveredRef.current = found;
      onHoverChange(found);
    }
  });

  useEffect(() => {
    function handleClick() {
      const isLocked = document.pointerLockElement === gl.domElement;
      if (!isLocked) return;
      if (hoveredRef.current) {
        onSelect(hoveredRef.current);
        document.exitPointerLock();
      }
    }

    const domElement = gl.domElement;
    domElement.addEventListener("click", handleClick);
    return () => {
      domElement.removeEventListener("click", handleClick);
    };
  }, [gl, onSelect]);

  return null;
}
