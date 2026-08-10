"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { RoomFreeRoam } from "@/components/museum/RoomFreeRoam";
import { RoomMobileRig } from "@/components/museum/RoomMobileRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { RotationArrows } from "@/components/museum/RotationArrows";
import { MinimapTracker, type MinimapPose } from "@/components/museum/MinimapTracker";
import { Minimap } from "@/components/museum/Minimap";
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
import { ReturnToLobbyButton } from "@/components/museum/ReturnToLobbyButton";
import { FrontDeskSearch } from "@/components/museum/FrontDeskSearch";
import { OrientationPrompt } from "@/components/museum/OrientationPrompt";
import type { MuseumModeChoice } from "@/components/museum/ModeChoicePoster";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { useReducedMotion } from "@/lib/museum/useReducedMotion";
import { useSyncedLocalStorage } from "@/lib/museum/useSyncedLocalStorage";
import { getRoomLightMood, getThemedRoomLightMood, type RoomTheme } from "@/lib/museum/museumPalette";

const TEXT_SCALE_VALUES: Record<string, string> = { default: "100%", large: "115%", largest: "130%" };
const TEXT_SCALE_STORAGE_KEY = "museum-text-scale";
const CONTRAST_STORAGE_KEY = "museum-high-contrast";

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
  DAK_GREETING_LINES,
  DAK_GREETING_ENTRY_DELAY_MS,
  DAK_GREETING_DURATION_MS,
  DAK_TOUR_DWELL_MS,
  type DakMode,
} from "@/lib/museum/dakConfig";
import {
  buildTourPath,
  buildSheetLabels,
  describePoint,
  findNearestNavIndex,
  lobbySpawnPosition,
  lobbySpawnLookAt,
  roomCenterZ,
  foyerFrontZ,
  getFramePlacements,
  type MuseumRoom,
  type TourScope,
  type TourStop,
} from "@/lib/museum/layout";
import type { ExhibitSheet, Profile } from "@/lib/supabase/database.types";

