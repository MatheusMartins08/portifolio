"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./Field.module.css";

interface FieldOwnProps {
  label: string;
  /** Error message (i18n): turns the line danger, with an icon. */
  error?: string;
  hint?: string;
  className?: string;
}

type InputFieldProps = FieldOwnProps & { multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;
type TextareaFieldProps = FieldOwnProps & { multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

/**
 * Editorial form field: mono label above, only the baseline as border. Hover darkens the line; focus
 * draws a white bar and lights the label; errors use danger with an icon and a message.
 */
export function Field(props: InputFieldProps | TextareaFieldProps) {
  const autoId = useId();
  const { label, error, hint, className, multiline, id = autoId, ...rest } = props;
  const errorId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const control = {
    id,
    className: styles.input,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className={cx(styles.field, error && styles.error, rest.disabled && styles.disabled, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea rows={4} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} {...control} />
      ) : (
        <input {...(rest as InputHTMLAttributes<HTMLInputElement>)} {...control} />
      )}
      <span className={styles.bar} aria-hidden="true" />
      {error ? (
        <p className={styles.msg} id={errorId}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
