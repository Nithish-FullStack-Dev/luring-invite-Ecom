import React from "react";

export type VideoPlatform = "local" | "youtube" | "instagram" | "pinterest";

type PreviewMode = "card" | "modal";

type Props = {
  url: string;
  platform?: VideoPlatform;
  /** Optional thumbnail override */
  thumbnail?: string;
  /** Accessibility label */
  title?: string;
  /** card = list preview | modal = playable */
  mode?: PreviewMode;
  /** Modal needs true; card should generally be false */
  interactive?: boolean;
  /** Custom classes */
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

/**
 * Resolve URLs without relying on window.
 * The same result is produced during SSR and client rendering.
 */
function parseUrl(url: string): URL | null {
  try {
    return new URL(url, "https://video-preview.invalid");
  } catch {
    return null;
  }
}

function inferPlatform(url: string, declared?: VideoPlatform): VideoPlatform {
  if (!url) return declared ?? "local";

  if (isLocalVideoUrl(url)) return "local";

  const parsed = parseUrl(url);
  const host = parsed?.hostname.toLowerCase() ?? "";
  const lower = url.toLowerCase();

  if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com") ||
    host === "youtu.be" ||
    host.endsWith(".youtu.be") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (
    host === "instagram.com" ||
    host.endsWith(".instagram.com") ||
    lower.includes("instagram.com")
  ) {
    return "instagram";
  }

  if (
    host === "pinterest.com" ||
    host.endsWith(".pinterest.com") ||
    host === "pin.it" ||
    host.endsWith(".pin.it") ||
    lower.includes("pinterest.") ||
    lower.includes("pin.it")
  ) {
    return "pinterest";
  }

  return declared ?? "local";
}

/** Extract a YouTube video ID on both server and client. */
function getYouTubeId(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const host = parsed.hostname.toLowerCase();
  const parts = parsed.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    return parts[0] || null;
  }

  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    const videoId = parsed.searchParams.get("v");
    if (videoId) return videoId;

    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
      return parts[shortsIndex + 1];
    }

    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }

    const liveIndex = parts.indexOf("live");
    if (liveIndex >= 0 && parts[liveIndex + 1]) {
      return parts[liveIndex + 1];
    }
  }

  return null;
}

function getYouTubeThumb(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;

  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function normalizeInstagramUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;

  parsed.protocol = "https:";

  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname += "/";
  }

  parsed.search = "";
  parsed.hash = "";

  return parsed.toString();
}

/**
 * Supports Instagram:
 * - /p/{code}/
 * - /reel/{code}/
 * - /tv/{code}/
 */
function getInstagramEmbedUrl(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const parts = parsed.pathname.split("/").filter(Boolean);
  const type = parts[0];
  const code = parts[1];

  if (!code) return null;

  const validTypes = ["p", "reel", "tv"];
  const finalType = validTypes.includes(type) ? type : "p";

  return `https://www.instagram.com/${finalType}/${encodeURIComponent(code)}/embed/`;
}

function getPinterestEmbedUrl(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const parts = parsed.pathname.split("/").filter(Boolean);
  const pinIndex = parts.indexOf("pin");
  const id = pinIndex >= 0 ? parts[pinIndex + 1] : null;

  if (!id) return null;

  return `https://assets.pinterest.com/ext/embed.html?id=${encodeURIComponent(id)}`;
}

function getEmbedSrc(
  platform: VideoPlatform,
  url: string,
  autoplay: boolean,
): string | null {
  if (platform === "youtube") {
    const id = getYouTubeId(url);
    if (!id) return null;

    return (
      `https://www.youtube.com/embed/${id}` +
      `?rel=0&modestbranding=1&playsinline=1&autoplay=${autoplay ? 1 : 0}`
    );
  }

  if (platform === "instagram") {
    return getInstagramEmbedUrl(normalizeInstagramUrl(url));
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
  // All URL parsing is deterministic and safe during SSR.
  const resolvedPlatform = inferPlatform(url, platform);

  const isModal = mode === "modal";
  const isInteractive = interactive ?? isModal;

  // Priority:
  // 1. Explicit thumbnail
  // 2. Automatically generated YouTube thumbnail
  const autoThumb =
    thumbnail || (resolvedPlatform === "youtube" ? getYouTubeThumb(url) : null);

  // YouTube card: thumbnail only, no iframe.
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

  // Local video: autoplay/loop in cards; controls in modals.
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

  // External platforms and YouTube modal: embedded player.
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
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  // Custom thumbnail fallback.
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

  // Last fallback.
  return (
    <div
      className={`${className} flex items-center justify-center bg-muted text-muted-foreground text-sm`}
    >
      Preview not available
    </div>
  );
}
