import { locales } from "@/lib/i18n/config";

/** sessionStorage key: set once the Hero intro has played, so it plays once per session. */
export const INTRO_KEY = "mf:intro";

/**
 * Runs in <head>, before the first paint: marks `<html data-intro="play">` so the page opens on black
 * and the Hero intro (components/hero/HeroIntro) can take over. Only on the home page itself (no hash:
 * a link to a section goes straight there), once per session, never with reduced motion. If the app
 * never hydrates, a failsafe lifts the black after 4s.
 */
export const introGateScript = `(function(){try{var d=document.documentElement;if(location.hash||!/^\\/(${locales.join("|")})\\/?$/.test(location.pathname))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("${INTRO_KEY}"))return;d.setAttribute("data-intro","play");setTimeout(function(){if(d.getAttribute("data-intro")==="play")d.removeAttribute("data-intro")},4000)}catch(e){}})()`;
