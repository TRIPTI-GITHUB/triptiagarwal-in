"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { LobbyHubShell } from "@/components/museum-v2/LobbyHubShell";
import { WingHallShell } from "@/components/museum-v2/WingHallShell";
import { RoomFreeRoamV2 } from "@/components/museum-v2/RoomFreeRoamV2";
import { RoomMobileRigV2 } from "@/components/museum-v2/RoomMobileRigV2";
import { MinimapV2 } from "@/components/museum-v2/MinimapV2";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { RotationArrows } from "@/components/museum/RotationArrows";
import { MinimapTracker, type MinimapPose } from "@/components/museum/MinimapTracker";
import { TourControls } from "@/components/museum/TourControls";
import { TourArrowNav } from "@/components/museum/TourArrowNav";
import { TourStopCaption } from "@/components/museum/TourStopCaption";
import { WelcomeOverlay } from "@/components/museum/WelcomeOverlay";
import { ExhibitDolly } from "@/components/museum/ExhibitDolly";
import { ExhibitModal } from "@/components/museum/ExhibitModal";
import { ProximityTrigger } from "@/components/museum/ProximityTrigger";
import { ApproachCue } from "@/components/museum/ApproachCue";
import { DakCompanion, type DakLivePose } from "@/components/museum/DakCompanion";
import { DakDialogueBubble } from "@/components/museum/DakDialogueBubble";
import { DakToggle } from "@/components/museum/DakToggle";
import { KeyboardPointNav } from "@/components/museum/KeyboardPointNav";
import { FocusIndicator } from "@/components/museum/FocusIndicator";
import { TeleportExecutor, type TeleportTarget } from "@/components/museum/TeleportExecutor";
import { TeleportMenu, type TeleportDestination } from "@/components/museum/TeleportMenu";
import { SettingsDrawer } from "@/components/museum/SettingsDrawer";
import { CeilingFixture } from "@/components/museum/CeilingFixture";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { useReducedMotion } from "@/lib/museum/useReducedMotion";
import { useSyncedLocalStorage } from "@/lib/museum/useSyncedLocalStorage";
import {
  getRoomLightMood,
  DEFAULT_ROOM_ACCENT,
  HEMISPHERE_SKY,
  HEMISPHERE_INTENSITY,
  AMBIENT_COLOR,
  AMBIENT_INTENSITY,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
} from "@/lib/museum/museumPalette";
import { ROOM_HEIGHT } from "@/lib/museum/roomConstants";
import {
  DAK_GREETING_LINES,
  DAK_GREETING_ENTRY_DELAY_MS,
  DAK_GREETING_DURATION_MS,
  DAK_TOUR_DWELL_MS,
  type DakMode,
} from "@/lib/museum/dakConfig";
import {
  lobbySpawnPosition,
  lobbySpawnLookAt,
  entryArchPosition,
  exitArchPosition,
  buildWingTourPath,
  buildWingPointsOfInterest,
  buildWingSheetLabels,
  findNearestWingNavIndex,
  describeWingPoint,
  type MuseumV2Wing,
} from "@/lib/museum-v2/layout";
import type { ExhibitSheet, LobbyPhoto } from "@/lib/supabase/database.types";
import type { TourScope } from "@/lib/museum/layout";

const TEXT_SCALE_VALUES: Record<string, string> = { default: "100%", large: "115%", largest: "130%" };
const TEXT_SCALE_STORAGE_KEY = "museum-v2-text-scale";
const CONTRAST_STORAGE_KEY = "museum-v2-high-contrast";
const DOLLY_STANDOFF_DEFAULT = 2.6;
const DOLLY_STANDOFF_MIN = 1.4;
const DOLLY_STANDOFF_MAX = 3.6;
const DOLLY_STANDOFF_STEP = 0.5;

function decodeTextScale(raw: string | null): string {
  return raw ?? "default";
}
function encodeTextScale(value: string): string {
  return value;
}
function decodeContrast(raw: string | null): boolean {
  return raw === "true";
}
function encodeContrast(value: boolean): string {
  return String(value);
}

interface MuseumV2SceneProps {
  wings: MuseumV2Wing[];
  lobbyPhotos: LobbyPhoto[] | null;
}

/**
 * MuseumV2Scene
 * museum-v2's entry point - a new top-level orchestrator (not an edit
 * to RoomMuseumScene), since too much of that component is wired to
 * the linear tour-path/room-grouping/frame-placement system to safely
 * reuse. Reuses every generic display/interaction component as-is
 * (ExhibitModal, ExhibitDolly, TeleportMenu, SettingsDrawer, Dak, the
 * tour caption/controls, the touch input widgets, KeyboardPointNav) -
 * only the spatial shell (LobbyHubShell/WingHallShell) and movement
 * rigs (RoomFreeRoamV2/RoomMobileRigV2) are new.
 */
