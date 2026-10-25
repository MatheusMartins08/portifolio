import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/content/site";
import { colorToken } from "@/lib/content/tokens";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionary";

export const alt = site.person.fullName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card per language: hero ruler, the name, a terracota rule and the About statement. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getDictionaryFor(locale);
  // .ttf copies of the geist package fonts (the image renderer cannot read woff2); literal paths so
  // the deployment bundles them.
  const [semiBold, medium, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Geist-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/GeistMono-Medium.ttf")),
  ]);

  const highlight = t.about.statementHighlight.map((word) => word.toLowerCase());
  const words = t.about.statement.split(/\s+/);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: colorToken("sand"),
          color: colorToken("ink"),
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 18,
            borderBottom: `1px solid ${colorToken("hairline-strong")}`,
            fontFamily: "Geist Mono",
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colorToken("ink-muted"),
          }}
        >
          <span>{t.hero.metaLeft}</span>
          <span>{t.hero.metaMid}</span>
          <span>{t.hero.metaRight}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{site.person.name}</div>
          <div style={{ width: 72, height: 3, margin: "40px 0 32px", background: colorToken("terracota-strong") }} />
          <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 900, fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {words.map((word, i) => (
              <span
                key={i}
                style={{
                  marginRight: 12,
                  color: highlight.includes(word.toLowerCase().replace(/[.,;:!?]+$/, "")) ? colorToken("terracota-strong") : colorToken("ink"),
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 20, color: colorToken("ink-2") }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: colorToken("terracota-strong") }} />
          <span>{t.footer.role}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semiBold, weight: 600, style: "normal" },
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
