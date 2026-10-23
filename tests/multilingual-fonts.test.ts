import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { resolveFontAsset, resolveFontFallbackSequence, serverFontPath } from "@/lib/font-registry";
import { resolveTextRenderFont } from "@/lib/video-renderer";
import { missingFontGlyphs, readFontFamilyName } from "@/lib/font-glyphs";
import { countGraphemes, revealUnits } from "@/lib/text-reveal";
import { wrapInvitationText } from "@/lib/text-layout";

const pureScriptSamples: Array<[string, string, string, string]> = [
  ["English remains in the configured bold design font", "Hello, Insha!", "Philosopher-Bold.ttf", "Philosopher"],
  ["Telugu shapes with its bundled Noto face", "\u0c35\u0c3f\u0c35\u0c3e\u0c39\u0c02", "noto/NotoSansTelugu-Regular.otf", "Noto Sans Telugu"],
  ["Hindi shapes with its bundled Devanagari face", "\u0928\u092e\u0938\u094d\u0924\u0947", "noto/NotoSansDevanagari-Regular.otf", "Noto Sans Devanagari"],
  ["Arabic shapes with its bundled Arabic face", "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645", "noto/NotoSansArabic-Regular.otf", "Noto Sans Arabic"],
  ["Urdu uses Nastaliq for Urdu-specific letters", "\u0645\u06cc\u0631\u0627 \u0646\u0627\u0645", "noto/NotoNastaliqUrdu-Regular.otf", "Noto Nastaliq Urdu"],
  ["Chinese uses the simplified Chinese regional face", "\u4f60\u597d\u4e16\u754c", "noto/NotoSansCJKsc-Regular.otf", "Noto Sans CJK SC"],
  ["Japanese uses its regional face", "\u3053\u3093\u306b\u3061\u306f", "noto/NotoSansCJKjp-Regular.otf", "Noto Sans CJK JP"],
  ["Korean uses its regional face", "\ud55c\uad6d\uc5b4", "noto/NotoSansCJKkr-Regular.otf", "Noto Sans CJK KR"],
];

const bundledScriptSamples: Array<[string, string]> = [
  ["noto/NotoSans-Regular.otf", "\u0393\u03b5\u03b9\u03ac \u041f\u0440\u0438\u0432\u0435\u0442"],
  ["noto/NotoSansArabic-Regular.otf", "\u0627\u0644\u0633\u0644\u0627\u0645"],
  ["noto/NotoSansArmenian-Regular.otf", "\u0532\u0561\u0580\u0565\u0582"],
  ["noto/NotoSansBengali-Regular.otf", "\u09ac\u09bf\u09af\u09bc\u09c7\u09b0"],
  ["noto/NotoSansDevanagari-Regular.otf", "\u0928\u092e\u0938\u094d\u0924\u0947"],
  ["noto/NotoSansEthiopic-Regular.otf", "\u1230\u120b\u121d"],
  ["noto/NotoSansGeorgian-Regular.otf", "\u10d2\u10d0\u10db\u10d0\u10e0\u10ef\u10dd\u10d1\u10d0"],
  ["noto/NotoSansGujarati-Regular.otf", "\u0aa8\u0aae\u0ab8\u0acd\u0aa4\u0ac7"],
  ["noto/NotoSansGurmukhi-Regular.otf", "\u0a38\u0a24\u0a3f \u0a38\u0a4d\u0a30\u0a40 \u0a05\u0a15\u0a3e\u0a32"],
  ["noto/NotoSansHebrew-Regular.otf", "\u05e9\u05dc\u05d5\u05dd"],
  ["noto/NotoSansKannada-Regular.otf", "\u0ca8\u0cae\u0cb8\u0ccd\u0c95\u0cbe\u0cb0"],
  ["noto/NotoSansKhmer-Regular.otf", "\u179f\u17bd\u1784\u17d2\u179f\u17d2\u178f\u17b8"],
  ["noto/NotoSansLao-Regular.otf", "\u0eaa\u0eb0\u0e9a\u0eb2\u0e8d\u0e94\u0eb5"],
  ["noto/NotoSansMalayalam-Regular.otf", "\u0d28\u0d2e\u0d38\u0d4d\u0d15\u0d3e\u0d30\u0d02"],
  ["noto/NotoSansMyanmar-Regular.otf", "\u1019\u102d\u1004\u103a\u1039\u1002\u101c\u102c\u1015\u102b"],
  ["noto/NotoSansOriya-Regular.otf", "\u0b28\u0b2e\u0b38\u0b4d\u0b15\u0b3e\u0b30"],
  ["noto/NotoSansSinhala-Regular.otf", "\u0d86\u0dba\u0dd4\u0db6\u0ddd\u0dc0\u0db1\u0dca"],
  ["noto/NotoSansTamil-Regular.otf", "\u0bb5\u0ba3\u0b95\u0bcd\u0b95\u0bae\u0bcd"],
  ["noto/NotoSansTelugu-Regular.otf", "\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02"],
  ["noto/NotoSansThai-Regular.otf", "\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35"],
];

