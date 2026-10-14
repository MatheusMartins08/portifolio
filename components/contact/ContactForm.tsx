"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ContactMessage } from "@/lib/contact/submitContact";
import { Field } from "./Field";
import styles from "./ContactModal.module.css";

export interface ContactFormLabels {
  name: string;
  email: string;
  message: string;
  send: string;
  sending: string;
  okTitle: string;
  okBody: string;
  again: string;
  errBody: string;
  reqName: string;
  reqEmail: string;
  reqMsg: string;
}

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<keyof ContactMessage, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactFormProps {
  labels: ContactFormLabels;
  onSubmit: (message: ContactMessage) => Promise<void>;
}

/** Name, email and message with inline validation; loading, success and error states. */
export function ContactForm({ labels, onSubmit }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const doneRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const previousStatus = useRef<Status>("idle");

  // Keep keyboard focus inside the dialog when the content swaps: success → the confirmation,
  // "send another" → the first field.
  useEffect(() => {
    if (status === "success") doneRef.current?.focus();
    if (status === "idle" && previousStatus.current === "success") {
      (formRef.current?.elements.namedItem("name") as HTMLElement | null)?.focus();
    }
    previousStatus.current = status;
  }, [status]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const form = event.currentTarget;
    const read = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? "";
    const data: ContactMessage = { name: read("name"), email: read("email"), message: read("message") };

    const found: Errors = {};
    if (!data.name) found.name = labels.reqName;
    if (!EMAIL.test(data.email)) found.email = labels.reqEmail;
    if (data.message.length < 2) found.message = labels.reqMsg;
    setErrors(found);
    const firstInvalid = (["name", "email", "message"] as const).find((key) => found[key]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("loading");
    onSubmit(data).then(
      () => setStatus("success"),
      () => setStatus("error"),
    );
  }

  if (status === "success") {
    return (
      <div className={styles.done} role="status" tabIndex={-1} ref={doneRef}>
        <span className={styles.check} aria-hidden="true">
          <Icon name="check" size={20} />
        </span>
        <p className={styles.doneTitle}>{labels.okTitle}</p>
        <p className={styles.doneBody}>{labels.okBody}</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
          {labels.again}
        </Button>
      </div>
    );
  }

  const loading = status === "loading";
  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={submit}>
      <Field label={labels.name} name="name" autoComplete="name" error={errors.name} />
      <Field label={labels.email} name="email" type="email" autoComplete="email" error={errors.email} />
      <Field label={labels.message} name="message" multiline rows={4} error={errors.message} />
      {status === "error" ? (
        <p className={styles.err} role="alert">
          <Icon name="alert" size={16} />
          {labels.errBody}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button type="submit" variant="primary" icon="arrow-right" loading={loading}>
          {loading ? labels.sending : labels.send}
        </Button>
      </div>
    </form>
  );
}
