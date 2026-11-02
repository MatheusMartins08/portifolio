import { Fragment, type ReactNode } from "react";
import { AboutModule } from "@/components/about/AboutModule";
import { AboutTrace } from "@/components/about/AboutTrace";
import { BuildFlow } from "@/components/about/BuildFlow";
import { Globe } from "@/components/about/Globe";
import { Signal } from "@/components/about/Signal";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { cssVars } from "@/lib/cx";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./AboutSection.module.css";

/** Wraps the earliest occurrence of any highlight phrase, repeatedly. */
function markText(text: string, highlight: string[]): ReactNode {
  const out: ReactNode[] = [];
  let rest = text;
  while (rest) {
    let at = -1;
    let phrase = "";
    for (const candidate of highlight) {
      const i = candidate ? rest.indexOf(candidate) : -1;
      if (i >= 0 && (at < 0 || i < at)) {
        at = i;
        phrase = candidate;
      }
    }
    if (at < 0) {
      out.push(rest);
      break;
    }
    if (at > 0) out.push(rest.slice(0, at));
    out.push(
      <strong key={out.length} className={styles.hl}>
        {phrase}
      </strong>,
    );
    rest = rest.slice(at + phrase.length);
  }
  return out.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

const normalize = (word: string) => word.toLowerCase().replace(/[.,;:!?]+$/, "");

/** Sets the given words in italic: emphasis by type, as in the section titles. */
function emphasize(text: string, words: string[]): ReactNode {
  const marked = words.map(normalize);
  return text.split(/(\s+)/).map((part, i) =>
    marked.includes(normalize(part)) ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/**
 * About, as a developer profile: one sheet cut by hairlines into modules. The data modules are drawn as
 * diagrams in the site's lightning language — a signal for the status, a wireframe globe for where he
 * works from, the build cycle as an architecture diagram, the path as merging branches — and the
 * narrative ones stay type (profile, principle, mindset). The bolt (AboutTrace) runs down the sheet's
 * left edge, waking each module as it passes, then along the closing module's top, which lights up.
 */
export async function AboutSection() {
  const t = await getDictionary();
  const { modules, profile, principle, cycle, path, mindset, cards, highlight } = t.about;
  const index = sectionIndex("sobre");
  const at = (n: number) => `${index}.${n}`;
  const last = path.stops.length - 1;

  return (
    <Section id="sobre" labelledBy="sobre-title">
      <div className={styles.stage}>
        <AboutTrace />

        <Statement
          align="center"
          label={t.about.label}
          index={index}
          highlight={t.about.statementHighlight}
          headingId="sobre-title"
        >
          {t.about.statement}
        </Statement>

        <div className={styles.frame}>
          <span className={styles.marks} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>

          <div className={styles.sheet}>
            <AboutModule index={at(1)} label={modules.profile.label} meta={modules.profile.meta} className={styles.profile}>
              <div className={styles.profileBody}>
                <p className={styles.name}>{site.person.fullName}</p>
                <p className={styles.role}>{profile.role}</p>
                <p className={styles.lead}>{markText(profile.lead, highlight)}</p>
              </div>
            </AboutModule>

            <AboutModule
              index={at(2)}
              label={modules.status.label}
              meta={modules.status.meta}
              strip
              delay={90}
              className={styles.status}
            >
              <div className={styles.signalBox}>
                <Signal />
              </div>
              <p className={styles.statusText}>{cards.status}</p>
            </AboutModule>

            <AboutModule index={at(3)} label={modules.location.label} meta={cards.utcOffset} delay={180} className={styles.location}>
              <div className={styles.locationBody}>
                <div>
                  <p className={styles.value}>{cards.locationCity}</p>
                  <p className={styles.small}>{cards.locationRegion}</p>
                  <p className={styles.coords}>{cards.coordinates}</p>
                  <p className={styles.subLabel}>{modules.availability.label}</p>
                  <p className={styles.valueSm}>{cards.availableFor}</p>
                  <p className={styles.small}>{cards.availableWhere}</p>
                </div>
                <div className={styles.globeBox}>
                  <Globe />
                </div>
              </div>
            </AboutModule>

            <AboutModule
              index={at(4)}
              label={modules.cycle.label}
              meta={`${cycle.steps.length} ${modules.cycle.unit}`}
              className={styles.cycle}
            >
              <p className={styles.body}>{cycle.intro}</p>
              <BuildFlow steps={cycle.steps} />
            </AboutModule>

            <AboutModule index={at(5)} label={modules.principle.label} className={styles.principle}>
              <p className={styles.principleTitle}>{emphasize(principle.title, principle.titleHighlight)}</p>
              <p className={styles.body}>{principle.body}</p>
              <ul className={styles.qualities}>
                {principle.qualities.map((quality, i) => (
                  <li key={quality}>
                    <span className={styles.qualityKey} aria-hidden="true">
                      {String.fromCharCode(97 + i)}
                    </span>
                    <span className={styles.qualityName}>{quality}</span>
                  </li>
                ))}
              </ul>
            </AboutModule>

            <AboutModule index={at(6)} label={modules.path.label} meta={modules.path.meta} delay={90} className={styles.path}>
              {/* The first stop is a side branch that merges into the main line at the second; the last is where it stands, and goes on. */}
              <ol className={styles.stops}>
                {path.stops.map((stop, i) => (
                  <li
                    key={stop.when}
                    className={styles.stop}
                    data-lane={i === 0 ? "branch" : i === last ? "head" : "main"}
                    style={cssVars({ "--i": i })}
                  >
                    <span className={styles.lane} aria-hidden="true">
                      {i === 1 ? (
                        <svg className={styles.merge} viewBox="0 0 28 28" preserveAspectRatio="none">
                          <path d="M6 0C6 16 22 12 22 28" />
                        </svg>
                      ) : null}
                      <span className={styles.node} />
                    </span>
                    <div>
                      <p className={styles.when}>{stop.when}</p>
                      <p className={styles.stopText}>{markText(stop.text, highlight)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </AboutModule>

            <AboutModule index={at(7)} label={modules.mindset.label} end className={styles.mindset} innerClassName={styles.mindsetInner}>
              <blockquote className={styles.quote}>
                <p>{mindset.quote}</p>
              </blockquote>
              <p className={styles.mindsetBody}>{markText(mindset.body, highlight)}</p>
            </AboutModule>
          </div>
        </div>
      </div>
    </Section>
  );
}
