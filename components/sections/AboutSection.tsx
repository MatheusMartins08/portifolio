import { AboutBoard } from "@/components/about/AboutBoard";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

/**
 * About, as a circuit board: the section's sentence in two lines, then the About text in a few short
 * blocks laid on a faint PCB (AboutBoard). As the page scrolls, a bolt comes down beside the sentence
 * onto a lightning rod, and its energy runs a trace past every block, lighting each in turn (Circuit).
 */
export async function AboutSection() {
  const t = await getDictionary();
  const { blocks, board } = t.about;

  return (
    <Section id="sobre" labelledBy="sobre-title">
      <Statement
        align="center"
        label={t.about.label}
        index={sectionIndex("sobre")}
        highlight={t.about.statementHighlight}
        headingId="sobre-title"
        breakAfterHighlight
      >
        {t.about.statement}
      </Statement>

      <AboutBoard blocks={blocks} sentenceId="sobre-title" rod={board.rod} ground={board.ground} silk={board.silk} />
    </Section>
  );
}
