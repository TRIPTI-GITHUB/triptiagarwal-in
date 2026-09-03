import type { DeviceType } from "@/lib/supabase/database.types";

export interface ParsedUserAgent {
  deviceType: DeviceType;
  browser: string;
  os: string;
  isBot: boolean;
}

// Common crawlers - named ones first (an exact reason to trust the
// match), then a narrow generic fallback. Never used to drop a
// request, only to tag is_bot=true so the admin dashboard can exclude
// it from headline visitor counts without ever discarding the row.
const KNOWN_BOTS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
];

function detectIsBot(uaLower: string): boolean {
  if (KNOWN_BOTS.some((bot) => uaLower.includes(bot))) return true;
  return /bot|crawler|spider/.test(uaLower);
}

function detectDeviceType(uaLower: string): DeviceType {
  if (/ipad|tablet|(android(?!.*mobile))/.test(uaLower)) return "tablet";
  if (/mobi|iphone|ipod|android/.test(uaLower)) return "mobile";
  return "desktop";
}

function detectBrowser(uaLower: string): string {
  if (uaLower.includes("edg/") || uaLower.includes("edga/") || uaLower.includes("edgios/")) return "Edge";
  if (uaLower.includes("opr/") || uaLower.includes("opera")) return "Opera";
  if (uaLower.includes("firefox/")) return "Firefox";
  if (uaLower.includes("crios/") || uaLower.includes("chrome/")) return "Chrome";
  if (uaLower.includes("safari/") && !uaLower.includes("chrome")) return "Safari";
  return "Other";
}

function detectOs(uaLower: string): string {
  if (uaLower.includes("windows")) return "Windows";
  if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) return "iOS";
  if (uaLower.includes("mac os")) return "macOS";
  if (uaLower.includes("android")) return "Android";
  if (uaLower.includes("cros")) return "Chrome OS";
  if (uaLower.includes("linux")) return "Linux";
  return "Other";
}

/**
 * Coarse, dependency-free User-Agent parsing - just enough for the
 * dashboard's device/browser/os breakdown, not full fingerprinting.
 */
export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  const uaLower = (userAgent ?? "").toLowerCase();
  return {
    deviceType: detectDeviceType(uaLower),
    browser: detectBrowser(uaLower),
    os: detectOs(uaLower),
    isBot: detectIsBot(uaLower),
  };
}
