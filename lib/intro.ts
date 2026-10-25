import { locales } from "@/lib/i18n/config";

/**
 * sessionStorage key: "1" while the Hero is on screen, "0" once the visitor has scrolled past it
 * (HeroIntro keeps it up to date). Read on a reload, to tell "reloading the Hero" from "reloading
 * another section".
 */
export const ON_HERO_KEY = "mf:on-hero";

/**
 * Runs in <head>, before the first paint: marks `<html data-intro="play">` so the page opens on black
 * and the Hero intro (components/hero/HeroIntro) can take over. On the home page, every time the site
 * is opened or reloaded on the Hero; not when it is reloaded (or returned to) while another section
 * was on screen — that just reloads, keeping the place — nor when a link opens it on a section (hash),
 * nor with reduced motion.
 * While the intro plays, the browser must not restore a scroll position (the intro starts at the top,
 * so a hash left in the address is dropped too); HeroIntro gives scroll restoration back at the end.
 * If the app never hydrates, a failsafe lifts the black after 4s.
 */
export const introGateScript = `(function(){try{var d=document.documentElement,h=history;if(!/^\\/(${locales.join("|")})\\/?$/.test(location.pathname))return;var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0],again=!!n&&(n.type==="reload"||n.type==="back_forward");h.scrollRestoration="auto";if(again?sessionStorage.getItem("${ON_HERO_KEY}")==="0":!!location.hash)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;h.scrollRestoration="manual";if(location.hash)h.replaceState(h.state,"",location.pathname+location.search);d.setAttribute("data-intro","play");setTimeout(function(){if(d.getAttribute("data-intro")==="play"){d.removeAttribute("data-intro");h.scrollRestoration="auto"}},4000)}catch(e){}})()`;
