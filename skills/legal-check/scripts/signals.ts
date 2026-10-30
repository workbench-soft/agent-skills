// What the repo collects and asks for, and the legal pages it holds, read from the tracked files.
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

// Each SDK sends data off the device, so the privacy policy and the store forms name it.
const SDKS: [string, RegExp][] = [
  ["Ads (AdMob, AdSense)", /google-mobile-ads|play-services-ads|adsbygoogle|admob/i],
  ["Firebase Analytics", /firebase\/analytics|firebase-analytics|getAnalytics\(/i],
  ["Crash reports", /crashlytics|@sentry\/|sentry-android|bugsnag/i],
  ["Product analytics", /posthog|mixpanel|@amplitude\/|plausible\.io|googletagmanager|gtag\(/i],
  ["Sign in", /firebase\/auth|firebase-auth|signInWith|GoogleSignIn|expo-auth-session/i],
  ["Cloud data", /firebase\/firestore|firestore|supabase|aws-sdk|@aws-sdk/i],
  ["Payments", /react-native-iap|billingclient|play-billing|@stripe\/|com\.stripe|revenuecat/i],
  ["Location", /expo-location|play-services-location|geolocation\.|getCurrentPosition/i],
  ["Camera, microphone", /expo-camera|expo-av|getUserMedia|CameraX|MediaRecorder/i],
  ["Contacts, calendar", /expo-contacts|expo-calendar|ContactsContract/i],
  ["Push", /expo-notifications|firebase-messaging|firebase\/messaging/i],
];

// Google Play asks for a declaration or a video for each of these.
const SENSITIVE =
  /^(ACCESS_(FINE|COARSE|BACKGROUND)_LOCATION|READ_(CONTACTS|SMS|CALL_LOG|CALENDAR|PHONE_STATE)|RECORD_AUDIO|CAMERA|READ_MEDIA_\w+|MANAGE_EXTERNAL_STORAGE|QUERY_ALL_PACKAGES|REQUEST_INSTALL_PACKAGES|SYSTEM_ALERT_WINDOW|BIND_ACCESSIBILITY_SERVICE|FOREGROUND_SERVICE_LOCATION)$/;

// A page marked true counts only at the repo root, so a vendored LICENSE stays out.
const PAGES: [string, RegExp, boolean?][] = [
  ["License", /^(LICEN[CS]E|COPYING)(\.\w+)?$/i, true],
  ["Privacy policy", /privacy/i],
  ["Terms", /terms|\btos\b|eula/i],
  ["Third party notices", /^NOTICE|third.?party|attribution|open.?source|licenses\.(json|md|html|tsx?)/i],
  ["ads.txt", /^(app-)?ads\.txt$/],
];

const TEXT = /\.(tsx?|jsx?|mjs|json|kts?|gradle|xml|swift|plist|rs|toml|html|astro|vue|py|properties)$/;

export function trackedFiles(dir: string): string[] {
  return execFileSync("git", ["ls-files"], { cwd: dir, encoding: "utf8" }).split("\n").filter(Boolean);
}

export function scanSignals(dir: string) {
  const files = trackedFiles(dir);
  const sdks: Record<string, string[]> = {};
  const permissions = new Set<string>();
  for (const file of files) {
    if (!TEXT.test(file) || /(^|\/)(node_modules|dist|build|vendor)\/|lock|\.min\./.test(file)) continue;
    const path = join(dir, file);
    if ((statSync(path, { throwIfNoEntry: false })?.size ?? Infinity) > 1e6) continue;
    const text = readFileSync(path, "utf8");
    for (const [name, pattern] of SDKS)
      if (pattern.test(text)) (sdks[name] ??= []).push(file);
    for (const match of text.matchAll(/android\.permission\.(\w+)|"(\w+_\w+)"/g)) {
      const permission = match[1] ?? match[2];
      if (SENSITIVE.test(permission) && (match[1] || /app\.(json|config)/.test(file)))
        permissions.add(permission);
    }
  }
  const pages = PAGES.map(([page, pattern, atRoot]) => ({
    page,
    files: files.filter(
      (file) =>
        pattern.test(basename(file)) &&
        !/\.(png|svg|jpe?g)$/.test(file) &&
        !(atRoot && file.includes("/")),
    ),
  }));
  return { sdks, permissions: [...permissions].sort(), pages };
}
