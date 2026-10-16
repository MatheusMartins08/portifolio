import { cache } from "react";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import i18n from "@/content/i18n.json";
import { isLocale, locales, type Locale } from "./config";

/** A leaf of i18n.json: the same text in every locale. */
type Leaf<T> = { [L in Locale]: T };

/** Replaces every {pt, en, es} leaf with the type of a single locale's value. */
export type Localized<T> = T extends Leaf<infer U>
  ? U
  : T extends object
    ? { [K in keyof T]: Localized<T[K]> }
    : T;

type RawDictionary = Omit<typeof i18n, "meta">;

/** The whole site text in one locale: `t.hero.greeting` is a string, `t.hero.phrases` a string[]. */
export type Dictionary = Localized<RawDictionary>;

function isLeaf(node: object): node is Leaf<unknown> {
  return !Array.isArray(node) && locales.every((l) => l in node);
}

function localize(node: unknown, lang: Locale): unknown {
  if (node === null || typeof node !== "object") return node;
  if (isLeaf(node)) return node[lang];
  if (Array.isArray(node)) return node.map((item) => localize(item, lang));
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, localize(value, lang)]),
  );
}

const raw = Object.fromEntries(
  Object.entries(i18n).filter(([key]) => key !== "meta"),
) as RawDictionary;

const dictionaries = Object.fromEntries(
  locales.map((lang) => [lang, localize(raw, lang) as Dictionary]),
) as Record<Locale, Dictionary>;

export function getDictionaryFor(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Locale of the current route, read from the root `[locale]` segment. 404 for unknown locales. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = await locale();
  if (!isLocale(value)) notFound();
  return value;
});

/** Dictionary of the current route's locale (Server Components only). */
export async function getDictionary(): Promise<Dictionary> {
  return getDictionaryFor(await getLocale());
}
