import siteJson from "@/design-system/content/site.json";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Typed view of design-system/content/site.json (links, contacts, images, item order).
 * Keys such as `projects[].key` point to entries in i18n.json, so they are typed against the Dictionary.
 */

export type SectionId = "sobre" | "servicos" | "experiencia" | "skills" | "projetos" | "contato";

export interface SiteSection {
  id: SectionId;
  i18n: string;
  index: string;
  inNav?: boolean;
}

export type ServiceKey = "web" | "ai";

export interface Service {
  key: ServiceKey;
  index: string;
  motif: ServiceKey;
  size: "lg" | "md";
}

export type ExperienceGroup = keyof Dictionary["experience"]["tabs"];
export type ExperienceKey = keyof Dictionary["experience"]["items"];

export interface ExperienceEntry {
  key: ExperienceKey;
  current?: boolean;
  currentLabel?: keyof Dictionary["experience"]["ui"];
  future?: boolean;
}

export interface SkillItem {
  name: string;
  ext: string;
  category: keyof Dictionary["skills"]["categories"];
  glyph?: string;
}

export interface SkillFolder {
  key: keyof Dictionary["skills"]["folders"];
  index: string;
  items: SkillItem[];
}

export interface Project {
  slug: string;
  key: keyof Dictionary["projects"]["items"];
  index: string;
  size: "feature" | "half" | "tall";
  offset?: boolean;
  live: string | null;
  github: string | null;
  caseStudy: boolean;
  tech: string[];
  images: string[];
}

export interface Site {
  person: { name: string; fullName: string; since: string; photo: string; photoCaption: string };
  social: {
    github: string;
    githubHandle: string;
    linkedin: string;
    linkedinHandle: string;
    email: string;
    whatsapp: string;
    whatsappDisplay: string;
  };
  cv: { href: string; status: string };
  location: { lat: number; lon: number };
  status: "open" | "busy" | "away";
  sections: SiteSection[];
  services: Service[];
  experience: Record<ExperienceGroup, ExperienceEntry[]>;
  skills: SkillFolder[];
  projects: Project[];
}

export const site = siteJson as Site;

/** Sections shown in the header navigation, in page order. */
export const navSections = site.sections.filter(
  (section): section is SiteSection & { id: Exclude<SectionId, "contato"> } => section.inNav !== false,
);

/** Label index of a section: "01"… */
export function sectionIndex(id: SectionId): string {
  const section = site.sections.find((s) => s.id === id);
  if (!section) throw new Error(`Section "${id}" is missing from site.json`);
  return section.index;
}
