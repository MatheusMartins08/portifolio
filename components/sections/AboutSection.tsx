import { CommitLog } from "@/components/about/CommitLog";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { asset } from "@/lib/content/assets";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

/**
 * About, as a commit history: the section's sentence, then the About text cut into short blocks, each
 * a commit on GitHub's list (CommitLog), newest first — little on screen, each description a click
 * away. Down the log's rail, between its marks, the bolt (AboutTrace) lights as the page scrolls.
 */
export async function AboutSection() {
  const t = await getDictionary();
  const { log, groups, when, commits } = t.about;

  return (
    <Section id="sobre" labelledBy="sobre-title">
      <Statement
        align="center"
        label={t.about.label}
        index={sectionIndex("sobre")}
        highlight={t.about.statementHighlight}
        headingId="sobre-title"
      >
        {t.about.statement}
      </Statement>

      <CommitLog
        heading={log.heading}
        branch={log.branch}
        unit={log.unit}
        committed={log.committed}
        copy={log.copy}
        copied={log.copied}
        groups={groups}
        when={when}
        commits={commits}
        author={site.social.githubHandle.replace(/^@/, "")}
        avatar={asset(site.person.avatar)}
      />
    </Section>
  );
}
