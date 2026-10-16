import tokens from "@/app/styles/tokens.json";

type ColorName = (typeof tokens.color.tokens)[number]["name"];

/**
 * A colour token's value from tokens.json, for places that cannot read CSS custom properties
 * (generated images: Open Graph, app icons). Resolves "{ink}"-style references.
 */
export function colorToken(name: ColorName): string {
  const token = tokens.color.tokens.find((entry) => entry.name === name);
  if (!token) throw new Error(`Unknown colour token "${name}"`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? colorToken(reference[1] as ColorName) : token.value;
}
