import { cacheLife } from "next/cache";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideIcon } from "@/components/ui/SlideIcon";
import { StatusDot } from "@/components/ui/StatusDot";
import { jag, toPath } from "@/lib/geometry/lightning";
import { navSections, site } from "@/lib/content/site";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { BOLT_PATH } from "./BoltMark";
import styles from "./Footer.module.css";

/** Copyright year. Cached, because Cache Components prerenders the page and forbids a bare `new Date()`. */
async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** The charged top edge: a faint fractal break along a 1200×6 box, stretched to the page's width. */
const RULE_PATH = toPath(jag([0, 3], [1200, 3], { seed: 41, salt: 1, cap: 1.5, rough: 0.2, minSeg: 12 }));

/**
 * Closing band on sand-2: the bolt and name with role, the services line and the status; the section
 * index and the contact channels in two columns; © and back to top underneath. Its top edge takes a
 * charge, drawn left to right by the last stretch of scroll. On inner pages, pass `onHome={false}` so
 * the index points home.
 */
export async function Footer({ onHome = true }: { onHome?: boolean }) {
  const [t, locale, year] = await Promise.all([getDictionary(), getLocale(), currentYear()]);
  const home = onHome ? "" : `/${locale}`;
  const channels = [
    { label: t.contact.channels.email, href: `mailto:${site.social.email}` },
    { label: t.contact.channels.whatsapp, href: site.social.whatsapp },
    { label: t.contact.channels.linkedin, href: site.social.linkedin },
    { label: t.contact.channels.github, href: site.social.github },
  ];

  return (
    <footer className={styles.wrap}>
      <span className={styles.rule} aria-hidden="true">
        <svg viewBox="0 0 1200 6" preserveAspectRatio="none">
          <path d={RULE_PATH} pathLength={1} className={styles.charge} />
          <path d={RULE_PATH} pathLength={1} className={styles.head} />
        </svg>
      </span>

      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.name}>
              <svg className={styles.bolt} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="footer-bolt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" className={styles.boltTop} />
                    <stop offset="1" className={styles.boltBottom} />
                  </linearGradient>
                </defs>
                <path d={BOLT_PATH} />
              </svg>
              {site.person.name}
            </p>
            <p className={styles.role}>
              {t.footer.role} · {t.about.cards.locationCity}
            </p>
            <p className={styles.line}>{t.services.statement}</p>
            <StatusDot tone={site.status} className={styles.status}>
              {t.about.cards.status}
            </StatusDot>
          </div>

          <nav className={styles.col} aria-labelledby="footer-nav">
            <SectionLabel id="footer-nav">{t.footer.navigation}</SectionLabel>
            <ul className={styles.list}>
              {navSections.map((section) => (
                <li key={section.id}>
                  <a className={styles.link} href={`${home}#${section.id}`}>
                    <span className={styles.index}>{section.index}</span>
                    <span className={styles.text}>{t.nav[section.id]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <SectionLabel id="footer-contact">{t.contact.label}</SectionLabel>
            <ul className={styles.list} aria-labelledby="footer-contact">
              {channels.map((channel) => {
                const external = /^https?:/.test(channel.href);
                return (
                  <li key={channel.href}>
                    <a
                      className={styles.link}
                      href={channel.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                    >
                      <span className={styles.text}>{channel.label}</span>
                      <SlideIcon name="arrow-up-right" size={12} className={styles.arrow} />
                      {external ? <span className="sr-only"> {t.a11y.newTab}</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>
            © {year} {site.person.fullName}
          </span>
          {/* "#top" scrolls to the top of any page, no element needed (HTML spec). */}
          <a className={styles.link} href="#top">
            <span className={styles.text}>{t.footer.backToTop}</span>
            <SlideIcon name="arrow-up" size={12} className={styles.arrow} />
          </a>
        </div>
      </div>
    </footer>
  );
}
