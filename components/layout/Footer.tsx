import { ArrowLink } from "@/components/ui/ArrowLink";
import { site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./Footer.module.css";

/** Copyright year. Cached, because Cache Components prerenders the page and forbids a bare `new Date()`. */
async function currentYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

/** Minimal one-line footer: name + role, links, ©. Never grows into a sitemap. */
export async function Footer() {
  const [t, year] = await Promise.all([getDictionary(), currentYear()]);
  const links = [
    { label: t.contact.channels.linkedin, href: site.social.linkedin },
    { label: t.contact.channels.github, href: site.social.github },
    { label: t.footer.email, href: `mailto:${site.social.email}` },
  ];

  return (
    <footer className={styles.wrap}>
      <div className={styles.footer}>
        <div className={styles.id}>
          <span className={styles.name}>{site.person.name}</span>
          <span className={styles.role}>{t.footer.role}</span>
        </div>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <ArrowLink href={link.href} size="sm" newTabLabel={t.a11y.newTab}>
                {link.label}
              </ArrowLink>
            </li>
          ))}
        </ul>
        <span className={styles.copy}>© {year}</span>
      </div>
    </footer>
  );
}
