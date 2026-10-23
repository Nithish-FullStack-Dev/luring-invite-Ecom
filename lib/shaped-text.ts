import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

let rasterizer: Promise<typeof import("sharp").default> | null = null;

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

async function getRasterizer() {
  if (!rasterizer) {
    rasterizer = (async () => {
      const project = process.cwd();
      const configDir = path.join(os.tmpdir(), "luring-invite-fontconfig");
      const cacheDir = path.join(configDir, "cache");
      await fs.mkdir(cacheDir, { recursive: true });
      const configPath = path.join(configDir, "fonts.conf");
      const fontDirs = [
        path.join(project, "public", "media", "fonts"),
        path.join(project, "public", "fonts"),
      ];
      const escapedDirs = fontDirs.map((dir) => `<dir>${xml(dir.replace(/\\/g, "/"))}</dir>`).join("");
      const config = `<?xml version="1.0"?><fontconfig>${escapedDirs}<cachedir>${xml(cacheDir.replace(/\\/g, "/"))}</cachedir></fontconfig>`;
      await fs.writeFile(configPath, config, "utf8");
      // libvips' Pango/librsvg stack reads Fontconfig once. Set this before
      // loading sharp, and point it only at fonts that ship with this app.
      process.env.FONTCONFIG_FILE = configPath;
      process.env.FONTCONFIG_PATH = configDir;
      const sharpModule = await import("sharp");
      const sharp = sharpModule.default;
      const versions = sharp.versions as Record<string, string | undefined>;
      if (!versions.pango || !versions.harfbuzz || !versions.fontconfig || !versions.freetype) {
        throw new Error("The installed image renderer lacks Pango, HarfBuzz, Fontconfig, or FreeType required for multilingual text shaping.");
      }
      return sharp;
    })().catch((error) => {
      rasterizer = null;
      throw error;
    });
  }
  return rasterizer;
}

/** Render a transparent, full-composition frame with Pango's script shaping
 * and Fontconfig glyph fallback. FFmpeg consumes the generated PNG sequence
 * as an overlay in the existing scene filter graph. */
export async function renderShapedSvgSequence(
  svgForFrame: (frame: number) => string,
  outputDirectory: string,
  frameCount: number,
) {
  const sharp = await getRasterizer();
  await fs.mkdir(outputDirectory, { recursive: true });
  for (let frame = 0; frame < frameCount; frame++) {
    const name = `multilingual-${String(frame).padStart(6, "0")}.png`;
    const output = path.join(outputDirectory, name);
    await sharp(Buffer.from(svgForFrame(frame), "utf8"))
      .png({ compressionLevel: 6, palette: false })
      .toFile(output);
  }
  return path.join(outputDirectory, "multilingual-%06d.png");
}

export function escapeSvgText(value: unknown) {
  return xml(String(value ?? ""));
}

export function shapedTextSequenceDirectory(workDir: string) {
  return path.join(workDir, `shaped-text-${crypto.randomUUID()}`);
}