test("bundled Noto fonts include Unicode maps and resolvable family names", async () => {
  for (const [description, sample, fontId, family] of pureScriptSamples.slice(1)) {
    const font = resolveFontAsset(fontId);
    const bytes = await fs.readFile(path.join(process.cwd(), font.serverPath!));
    assert.deepEqual(missingFontGlyphs(bytes, sample), [], description);
    assert.equal(readFontFamilyName(bytes), family, description);
    assert.equal(serverFontPath(font.id), font.serverPath, description);
  }
});

test("bundled script fonts cover representative samples across the registered scripts", async () => {
  for (const [fontId, sample] of bundledScriptSamples) {
    const font = resolveFontAsset(fontId);
    const bytes = await fs.readFile(path.join(process.cwd(), font.serverPath!));
    assert.deepEqual(missingFontGlyphs(bytes, sample), [], fontId);
    assert.ok(resolveFontFallbackSequence("Philosopher-Bold.ttf", sample).some((fallback) => fallback.id === fontId), fontId);
  }
});

test("single-face text preserves existing design font and script fallbacks", async () => {
  for (const [description, sample, expectedFont] of pureScriptSamples.map(([name, text, font]) => [name, text, font] as const)) {
    const rendered = await resolveTextRenderFont("Philosopher-Bold.ttf", sample);
    assert.equal(rendered.font.id, expectedFont, description);
    assert.equal(rendered.supportsAllGlyphs, true, description);
  }
});

test("mixed-script runs retain the design face and include compatible script fonts", async () => {
  const samples: Array<[string, string, string]> = [
    ["English with Telugu", "Welcome \u0c35\u0c3f\u0c35\u0c3e\u0c39\u0c02", "Noto Sans Telugu"],
    ["English with Hindi", "Wedding \u0928\u092e\u0938\u094d\u0924\u0947", "Noto Sans Devanagari"],
    ["English with Arabic", "Welcome \u0627\u0644\u0633\u0644\u0627\u0645", "Noto Sans Arabic"],
  ];
  for (const [description, sample, expectedFallback] of samples) {
    const rendered = await resolveTextRenderFont("Philosopher-Bold.ttf", sample);
    assert.equal(rendered.supportsAllGlyphs, false, description);
    assert.ok(rendered.familyStack.includes("Philosopher"), description);
    assert.ok(rendered.familyStack.includes(expectedFallback), description);
    assert.ok(rendered.fallbackFonts?.length, description);
  }
});

test("Urdu Nastaliq is routed through the script-shaping overlay even when cmap coverage is complete", async () => {
  const rendered = await resolveTextRenderFont("Philosopher-Bold.ttf", "\u0645\u06cc\u0631\u0627 \u0646\u0627\u0645");
  assert.equal(rendered.supportsAllGlyphs, true);
  assert.equal(rendered.useShapedOverlay, true);
});

test("uncovered symbols fail with an actionable font error", async () => {
  await assert.rejects(
    () => resolveTextRenderFont("Philosopher-Bold.ttf", "Invitation \ud83e\uddea"),
    /Missing glyphs:.*Upload a valid/i,
  );
});

test("typewriter segmentation keeps grapheme clusters, punctuation, and Unicode text", () => {
  assert.equal(countGraphemes("\ud83d\udc69\u200d\ud83d\udcbb"), 1);
  const telugu = "\u0c35\u0c3f\u0c35\u0c3e\u0c39\u0c02";
  assert.equal(countGraphemes(telugu), revealUnits(telugu, "letter").length);
  const hindi = "\u0928\u092e\u0938\u094d\u0924\u0947";
  assert.equal(revealUnits(hindi, "letter").join(""), hindi);
  assert.equal(revealUnits("Hello, wedding!", "word").join(""), "Hello, wedding!");
  assert.equal(revealUnits("\u4f60\u597d\u4e16\u754c", "word").join(""), "\u4f60\u597d\u4e16\u754c");
});

test("multiline text keeps authored breaks and wraps unbroken Unicode without code-unit splits", () => {
  const value = "Welcome  family\n\u0928\u092e\u0938\u094d\u0924\u0947";
  assert.equal(wrapInvitationText(value, 48, 400), value);
  assert.equal(wrapInvitationText("A  B", 48, 2000), "A  B");
  const narrow = wrapInvitationText("\u0c35\u0c3f\u0c35\u0c3e\u0c39\u0c02", 48, 80);
  assert.ok(narrow.includes("\n"));
  assert.ok(narrow.replace(/\n/g, "").includes("\u0c3f"));
});
