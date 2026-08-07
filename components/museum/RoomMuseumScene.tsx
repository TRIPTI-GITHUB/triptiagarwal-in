"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { RoomFreeRoam } from "@/components/museum/RoomFreeRoam";
import { RoomMobileRig } from "@/components/museum/RoomMobileRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { RotationArrows } from "@/components/museum/RotationArrows";
import { MinimapTracker, type MinimapPose } from "@/components/museum/MinimapTracker";
import { Minimap } from "@/components/museum/Minimap";
import { TourGuide } from "@/components/museum/TourGuide";
import { TourControls } from "@/components/museum/TourControls";
import { TourArrowNav } from "@/components/museum/TourArrowNav";
import { WelcomeOverlay } from "@/components/museum/WelcomeOverlay";
import { ExhibitDolly } from "@/components/museum/ExhibitDolly";
import { ExhibitModal } from "@/components/museum/ExhibitModal";
import { ProximityTrigger } from "@/components/museum/ProximityTrigger";
import { ApproachCue } from "@/components/museum/ApproachCue";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import {
  ROOM_HEIGHT,
  EYE_HEIGHT,
  PROXIMITY_RADIUS,
  DOLLY_STANDOFF_DEFAULT,
  DOLLY_STANDOFF_MIN,
  DOLLY_STANDOFF_MAX,
  DOLLY_STANDOFF_STEP,
} from "@/lib/museum/roomConstants";
import {
  buildTourPath,
  buildSheetLabels,
  roomCenterZ,
  foyerFrontZ,
  getFramePlacements,
  type MuseumRoom,
} from "@/lib/museum/layout";
import type { ExhibitSheet, Profile } from "@/lib/supabase/database.types";

interface RoomMuseumSceneProps {
  rooms: MuseumRoom[];
  exhibitTitle?: string;
  exhibitTagline?: string;
  profile?: Profile | null;
}

/**
 * RoomMuseumScene
 * Client Component - the room-based museum's entry point. Starts with a
 * full-screen WelcomeOverlay covering the entrance foyer; dismissing it
 * reveals the museum, already loaded behind it. Mode can be set either
 * via the top-right toggle or by clicking the ModeChoicePoster in the
 * foyer (handleModeSelect).
 *
 * The exhibit vitrine viewer (ExhibitDolly + ExhibitModal) takes over the
 * camera whenever a sheet is selected - the active movement controller
 * (RoomFreeRoam / RoomMobileRig / TourGuide) is paused for that entire
 * lifecycle, and only regains control once the viewer has eased the
 * camera back to the visitor's exact standing position on close (see
 * closeViewer / handleDollyArrived) - never a reset to the room entrance.
 */
