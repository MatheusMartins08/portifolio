import type * as React from 'react';

export type IconName = 'arrow-up-right' | 'arrow-down' | 'arrow-up' | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'plus' | 'close' | 'check' | 'globe' | 'mail' | 'chat' | 'code' | 'pin' | 'folder' | 'terminal' | 'file' | 'alert' | 'menu' | 'link' | 'user';

/** Thin 1.5px stroke icon on a 24px grid; inherits currentColor. */
export interface IconProps { name: IconName; size?: number; strokeWidth?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

/** Renders <a> when href is set, else <button>. Arrow icons slide through on hover. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'solid' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  loading?: boolean;
}
export declare function Button(props: ButtonProps): React.ReactElement;

/** Inline text link with an arrow; underline draws in terracota on hover. External http(s) links open in a new tab. */
export interface ArrowLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: IconName | null;
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
  newTabLabel?: string;
}
export declare function ArrowLink(props: ArrowLinkProps): React.ReactElement;

/** Mono section label: "01 / SOBRE". */
export interface SectionLabelProps { index?: string; children: React.ReactNode; rule?: boolean; as?: keyof JSX.IntrinsicElements; id?: string; className?: string }
export declare function SectionLabel(props: SectionLabelProps): React.ReactElement;

export interface StatusDotProps { tone?: 'open' | 'busy' | 'away'; children?: React.ReactNode; className?: string }
export declare function StatusDot(props: StatusDotProps): React.ReactElement;

export interface TagProps { tone?: 'default' | 'accent' | 'quiet'; children: React.ReactNode; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;

export interface LanguageOption { code: string; label: string }
export interface LanguageSwitchProps { value?: string; defaultValue?: string; onChange?: (code: string) => void; options?: LanguageOption[]; label?: string; className?: string }
export declare function LanguageSwitch(props: LanguageSwitchProps): React.ReactElement;

export interface NavItem { id: string; label: string }
export interface HeaderProps {
  items?: NavItem[];
  /** id of the section in view (see MF.useScrollSpy). */
  active?: string;
  lang?: string;
  defaultLang?: string;
  onLangChange?: (code: string) => void;
  languages?: LanguageOption[];
  cvHref?: string;
  cvLabel?: string;
  onNavigate?: (id: string) => void;
  /** default true: position fixed. */
  fixed?: boolean;
  navLabel?: string; menuLabel?: string; closeLabel?: string; langLabel?: string;
  className?: string;
}
export declare function Header(props: HeaderProps): React.ReactElement;
/** Returns the id of the last section whose top passed `offset` px (default 140). */
export declare function useScrollSpy(ids: string[], offset?: number): string;

export interface PortraitProps { src?: string; alt?: string; caption?: string | false; meta?: string; placeholder?: string; className?: string }
export declare function Portrait(props: PortraitProps): React.ReactElement;

/** Letters that two phrases share travel to their new places; the rest blur out / in. */
export interface MorphTextProps { phrases?: string[]; interval?: number; caret?: boolean; as?: keyof JSX.IntrinsicElements; className?: string }
export declare function MorphText(props: MorphTextProps): React.ReactElement;

export interface ScrollCueProps { target?: string | Element; label?: string; ariaLabel?: string; onClick?: () => void; className?: string }
export declare function ScrollCue(props: ScrollCueProps): React.ReactElement;

export interface HeroProps {
  name?: string; greeting?: string; phrases?: string[]; interval?: number;
  photo?: string; photoAlt?: string; photoCaption?: string | false; photoMeta?: string;
  links?: { label: string; href: string }[];
  metaLeft?: string; metaMid?: string; metaRight?: string;
  /** selector for the ScrollCue; null hides it. */
  scrollTarget?: string | null;
  fullHeight?: boolean; id?: string; className?: string;
}
export declare function Hero(props: HeroProps): React.ReactElement;

export interface StatementProps { children: string; label?: string; index?: string; highlight?: string | string[]; note?: React.ReactNode; placeholder?: boolean; as?: keyof JSX.IntrinsicElements; className?: string }
export declare function Statement(props: StatementProps): React.ReactElement;

export interface RevealProps { variant?: 'up' | 'fade' | 'blur' | 'clip' | 'line'; delay?: number; threshold?: number; as?: keyof JSX.IntrinsicElements; style?: React.CSSProperties; className?: string; children?: React.ReactNode }
export declare function Reveal(props: RevealProps): React.ReactElement;

export interface ProfileEntry { key: string; value: string | string[]; flow?: boolean; accent?: boolean }
export interface ProfileTerminalProps {
  /** frontmatter lines above the text (or the whole body when text is empty). */
  entries?: ProfileEntry[];
  /** the About text shown in full, one paragraph per item (or one string, paragraphs split on line breaks). Defaults to MF.defaults.about; pass [] for key/value mode. */
  text?: string | string[];
  /** exact phrases painted terracota-ink; defaults to MF.defaults.aboutHighlight. */
  highlight?: string[];
  command?: string; title?: string; path?: string; prompt?: string; status?: string; tilt?: boolean; maxTilt?: number; className?: string }
export declare function ProfileTerminal(props: ProfileTerminalProps): React.ReactElement;

export interface InfoCardProps { label: React.ReactNode; aside?: React.ReactNode; footer?: React.ReactNode; tone?: 'paper' | 'sand' | 'deep' | 'ink'; as?: keyof JSX.IntrinsicElements; style?: React.CSSProperties; className?: string; children?: React.ReactNode }
export declare function InfoCard(props: InfoCardProps): React.ReactElement;

export interface CoordinatesProps { lat?: number; lon?: number; className?: string }
export declare function Coordinates(props: CoordinatesProps): React.ReactElement;

export interface ServiceCardProps { index?: string; label?: string; title: string; description?: string; highlights?: string[]; motif?: 'web' | 'ai' | React.ReactNode; size?: 'lg' | 'md'; className?: string }
export declare function ServiceCard(props: ServiceCardProps): React.ReactElement;

export interface FilterOption { id: string; label: string; count?: number }
export interface FilterTabsProps { options: FilterOption[]; value?: string; defaultValue?: string; onChange?: (id: string) => void; label?: string; panelId?: string; idPrefix?: string; className?: string }
export declare function FilterTabs(props: FilterTabsProps): React.ReactElement;

export interface TimelineEntry {
  id?: string; title: string; org?: string; kind?: string; period?: string; place?: string;
  summary?: string; details?: string[]; tags?: string[];
  current?: boolean; currentLabel?: string;
  /** a not-yet-started chapter: dashed, faded. */
  future?: boolean; kicker?: string;
}
export interface TimelineProps { items: TimelineEntry[]; startSide?: 'left' | 'right'; trigger?: number; moreLabel?: string; lessLabel?: string; className?: string }
export declare function Timeline(props: TimelineProps): React.ReactElement;

export interface SkillItem { name: string; ext?: string; category?: string; glyph?: string }
export interface SkillFolderProps { title: string; index?: string; items: SkillItem[]; defaultOpen?: boolean; cols?: number; unit?: string; className?: string }
export declare function SkillFolder(props: SkillFolderProps): React.ReactElement;

export interface ProjectCardProps {
  title: string; index?: string; category?: string; year?: string; description?: string; tech?: string[];
  image?: string;
  /** up to two screenshots: the first shows at rest, the second fades in on hover. */
  images?: string[];
  placeholder?: string;
  liveLabel?: string;
  href?: string; github?: string; live?: string;
  size?: 'feature' | 'half' | 'tall'; caseLabel?: string; cursorLabel?: string; className?: string;
}
export declare function ProjectCard(props: ProjectCardProps): React.ReactElement;

export interface CaseHeroProps {
  title: string; summary?: string; index?: string; category?: string;
  back?: { label: string; href: string };
  meta?: { label: string; value: React.ReactNode }[];
  links?: { label: string; href: string; primary?: boolean }[];
  image?: string; imageAlt?: string; className?: string;
}
export declare function CaseHero(props: CaseHeroProps): React.ReactElement;

export interface CaseSectionProps { index?: string; label: string; title?: string; id?: string; className?: string; children?: React.ReactNode }
export declare function CaseSection(props: CaseSectionProps): React.ReactElement;

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; multiline?: boolean; rows?: number; error?: string; hint?: string; optional?: boolean }
export declare function Field(props: FieldProps): React.ReactElement;