interface RoomMuseumSceneProps {
  rooms: MuseumRoom[];
  exhibitTitle?: string;
  exhibitTagline?: string;
  profile?: Profile | null;
  // Room Beautification Phase 2 - per-exhibit palette + lighting-mood
  // override (e.g. "India's Freedom Struggle"'s warm-cream re-theme).
  // Undefined for every other exhibit, which keeps the scene's fog/
  // hemisphere/ambient/per-room light values exactly as they were.
  roomTheme?: RoomTheme;
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
 * (RoomFreeRoam / RoomMobileRig) is paused for that entire lifecycle, and
 * only regains control once the viewer has eased the camera back to the
 * visitor's exact standing position on close - never a reset to the room
 * entrance.
 *
 * Guided tour mode (section 5) does NOT hijack the camera - the visitor
 * always drives RoomFreeRoam/RoomMobileRig themselves, in tour mode or
 * not. Dak (DakCompanion, `guiding` mode) walks the tour's stop sequence
 * on his own pace via the same eased-movement technique ExhibitDolly
 * uses, dwelling at each stop (handleDakArrived -> dwell timer) before
 * moving to the next; the Minimap's gold guide marker is the "gentle
 * indicator if they wander" rather than a separate compass overlay.
 */
export function RoomMuseumScene({ rooms, exhibitTitle, exhibitTagline, profile, roomTheme }: RoomMuseumSceneProps) {
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const tapRef = useRef({ x: 0, y: 0, pending: false });
  const turnRef = useRef({ left: false, right: false });
  const poseRef = useRef<MinimapPose>({ x: 0, z: foyerFrontZ(), facingX: 0, facingZ: -1 });
  const dakPoseRef = useRef<DakLivePose | null>(null);

  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [closingViewer, setClosingViewer] = useState(false);
  const [standoff, setStandoff] = useState(DOLLY_STANDOFF_DEFAULT);
  const [nearSheet, setNearSheet] = useState<ExhibitSheet | null>(null);

  const [tourMode, setTourMode] = useState(false);
  const [tourScope, setTourScope] = useState<TourScope>("full");
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
  const numRooms = rooms.length;

  // Keyboard point-of-interest navigation + teleport (section 13,
  // Phase 6a). `focusedPoi` is an index into `pointsOfInterest` (below);
  // `keyboardMoveTarget` is only set while an eased Enter/Space move is
  // in flight; `teleportTarget` triggers an instant, unanimated jump.
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

  // Applied here (not in SettingsDrawer) because RoomMuseumScene stays
  // mounted for the museum page's whole lifetime, while SettingsDrawer
  // unmounts every time the exhibit vitrine viewer opens - an unmount
  // cleanup tied to the drawer would strip these the moment a visitor
  // looked closely at a sheet. Cleanup here only fires when the visitor
  // actually leaves the museum page.
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

  // One-time lobby greeting: fires once per session, shortly after the
  // visitor dismisses WelcomeOverlay. A ProximityTrigger doesn't fit
  // here - the camera spawns inside the lobby, so there's no boundary
  // to cross - `entered` is already the exact "visitor is now in the
  // lobby" signal.
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

  const sheetLabels = useMemo(() => buildSheetLabels(rooms), [rooms]);
  const placements = useMemo(() => getFramePlacements(rooms), [rooms]);
  const placementById = useMemo(() => new Map(placements.map((p) => [p.sheet.id, p])), [placements]);

  const flatSheets = useMemo(
    () => rooms.flatMap((room) => room.sheets.map((sheet) => ({ sheet, roomTitle: room.title }))),
    [rooms]
  );
  const totalSheets = flatSheets.length;

  const tourPath = useMemo(() => buildTourPath(rooms, tourScope), [rooms, tourScope]);
  const maxNavIndex = tourPath.navigableIndices.length - 2;
  const targetStopIndex = tourPath.navigableIndices[navIndex + 1] ?? tourPath.navigableIndices[0];
  const currentStop = tourMode ? tourPath.stops[targetStopIndex] : undefined;

  // tourPath.stops doesn't depend on scope (only navigableIndices does -
  // every sheet always gets a stop) so it's already the exact sequence
  // Phase 6a needs; reusing it here avoids building the stop graph a
  // second time for keyboard nav and teleport.
  const pointsOfInterest = useMemo(() => tourPath.stops.filter((stop) => stop.type !== "entrance"), [tourPath]);
  const focusedPoint = focusedPoi !== null ? pointsOfInterest[focusedPoi] ?? null : null;

  const teleportDestinations = useMemo<TeleportDestination[]>(() => {
    const destinations: TeleportDestination[] = [
      { label: "Lobby", position: lobbySpawnPosition(), lookAt: lobbySpawnLookAt() },
    ];
    tourPath.stops.forEach((stop) => {
      if (stop.type === "entrance") {
        destinations.push({ label: rooms[0]?.title ?? "Room 1", position: stop.position, lookAt: stop.lookAt });
      } else if (stop.type === "doorway" && stop.roomTitle) {
        destinations.push({ label: stop.roomTitle, position: stop.position, lookAt: stop.lookAt });
      }
    });
    return destinations;
  }, [tourPath, rooms]);

  const viewerActive = selectedSheet !== null;
  const activePlacement = selectedSheet ? placementById.get(selectedSheet.id) : undefined;
  const activeFlatIndex = selectedSheet ? flatSheets.findIndex((f) => f.sheet.id === selectedSheet.id) : -1;
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

  // Pause the dwell countdown while the exhibit viewer is open; resume
  // with a fresh full dwell period once it closes, rather than tracking
  // elapsed time through the pause.
  useEffect(() => {
    if (viewerActive) {
      clearDakDwellTimer();
    } else if (tourMode && dakArrivedAtStop && !tourComplete) {
      armDwellTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerActive]);

  function startTour(scope: TourScope, continueFromCurrent: boolean) {
    clearDakDwellTimer();
    setTourScope(scope);
    setDakArrivedAtStop(false);
    setTourComplete(false);
    if (continueFromCurrent) {
      const path = buildTourPath(rooms, scope);
      setNavIndex(findNearestNavIndex(path, poseRef.current.x, poseRef.current.z));
    } else {
      setNavIndex(-1);
    }
    setTourMode(true);
  }

  function exitTour() {
    clearDakDwellTimer();
    setTourMode(false);
  }

  function toggleTourFromControls() {
    if (tourMode) {
      exitTour();
    } else {
      startTour("full", true);
    }
  }

  function handleModeSelect(mode: MuseumModeChoice) {
    if (mode === "free") {
      exitTour();
      return;
    }
    startTour(mode, false);
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

  // Tab/Shift+Tab cycles focus among pointsOfInterest; Enter/Space eases
  // the camera to whichever point currently has focus; Escape releases
  // keyboard focus back to the page. Bound on a dedicated focusable
  // element (not `window`) so it never hijacks Tab from the real
  // interactive controls (TourControls, TeleportMenu, ExhibitModal's
  // buttons) - only active while that element itself has focus.
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

  function handleSearchSelect(stop: TourStop) {
    setFocusedPoi(null);
    setKeyboardMoveTarget(null);
    setTeleportTarget({ position: stop.position, lookAt: stop.lookAt });
  }

  // Home key - "one action away" (Museum Navigation, section 3),
  // global rather than scoped to the dedicated keyboard-nav element so
  // it works regardless of what currently has focus.
  useEffect(() => {
    function handleHomeKey(e: globalThis.KeyboardEvent) {
      if (e.key !== "Home" || viewerActive) return;
      handleReturnToLobby();
    }
    window.addEventListener("keydown", handleHomeKey);
    return () => window.removeEventListener("keydown", handleHomeKey);
  }, [viewerActive]);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <Canvas camera={{ position: lobbySpawnPosition(), fov: isTouch ? 52 : 60 }}>
        <fog
          attach="fog"
          args={
            highContrast
              ? ["#8892a0", 12, 40]
              : roomTheme
              ? [roomTheme.fogColor, roomTheme.fogNear, roomTheme.fogFar]
              : ["#241F1A", 8, 26]
          }
        />
        <hemisphereLight
          args={
            highContrast
              ? ["#ffffff", "#8892a0", 0.75]
              : roomTheme
              ? [roomTheme.hemisphereSky, roomTheme.hemisphereGround, roomTheme.hemisphereIntensity]
              : ["#F2EDE3", "#3A342C", 0.35]
          }
        />
        <ambientLight
          intensity={highContrast ? 0.75 : roomTheme ? roomTheme.ambientIntensity : 0.3}
          color={highContrast ? "#ffffff" : roomTheme ? roomTheme.ambientColor : "#F2EDE3"}
        />
        {rooms.map((_, i) => {
          const mood = highContrast
            ? getRoomLightMood(i, true)
            : roomTheme
            ? getThemedRoomLightMood(roomTheme, i)
            : getRoomLightMood(i, false);
          const lightPosition: [number, number, number] = [0, ROOM_HEIGHT - 0.4, roomCenterZ(i)];
          return (
            <group key={"room-light-" + i}>
              <pointLight
                position={lightPosition}
                intensity={mood.intensity}
                color={mood.color}
                distance={15}
                decay={1.5}
              />
              {/* Fixture geometry is decorative - skipped on mobile
                  ("simplified geometry", section 12); the light itself
                  stays, since the room's mood is core character, not
                  flourish. */}
              {!isTouch && <CeilingFixture position={lightPosition} glowColor={mood.color} highContrast={highContrast} />}
            </group>
          );
        })}
        <RoomsShell
          rooms={rooms}
          exhibitTitle={exhibitTitle}
          exhibitTagline={exhibitTagline}
          profile={profile}
          highContrast={highContrast}
          isTouch={isTouch}
          roomTheme={roomTheme}
        />
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

      {/* Dedicated focus target for keyboard point-of-interest nav
          (section 13) - deliberately not a `window` listener, so Tab
          only cycles exhibit sheets/doorways while THIS element has
          focus, never hijacking Tab from the real interactive controls
          elsewhere in this overlay. pointer-events-none: it exists to
          be tabbed into, not clicked. */}
      <div
        tabIndex={0}
        role="application"
        aria-label="Museum keyboard navigation. Press Tab to cycle between exhibit sheets and doorways, Enter or Space to move there, Escape to release keyboard focus."
        onKeyDown={handleSceneKeyDown}
        className="absolute inset-0 pointer-events-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold focus-visible:-outline-offset-4 z-[6]"
      />

      <div aria-live="polite" className="sr-only">
        {focusedPoint ? "Focused: " + describePoint(focusedPoint, sheetLabels) : ""}
      </div>

      {focusedPoint && !viewerActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-brand-charcoal/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg">
            <p className="text-white text-xs">
              <span className="text-brand-gold">Focused:</span> {describePoint(focusedPoint, sheetLabels)}
            </p>
          </div>
        </div>
      )}

      <ApproachCue visible={entered && !viewerActive && !tourMode && nearSheet !== null} />

      {entered && !viewerActive && <OrientationPrompt isTouch={isTouch} />}

      {!viewerActive && !tourMode && (
        <>
          <DakDialogueBubble
            visible={dakMode === "greeting" && !dakDismissed}
            line={dakLine}
            onDismiss={dismissDakGreeting}
          />
        </>
      )}
      {!viewerActive && <DakToggle dismissed={dakDismissed} onToggle={toggleDak} />}

      {exhibitTitle && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
            {exhibitTitle}
          </p>
        </div>
      )}

      {isTouch && !viewerActive && (
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

      {!isTouch && !viewerActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            W/S walk - A/D strafe - arrow keys, drag, or buttons to look - click a sheet to view it - Tab to browse by keyboard - Home to return to lobby
          </p>
        </div>
      )}

      {!viewerActive && <RotationArrows turnRef={turnRef} />}

      {!viewerActive && (
        <div className="absolute top-4 right-4 left-4 sm:left-auto z-10 flex flex-wrap items-center justify-end gap-2">
          <ReturnToLobbyButton onReturn={handleReturnToLobby} />
          <FrontDeskSearch
            points={pointsOfInterest}
            sheetLabels={sheetLabels}
            onSelect={handleSearchSelect}
            isTouch={isTouch}
          />
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
          onExitTour={exitTour}
        />
      )}

      {!viewerActive && (
        <Minimap numRooms={numRooms} poseRef={poseRef} guidePoseRef={tourMode ? dakPoseRef : undefined} />
      )}

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