export function RoomMuseumScene({ rooms, exhibitTitle, exhibitTagline, profile }: RoomMuseumSceneProps) {
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const tapRef = useRef({ x: 0, y: 0, pending: false });
  const turnRef = useRef({ left: false, right: false });
  const poseRef = useRef<MinimapPose>({ x: 0, z: foyerFrontZ(), facingX: 0, facingZ: -1 });
  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [closingViewer, setClosingViewer] = useState(false);
  const [standoff, setStandoff] = useState(DOLLY_STANDOFF_DEFAULT);
  const [nearSheet, setNearSheet] = useState<ExhibitSheet | null>(null);
  const [tourMode, setTourMode] = useState(false);
  const [navIndex, setNavIndex] = useState(-1);
  const [entered, setEntered] = useState(false);
  const numRooms = rooms.length;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const tourPath = useMemo(() => buildTourPath(rooms), [rooms]);
  const sheetLabels = useMemo(() => buildSheetLabels(rooms), [rooms]);
  const placements = useMemo(() => getFramePlacements(rooms), [rooms]);
  const placementById = useMemo(() => new Map(placements.map((p) => [p.sheet.id, p])), [placements]);

  const flatSheets = useMemo(
    () => rooms.flatMap((room) => room.sheets.map((sheet) => ({ sheet, roomTitle: room.title }))),
    [rooms]
  );
  const totalSheets = flatSheets.length;
  const targetStopIndex = tourPath.navigableIndices[navIndex + 1] ?? tourPath.navigableIndices[0];
  const viewerActive = selectedSheet !== null;
  const activePlacement = selectedSheet ? placementById.get(selectedSheet.id) : undefined;
  const activeFlatIndex = selectedSheet ? flatSheets.findIndex((f) => f.sheet.id === selectedSheet.id) : -1;

  function toggleMode() {
    setTourMode((prev) => {
      if (!prev) setNavIndex(-1);
      return !prev;
    });
  }

  function handleModeSelect(mode: "tour" | "free") {
    if (mode === "tour") {
      setTourMode(true);
      setNavIndex(-1);
    } else {
      setTourMode(false);
    }
  }

  function goNext() {
    setNavIndex((i) => Math.min(totalSheets - 1, i + 1));
  }

  function goPrev() {
    setNavIndex((i) => Math.max(-1, i - 1));
  }

  function openSheet(sheet: ExhibitSheet) {
    setSelectedSheet(sheet);
    setChromeVisible(false);
    setClosingViewer(false);
    setStandoff(DOLLY_STANDOFF_DEFAULT);
  }

  function closeViewer() {
    setChromeVisible(false);
    setClosingViewer(true);
  }

  function handleDollyArrived() {
    if (closingViewer) {
      setSelectedSheet(null);
      setClosingViewer(false);
    } else {
      setChromeVisible(true);
    }
  }

  function stepToFlatIndex(index: number) {
    const entry = flatSheets[index];
    if (!entry) return;
    setSelectedSheet(entry.sheet);
    setNavIndex(index);
  }

  function handleViewerNext() {
    stepToFlatIndex(activeFlatIndex + 1);
  }

  function handleViewerPrev() {
    stepToFlatIndex(activeFlatIndex - 1);
  }

  function handleZoomIn() {
    setStandoff((s) => Math.max(DOLLY_STANDOFF_MIN, s - DOLLY_STANDOFF_STEP));
  }

  function handleZoomOut() {
    setStandoff((s) => Math.min(DOLLY_STANDOFF_MAX, s + DOLLY_STANDOFF_STEP));
  }

  function handleProximityChange(sheet: ExhibitSheet, isNear: boolean) {
    setNearSheet((prev) => {
      if (isNear) return sheet;
      if (prev && prev.id === sheet.id) return null;
      return prev;
    });
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, foyerFrontZ() - 1.5], fov: 60 }}>
        <fog attach="fog" args={["#3a4552", 9, 32]} />
        <hemisphereLight args={["#ffffff", "#8892a0", 0.55]} />
        <ambientLight intensity={0.55} color="#ffffff" />
        {rooms.map((_, i) => (
          <pointLight
            key={"room-light-" + i}
            position={[0, ROOM_HEIGHT - 0.4, roomCenterZ(i)]}
            intensity={1.1}
            color="#ffffff"
            distance={15}
            decay={1.5}
          />
        ))}
        <RoomsShell rooms={rooms} exhibitTitle={exhibitTitle} exhibitTagline={exhibitTagline} profile={profile} />
        <MinimapTracker poseRef={poseRef} />

        {placements.map((p) => (
          <ProximityTrigger
            key={p.sheet.id}
            position={[p.x, EYE_HEIGHT, p.z]}
            radius={PROXIMITY_RADIUS}
            onChange={(isNear) => handleProximityChange(p.sheet, isNear)}
          />
        ))}

        {activePlacement && (
          <ExhibitDolly
            targetX={activePlacement.x}
            targetZ={activePlacement.z}
            rotationY={activePlacement.rotationY}
            standoff={standoff}
            returning={closingViewer}
            onArrived={handleDollyArrived}
          />
        )}

        {tourMode ? (
          <TourGuide
            stops={tourPath.stops}
            targetStopIndex={targetStopIndex}
            onSelect={openSheet}
            paused={viewerActive}
          />
        ) : isTouch ? (
          <RoomMobileRig
            moveRef={touchMoveRef}
            lookRef={touchLookRef}
            tapRef={tapRef}
            turnRef={turnRef}
            numRooms={numRooms}
            onSelectSheet={openSheet}
            onSelectMode={handleModeSelect}
            paused={viewerActive}
          />
        ) : (
          <RoomFreeRoam
            numRooms={numRooms}
            onSelectSheet={openSheet}
            onSelectMode={handleModeSelect}
            turnRef={turnRef}
            paused={viewerActive}
          />
        )}
      </Canvas>

      <ApproachCue visible={entered && !viewerActive && !tourMode && nearSheet !== null} />

      {exhibitTitle && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
            {exhibitTitle}
          </p>
        </div>
      )}

      {!tourMode && isTouch && !viewerActive && (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} tapRef={tapRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left to move - drag right or use arrows to look - tap a sheet to view it
            </p>
          </div>
        </>
      )}

      {!tourMode && !isTouch && !viewerActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            W/S walk - A/D strafe - arrow keys, drag, or buttons to look - click a sheet to view it
          </p>
        </div>
      )}

      {!tourMode && !viewerActive && <RotationArrows turnRef={turnRef} />}

      {!viewerActive && <TourControls tourMode={tourMode} onToggleMode={toggleMode} />}

      {tourMode && !viewerActive && (
        <TourArrowNav
          onPrev={goPrev}
          onNext={goNext}
          atStart={navIndex <= -1}
          atEnd={navIndex >= totalSheets - 1}
        />
      )}

      {!viewerActive && <Minimap numRooms={numRooms} poseRef={poseRef} />}

      <WelcomeOverlay
        title={exhibitTitle ?? "The Gallery"}
        visible={!entered}
        onEnter={() => setEntered(true)}
      />

      {selectedSheet && (
        <ExhibitModal
          sheet={selectedSheet}
          label={sheetLabels.get(selectedSheet.id)}
          visible={chromeVisible}
          standoff={standoff}
          onClose={closeViewer}
          onPrev={handleViewerPrev}
          onNext={handleViewerNext}
          atStart={activeFlatIndex <= 0}
          atEnd={activeFlatIndex >= totalSheets - 1}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
    </div>
  );
}