export function MuseumV2Scene({ wings, lobbyPhotos }: MuseumV2SceneProps) {
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const tapRef = useRef({ x: 0, y: 0, pending: false });
  const turnRef = useRef({ left: false, right: false });
  const poseRef = useRef<MinimapPose>({ x: 0, z: lobbySpawnPosition()[2], facingX: 0, facingZ: -1 });
  const dakPoseRef = useRef<DakLivePose | null>(null);

  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [closingViewer, setClosingViewer] = useState(false);
  const [standoff, setStandoff] = useState(DOLLY_STANDOFF_DEFAULT);
  const [nearSheet, setNearSheet] = useState<ExhibitSheet | null>(null);

  const [tourMode, setTourMode] = useState(false);
  const [tourScope] = useState<TourScope>("full");
  const [navIndex, setNavIndex] = useState(-1);
  const [dakArrivedAtStop, setDakArrivedAtStop] = useState(false);
  const [tourComplete, setTourComplete] = useState(false);
  const dakDwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [entered, setEntered] = useState(false);
  const [dakMode, setDakMode] = useState<DakMode>("idle");
  const [dakDismissed, setDakDismissed] = useState(false);
  const [dakLine, setDakLine] = useState<string>(DAK_GREETING_LINES[0]);
  const hasGreetedRef = useRef(false);
  const dakDismissedRef = useRef(dakDismissed);
  const dakGreetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dakRevertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numWings = wings.length;

  const [focusedPoi, setFocusedPoi] = useState<number | null>(null);
  const [keyboardMoveTarget, setKeyboardMoveTarget] = useState<{
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<TeleportTarget | null>(null);

  const { reducedMotion, systemPreference: systemReducedMotion, override: reducedMotionOverride, setOverride: setReducedMotionOverride } =
    useReducedMotion();
  const [textScale, setTextScale] = useSyncedLocalStorage(TEXT_SCALE_STORAGE_KEY, decodeTextScale, encodeTextScale);
  const [highContrast, setHighContrast] = useSyncedLocalStorage(CONTRAST_STORAGE_KEY, decodeContrast, encodeContrast);

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SCALE_VALUES[textScale] ?? TEXT_SCALE_VALUES.default;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [textScale]);

  useEffect(() => {
    document.documentElement.classList.toggle("museum-high-contrast", highContrast);
    return () => {
      document.documentElement.classList.remove("museum-high-contrast");
    };
  }, [highContrast]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    dakDismissedRef.current = dakDismissed;
  }, [dakDismissed]);

  useEffect(() => {
    if (!entered || hasGreetedRef.current) return;
    dakGreetTimerRef.current = setTimeout(() => {
      if (dakDismissedRef.current) return;
      hasGreetedRef.current = true;
      setDakLine(DAK_GREETING_LINES[Math.floor(Math.random() * DAK_GREETING_LINES.length)]);
      setDakMode("greeting");
      dakRevertTimerRef.current = setTimeout(() => setDakMode("idle"), DAK_GREETING_DURATION_MS);
    }, DAK_GREETING_ENTRY_DELAY_MS);
    return () => {
      if (dakGreetTimerRef.current) clearTimeout(dakGreetTimerRef.current);
      if (dakRevertTimerRef.current) clearTimeout(dakRevertTimerRef.current);
    };
  }, [entered]);

  const sheetLabels = useMemo(() => buildWingSheetLabels(wings), [wings]);

  const flatSheets = useMemo(() => wings.flatMap((w) => w.sheets.map((sheet) => ({ sheet, wingTitle: w.title }))), [wings]);
  const totalSheets = flatSheets.length;

  const tourPath = useMemo(() => buildWingTourPath(wings, tourScope), [wings, tourScope]);
  const maxNavIndex = tourPath.navigableIndices.length - 2;
  const targetStopIndex = tourPath.navigableIndices[navIndex + 1] ?? tourPath.navigableIndices[0];
  const currentStop = tourMode ? tourPath.stops[targetStopIndex] : undefined;

  const pointsOfInterest = useMemo(() => buildWingPointsOfInterest(wings), [wings]);
  const focusedPoint = focusedPoi !== null ? pointsOfInterest[focusedPoi] ?? null : null;

  const teleportDestinations = useMemo<TeleportDestination[]>(() => {
    const destinations: TeleportDestination[] = [
      { label: "Lobby", position: lobbySpawnPosition(), lookAt: lobbySpawnLookAt() },
    ];
    wings.forEach((wing) => {
      const entry = entryArchPosition(wing.index);
      destinations.push({
        label: wing.title + " (Entry)",
        position: [entry[0], 1.6, entry[2] - 1.5],
        lookAt: [entry[0], 1.6, entry[2] - 6],
      });
      const exit = exitArchPosition(wing.index);
      destinations.push({
        label: wing.title + " (Exit)",
        position: [exit[0], 1.6, exit[2] + 1.5],
        // Look back toward the lobby's own covered floor (not straight
        // south at a fixed x, which walks off the connector's narrow
        // footprint into unrendered space beyond it).
        lookAt: [0, 1.6, 0],
      });
    });
    return destinations;
  }, [wings]);

  const viewerActive = selectedSheet !== null;
  const activeFlatIndex = selectedSheet ? flatSheets.findIndex((f) => f.sheet.id === selectedSheet.id) : -1;
  const activeStop = selectedSheet
    ? pointsOfInterest.find((p) => p.type === "sheet" && p.sheet?.id === selectedSheet.id)
    : undefined;
  const effectiveDakMode: DakMode = dakDismissed ? "dismissed" : tourMode ? "guiding" : dakMode;

  function clearDakDwellTimer() {
    if (dakDwellTimerRef.current) {
      clearTimeout(dakDwellTimerRef.current);
      dakDwellTimerRef.current = null;
    }
  }

  function armDwellTimer() {
    clearDakDwellTimer();
    dakDwellTimerRef.current = setTimeout(() => {
      setNavIndex((i) => {
        if (i >= maxNavIndex) {
          setTourComplete(true);
          return i;
        }
        setDakArrivedAtStop(false);
        return i + 1;
      });
    }, DAK_TOUR_DWELL_MS);
  }

  function handleDakArrived() {
    setDakArrivedAtStop(true);
    if (!tourMode || viewerActive) return;
    armDwellTimer();
  }

  useEffect(() => {
    if (viewerActive) {
      clearDakDwellTimer();
    } else if (tourMode && dakArrivedAtStop && !tourComplete) {
      armDwellTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerActive]);

  function toggleTourFromControls() {
    if (tourMode) {
      clearDakDwellTimer();
      setTourMode(false);
    } else {
      clearDakDwellTimer();
      setDakArrivedAtStop(false);
      setTourComplete(false);
      setNavIndex(findNearestWingNavIndex(tourPath, poseRef.current.x, poseRef.current.z));
      setTourMode(true);
    }
  }

  function goNext() {
    clearDakDwellTimer();
    setDakArrivedAtStop(false);
    setTourComplete(false);
    setNavIndex((i) => Math.min(maxNavIndex, i + 1));
  }
  function goPrev() {
    clearDakDwellTimer();
    setDakArrivedAtStop(false);
    setTourComplete(false);
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
  function dismissDakGreeting() {
    if (dakRevertTimerRef.current) clearTimeout(dakRevertTimerRef.current);
    setDakMode("idle");
  }
  function toggleDak() {
    setDakDismissed((d) => !d);
  }

  function handleSceneKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (viewerActive || pointsOfInterest.length === 0) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const count = pointsOfInterest.length;
      setFocusedPoi((prev) => {
        if (prev === null) return e.shiftKey ? count - 1 : 0;
        return (prev + (e.shiftKey ? -1 : 1) + count) % count;
      });
    } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      if (focusedPoi === null) return;
      e.preventDefault();
      const point = pointsOfInterest[focusedPoi];
      if (point) setKeyboardMoveTarget({ position: point.position, lookAt: point.lookAt });
    } else if (e.key === "Escape") {
      setFocusedPoi(null);
      setKeyboardMoveTarget(null);
      e.currentTarget.blur();
    }
  }

  function handleKeyboardMoveArrived() {
    setKeyboardMoveTarget(null);
  }

  // Click/tap-to-move: the raycast trigger (RoomFreeRoamV2/
  // RoomMobileRigV2) reports a floor hit point; this feeds it into the
  // SAME KeyboardPointNav instance that keyboard Tab+Enter already
  // drives, rather than a second movement system.
  function handleFloorClick(point: THREE.Vector3) {
    if (viewerActive) return;
    setFocusedPoi(null);
    const lookAt: [number, number, number] = [
      point.x + (point.x - poseRef.current.x) * 0.4,
      1.6,
      point.z + (point.z - poseRef.current.z) * 0.4,
    ];
    setKeyboardMoveTarget({ position: [point.x, 1.6, point.z], lookAt });
  }

  function handleTeleportSelect(destination: TeleportDestination) {
    setFocusedPoi(null);
    setKeyboardMoveTarget(null);
    setTeleportTarget({ position: destination.position, lookAt: destination.lookAt });
  }
  function handleTeleportDone() {
    setTeleportTarget(null);
  }
  function handleReturnToLobby() {
    setFocusedPoi(null);
    setKeyboardMoveTarget(null);
    setTeleportTarget({ position: lobbySpawnPosition(), lookAt: lobbySpawnLookAt() });
  }

  useEffect(() => {
    function handleHomeKey(e: globalThis.KeyboardEvent) {
      if (e.key !== "Home" || viewerActive) return;
      handleReturnToLobby();
    }
    window.addEventListener("keydown", handleHomeKey);
    return () => window.removeEventListener("keydown", handleHomeKey);
  }, [viewerActive]);

  const lightMood = getRoomLightMood(0, highContrast, DEFAULT_ROOM_ACCENT);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <Canvas camera={{ position: lobbySpawnPosition(), fov: isTouch ? 52 : 60 }}>
        <fog attach="fog" args={highContrast ? ["#8892a0", 12, 40] : [FOG_COLOR, FOG_NEAR, FOG_FAR]} />
        <hemisphereLight
          args={highContrast ? ["#ffffff", "#8892a0", 0.75] : [HEMISPHERE_SKY, DEFAULT_ROOM_ACCENT.hemisphereGround, HEMISPHERE_INTENSITY]}
        />
        <ambientLight intensity={highContrast ? 0.75 : AMBIENT_INTENSITY} color={highContrast ? "#ffffff" : AMBIENT_COLOR} />

        <pointLight position={[0, ROOM_HEIGHT - 0.4, 0]} intensity={lightMood.intensity} color={lightMood.color} distance={16} decay={1.5} />
        {!isTouch && <CeilingFixture position={[0, ROOM_HEIGHT - 0.4, 0]} glowColor={lightMood.color} highContrast={highContrast} />}

        <LobbyHubShell wings={wings} lobbyPhotos={lobbyPhotos} highContrast={highContrast} />

        {wings.map((wing) => {
          const legMidpoints: [number, number, number][] = [
            [wing.index * -10, ROOM_HEIGHT - 0.4, -22 - wing.index * 10],
            [12 + wing.index * -10, ROOM_HEIGHT - 0.4, -34 - wing.index * 10],
            [24 + wing.index * -10, ROOM_HEIGHT - 0.4, -22 - wing.index * 10],
          ];
          return (
            <group key={"wing-" + wing.index}>
              <WingHallShell wing={wing} highContrast={highContrast} isTouch={isTouch} />
              {legMidpoints.map((pos, i) => (
                <group key={"wing-light-" + i}>
                  <pointLight position={pos} intensity={lightMood.intensity} color={lightMood.color} distance={16} decay={1.5} />
                  {!isTouch && <CeilingFixture position={pos} glowColor={lightMood.color} highContrast={highContrast} />}
                </group>
              ))}
            </group>
          );
        })}

        <MinimapTracker poseRef={poseRef} />
        <DakCompanion
          mode={effectiveDakMode}
          position={tourMode && currentStop ? currentStop.position : undefined}
          lookAt={tourMode && currentStop ? currentStop.lookAt : undefined}
          paused={viewerActive}
          reducedMotion={reducedMotion}
          idleAnimationDisabled={isTouch}
          livePoseRef={dakPoseRef}
          onArrived={handleDakArrived}
        />

        {pointsOfInterest
          .filter((p) => p.type === "sheet" && p.sheet)
          .map((p) => (
            <ProximityTrigger
              key={p.sheet!.id}
              position={[p.position[0], 1.6, p.position[2]]}
              radius={4.5}
              onChange={(isNear) => handleProximityChange(p.sheet!, isNear)}
            />
          ))}

        {selectedSheet && activeStop && (
          <ExhibitDolly
            targetX={activeStop.lookAt[0]}
            targetZ={activeStop.lookAt[2]}
            rotationY={activeStop.rotationY ?? 0}
            standoff={standoff}
            returning={closingViewer}
            reducedMotion={reducedMotion}
            onArrived={handleDollyArrived}
          />
        )}

        {focusedPoint && <FocusIndicator point={focusedPoint} reducedMotion={reducedMotion || isTouch} />}
        {keyboardMoveTarget && (
          <KeyboardPointNav
            targetPosition={keyboardMoveTarget.position}
            targetLookAt={keyboardMoveTarget.lookAt}
            paused={viewerActive}
            reducedMotion={reducedMotion}
            onArrived={handleKeyboardMoveArrived}
          />
        )}
        <TeleportExecutor target={teleportTarget} onDone={handleTeleportDone} />

        {isTouch ? (
          <RoomMobileRigV2
            moveRef={touchMoveRef}
            lookRef={touchLookRef}
            tapRef={tapRef}
            turnRef={turnRef}
            numWings={numWings}
            onSelectSheet={openSheet}
            onFloorTap={handleFloorClick}
            paused={viewerActive}
          />
        ) : (
          <RoomFreeRoamV2
            numWings={numWings}
            onSelectSheet={openSheet}
            onFloorClick={handleFloorClick}
            turnRef={turnRef}
            paused={viewerActive}
          />
        )}
      </Canvas>

      <div
        tabIndex={0}
        role="application"
        aria-label="Museum keyboard navigation. Press Tab to cycle between exhibit sheets and entry arches, Enter or Space to move there, Escape to release keyboard focus."
        onKeyDown={handleSceneKeyDown}
        className="absolute inset-0 pointer-events-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold focus-visible:-outline-offset-4 z-[6]"
      />

      <div aria-live="polite" className="sr-only">
        {focusedPoint ? "Focused: " + describeWingPoint(focusedPoint, sheetLabels) : ""}
      </div>

      {focusedPoint && !viewerActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-brand-charcoal/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg">
            <p className="text-white text-xs">
              <span className="text-brand-gold">Focused:</span> {describeWingPoint(focusedPoint, sheetLabels)}
            </p>
          </div>
        </div>
      )}

      <ApproachCue visible={entered && !viewerActive && !tourMode && nearSheet !== null} />

      {!viewerActive && !tourMode && (
        <DakDialogueBubble visible={dakMode === "greeting" && !dakDismissed} line={dakLine} onDismiss={dismissDakGreeting} />
      )}
      {!viewerActive && <DakToggle dismissed={dakDismissed} onToggle={toggleDak} />}

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">museum-v2 (preview)</p>
      </div>

      {isTouch && !viewerActive && (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} tapRef={tapRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left to move - drag right or use arrows to look - tap the floor to walk there, tap a sheet to view it
            </p>
          </div>
        </>
      )}

      {!isTouch && !viewerActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            W/S walk - A/D strafe - arrow keys or drag to look - click the floor to walk there, click a sheet to view it - Tab to browse by
            keyboard - Home to return to lobby
          </p>
        </div>
      )}

      {!viewerActive && <RotationArrows turnRef={turnRef} />}

      {!viewerActive && (
        <div className="absolute top-4 right-4 left-4 sm:left-auto z-10 flex flex-wrap items-center justify-end gap-2">
          <TeleportMenu destinations={teleportDestinations} onSelect={handleTeleportSelect} />
          <TourControls tourMode={tourMode} onToggleMode={toggleTourFromControls} />
          <SettingsDrawer
            reducedMotionOverride={reducedMotionOverride}
            systemReducedMotion={systemReducedMotion}
            onSetReducedMotionOverride={setReducedMotionOverride}
            textScale={textScale}
            onSetTextScale={setTextScale}
            highContrast={highContrast}
            onSetHighContrast={setHighContrast}
          />
        </div>
      )}

      {tourMode && !viewerActive && (
        <TourArrowNav onPrev={goPrev} onNext={goNext} atStart={navIndex <= -1} atEnd={navIndex >= maxNavIndex} />
      )}

      {tourMode && !viewerActive && (
        <TourStopCaption
          visible={dakArrivedAtStop || tourComplete}
          sheet={currentStop?.sheet ?? null}
          label={currentStop?.sheet ? sheetLabels.get(currentStop.sheet.id) : undefined}
          finished={tourComplete}
          onViewCloser={() => {
            if (currentStop?.sheet) openSheet(currentStop.sheet);
          }}
          onExitTour={() => setTourMode(false)}
        />
      )}

      {!viewerActive && <MinimapV2 numWings={numWings} poseRef={poseRef} guidePoseRef={tourMode ? dakPoseRef : undefined} />}

      <WelcomeOverlay title="museum-v2 Preview" visible={!entered} onEnter={() => setEntered(true)} />

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
