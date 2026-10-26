# Bundled Noto fonts

These unmodified font files are bundled to give the editor and the FFmpeg
renderer a deterministic font set instead of relying on the host operating
system. They are from the Noto Project and licensed under SIL Open Font License
1.1; the applicable upstream license texts are `LICENSE.txt` in this folder
and `../noto-cjk-LICENSE.txt` for the regional CJK fonts.

Sources:

- General and script fonts: <https://github.com/notofonts/noto-fonts>
- CJK regional fonts: <https://github.com/notofonts/noto-cjk>

The registry includes Latin/Greek/Cyrillic, Arabic, Urdu Nastaliq, Hebrew,
Devanagari, Bengali, Gujarati, Gurmukhi, Odia, Tamil, Telugu, Kannada,
Malayalam, Sinhala, Thai, Lao, Khmer, Myanmar, Armenian, Georgian, Ethiopic,
and Simplified Chinese, Traditional Chinese, Japanese, and Korean CJK variants.

The renderer preserves the selected font for single-face text when possible.
For a mixed-script string that requires more than one face, it uses the
application's Sharp/librsvg/Pango stack with HarfBuzz, FriBidi, and Fontconfig
to shape and composite a transparent text overlay; Fontconfig is restricted to
the bundled project font directories. Keep the font assets and the Sharp
runtime dependency installed on every production video worker. Pure-script
strings continue through FFmpeg `drawtext`, which requires FreeType and
HarfBuzz; right-to-left strings additionally require FriBidi. If the bundled
font set does not cover every rendered character, generation reports the
missing code points rather than returning a corrupted video. This is broad
script coverage, not a claim that every Unicode character or emoji is
available in the bundled fonts.
