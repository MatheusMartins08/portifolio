"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { submitContact } from "@/lib/contact/submitContact";
import { ContactModal, type ContactModalCopy } from "./ContactModal";

interface ContactLauncherProps {
  cta: string;
  modal: ContactModalCopy;
}

/** The section's CTA ("Let's talk") and the contact dialog it opens. */
export function ContactLauncher({ cta, modal }: ContactLauncherProps) {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const timer = useRef<number | undefined>(undefined);

  const close = useCallback(() => {
    setState((current) => (current === "open" ? "closing" : current));
    window.clearTimeout(timer.current);
    // Lets the exit animation play before unmounting (none with reduced motion).
    timer.current = window.setTimeout(() => setState("closed"), prefersReducedMotion() ? 0 : 200);
  }, []);

  function open() {
    window.clearTimeout(timer.current);
    setState("open");
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <Button variant="primary" size="lg" icon="arrow-up-right" onClick={open} aria-haspopup="dialog">
        {cta}
      </Button>
      {state === "closed" ? null : <ContactModal {...modal} state={state} onClose={close} onSubmit={submitContact} />}
    </>
  );
}
