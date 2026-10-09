import React from "react";

export type VideoPlatform = "local" | "youtube" | "instagram" | "pinterest";

type PreviewMode = "card" | "modal";

type Props = {
  url: string;
  platform?: VideoPlatform;
  /** optional override thumbnail (only used when available) */
  thumbnail?: string;
  /** for accessibility */
  title?: string;
  /** card = list preview | modal = playable */
  mode?: PreviewMode;

  /** controls iframe clickability (modal needs true, card should be false) */
  interactive?: boolean;

  /** pass your classes */
  className?: string;
  mediaClassName?: string;
};

/** ---------------- helpers ---------------- */

function isLocalVideoUrl(url: string): boolean {
  const lower = url.toLowerCase().split("?")[0].split("#")[0];
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.startsWith("/videos/") ||
    lower.startsWith("videos/")
  );
}

function inferPlatform(url: string, declared?: VideoPlatform): VideoPlatform {
  if (!url) return declared ?? "local";
  if (isLocalVideoUrl(url)) return "local";

  // fallback simple checks (works even if URL parse fails)
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("pinterest.") || lower.includes("pin.it")) return "pinterest";

  try {
    if (typeof window === "undefined") return declared ?? "local";
    const u = new URL(url, window.location.origin);
    const host = u.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("pinterest.") || host.includes("pin.it")) return "pinterest";
  } catch {
    // ignore
  }

  return declared ?? "local";
}

function getYouTubeId(url: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    const u = new URL(url, window.location.origin);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const v = u.searchParams.get("v");
    if (v) return v;

    const parts = u.pathname.split("/").filter(Boolean);

    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];

    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumb(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function normalizeInstagramUrl(url: string) {
  try {
    if (typeof window === "undefined") return url;
    const u = new URL(url, window.location.origin);
    u.protocol = "https:";
    if (!u.pathname.endsWith("/")) u.pathname += "/";
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Supports IG:
 * - /p/{code}/
 * - /reel/{code}/
 * - /tv/{code}/
 */
function getInstagramEmbedUrl(url: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    const u = new URL(url, window.location.origin);
    const parts = u.pathname.split("/").filter(Boolean);

    const type = parts[0]; // p | reel | tv
    const code = parts[1];

    if (!code) return null;

    const valid = ["p", "reel", "tv"];
    const finalType = valid.includes(type) ? type : "p";

    return `https://www.instagram.com/${finalType}/${code}/embed/`;
  } catch {
    return null;
  }
}

function getPinterestEmbedUrl(url: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    const u = new URL(url, window.location.origin);
    const parts = u.pathname.split("/").filter(Boolean);

    const pinIndex = parts.indexOf("pin");
    const id = pinIndex >= 0 ? parts[pinIndex + 1] : null;
    if (!id) return null;

    return `https://assets.pinterest.com/ext/embed.html?id=${id}`;
  } catch {
    return null;
  }
}

function getEmbedSrc(platform: VideoPlatform, url: string, autoplay: boolean): string | null {
  if (platform === "youtube") {
    const id = getYouTubeId(url);
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=${
      autoplay ? 1 : 0
    }`;
  }

  if (platform === "instagram") {
    const normalized = normalizeInstagramUrl(url);
    return getInstagramEmbedUrl(normalized);
  }

  if (platform === "pinterest") {
    return getPinterestEmbedUrl(url);
  }

  return null;
}

/** ---------------- component ---------------- */

export default function VideoPreview({
  url,
  platform,
  thumbnail,
  title = "Video Preview",
  mode = "card",
  interactive,
  className = "",
  mediaClassName = "",
}: Props) {
  const resolvedPlatform = inferPlatform(url, platform);

  const isModal = mode === "modal";
  const isInteractive = interactive ?? isModal;

  // ✅ Thumbnail priority:
  // 1) user override thumbnail (optional)
  // 2) YouTube automatic thumbnail
  const autoThumb =
    thumbnail ||
    (resolvedPlatform === "youtube" ? getYouTubeThumb(url) : null);

  // ✅ In card mode: show YouTube thumb (not iframe)
  if (resolvedPlatform === "youtube" && !isModal && autoThumb) {
    return (
      <img
        src={autoThumb}
        alt={title}
        className={`${className} ${mediaClassName}`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  // ✅ Local video (card = autoplay loop | modal = controls)
  if (resolvedPlatform === "local") {
    return (
      <video
        src={url}
        className={`${className} ${mediaClassName}`}
        muted={!isModal}
        playsInline
        loop={!isModal}
        autoPlay={!isModal}
        controls={isModal}
        preload="metadata"
      />
    );
  }

  // ✅ Instagram / Pinterest / YouTube (modal) => iframe embed
  const embedSrc = getEmbedSrc(resolvedPlatform, url, isModal);

  if (embedSrc) {
    return (
      <iframe
        src={embedSrc}
        title={title}
        className={`${className} ${mediaClassName}`}
        loading="lazy"
        style={{
          border: 0,
          pointerEvents: isInteractive ? "auto" : "none",
        }}
        allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  // ✅ fallback: if someone gave custom thumbnail but embed fails
  if (autoThumb) {
    return (
      <img
        src={autoThumb}
        alt={title}
        className={`${className} ${mediaClassName}`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  // ✅ last fallback
  return (
    <div
      className={`${className} flex items-center justify-center bg-muted text-muted-foreground text-sm`}
    >
      Preview not available
    </div>
  );
}
