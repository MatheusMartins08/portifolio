import { AttractField } from "@/components/contact/AttractField";
import { ContactLauncher } from "@/components/contact/ContactLauncher";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./ContactSection.module.css";

export async function ContactSection() {
  const t = await getDictionary();
  const { contact } = t;
  const index = sectionIndex("contato");

  return (
    <Section id="contato" labelledBy="contato-title">
      <div className={styles.cta}>
        {/* Dashes drawn to the CTA (and to the cursor), clear of the label and the sentence. */}
        <AttractField target="[data-field-target]" holes="h2, p" />
        <Statement align="center" label={contact.label} index={index} highlight={contact.statementHighlight} headingId="contato-title">
          {contact.statement}
        </Statement>
        <ContactLauncher
          cta={contact.cta}
          modal={{
            index,
            kicker: contact.label,
            title: contact.modal.title,
            intro: contact.modal.intro,
            closeLabel: contact.modal.close,
            newTabLabel: t.a11y.newTab,
            channels: [
              { label: contact.channels.email, value: site.social.email, href: `mailto:${site.social.email}`, icon: "mail" },
              { label: contact.channels.whatsapp, value: site.social.whatsappDisplay, href: site.social.whatsapp, icon: "chat" },
              { label: contact.channels.linkedin, value: site.social.linkedinHandle, href: site.social.linkedin, icon: "linkedin" },
              { label: contact.channels.github, value: site.social.githubHandle, href: site.social.github, icon: "github" },
            ],
            form: contact.form,
          }}
        />
      </div>
    </Section>
  );
}