export interface ContactItem { label: string; value: string; href: string; icon?: IconName }
export interface ContactModalProps {
  open?: boolean; onClose?: () => void;
  /** render the panel in place, without scrim (previews, a /contato page). */
  inline?: boolean;
  contacts?: ContactItem[];
  /** return a Promise; resolve → success state, reject → error state. */
  onSubmit?: (data: { name: string; email: string; message: string }) => Promise<unknown>;
  /** force a state for design review. */
  status?: 'idle' | 'loading' | 'success' | 'error';
  title?: string; intro?: string; kicker?: string; index?: string; closeLabel?: string;
  labels?: Partial<Record<'name' | 'email' | 'message' | 'send' | 'sending' | 'okTitle' | 'okBody' | 'again' | 'errBody' | 'reqName' | 'reqEmail' | 'reqMsg', string>>;
  defaults?: { name?: string; email?: string; message?: string };
  className?: string;
}
export declare function ContactModal(props: ContactModalProps): React.ReactElement | null;

export interface FooterProps { name?: string; role?: string; links?: { label: string; href: string }[]; year?: number | string; className?: string }
export declare function Footer(props: FooterProps): React.ReactElement;

declare global {
  interface Window {
    MF: {
      Icon: typeof Icon; Button: typeof Button; ArrowLink: typeof ArrowLink; SectionLabel: typeof SectionLabel; StatusDot: typeof StatusDot; Tag: typeof Tag;
      LanguageSwitch: typeof LanguageSwitch; Header: typeof Header; Portrait: typeof Portrait; MorphText: typeof MorphText; ScrollCue: typeof ScrollCue; Hero: typeof Hero;
      Statement: typeof Statement; Reveal: typeof Reveal; ProfileTerminal: typeof ProfileTerminal; InfoCard: typeof InfoCard; Coordinates: typeof Coordinates;
      ServiceCard: typeof ServiceCard; FilterTabs: typeof FilterTabs; Timeline: typeof Timeline; SkillFolder: typeof SkillFolder; ProjectCard: typeof ProjectCard;
      CaseHero: typeof CaseHero; CaseSection: typeof CaseSection; Field: typeof Field; ContactModal: typeof ContactModal; Footer: typeof Footer;
      useScrollSpy: typeof useScrollSpy;
    };
  }
}
