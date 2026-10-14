import { navSections, site } from "@/lib/content/site";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { Header } from "./Header";

/** Header wired to the dictionary and site data. On inner pages, pass `onHome={false}` so anchors point home. */
export async function SiteHeader({ onHome = true }: { onHome?: boolean }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <Header
      items={navSections.map((section) => ({ id: section.id, label: t.nav[section.id] }))}
      locale={locale}
      homeHref={onHome ? "" : `/${locale}`}
      labels={{
        nav: t.a11y.nav,
        menu: t.nav.menu,
        close: t.nav.close,
        language: t.nav.language,
        cv: t.nav.cv,
        cvShort: t.nav.cvShort,
      }}
      cvHref={site.cv.href}
    />
  );
}
