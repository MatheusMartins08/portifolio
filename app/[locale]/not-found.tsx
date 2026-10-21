import { SiteHeader } from "@/components/header/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import styles from "./not-found.module.css";

/** 404 in the route's language, with the same typography as the section statements. */
export default async function NotFound() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <>
      <SiteHeader onHome={false} />
      <main className={styles.page}>
        <SectionLabel index="404">{t.notFound.label}</SectionLabel>
        <h1 className={styles.title}>{t.notFound.title}</h1>
        <p className={styles.body}>{t.notFound.body}</p>
        <ArrowLink href={`/${locale}`} icon="arrow-right" size="lg" external={false}>
          {t.notFound.back}
        </ArrowLink>
      </main>
      <Footer onHome={false} />
    </>
  );
}
