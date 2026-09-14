"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, AlertCircle } from "lucide-react";
import { site } from "@/content/site";
import { createRipple } from "@/lib/ripple";
import { CONTACT_LIMITS, CONTACT_MESSAGE_MIN, emailError } from "@/lib/contact-limits";

type Status = "idle" | "submitting" | "success" | "error";

const GENERIC_ERROR =
  "Something went wrong sending your message. Please email me directly.";

const inputBase =
  "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-300 hover:border-[color:var(--primary)]/40 focus:border-[color:var(--primary)] focus:bg-[color:var(--muted)]/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--ring)_16%,transparent)] aria-[invalid=true]:border-red-500/70";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  /** Re-check the address and add or clear its message. */
  function checkEmail(value: string) {
    setErrors((prev) => {
      const problem = emailError(value);
      if (problem === (prev.email ?? null)) return prev;
      const next = { ...prev };
      if (problem) next.email = problem;
      else delete next.email;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const website = String(data.get("website") ?? "");

    const next: Record<string, string> = {};
    if (!name) next.name = "Please enter your name.";
    else if (name.length > CONTACT_LIMITS.name)
      next.name = `Please keep your name under ${CONTACT_LIMITS.name} characters.`;
    const emailProblem = emailError(email);
    if (emailProblem) next.email = emailProblem;
    if (!message || message.length < CONTACT_MESSAGE_MIN)
      next.message = `Tell me a little more (${CONTACT_MESSAGE_MIN}+ characters).`;
    else if (message.length > CONTACT_LIMITS.message)
      next.message = `Please keep it under ${CONTACT_LIMITS.message} characters.`;

    setErrors(next);
    // The request is never made while a field is invalid. Move the cursor to
    // the first problem so the reason is on screen and read out.
    const firstInvalid = ["name", "email", "message"].find((field) => next[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      if (!res.ok) {
        // The API returns a human-readable reason when it throttles a sender.
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus("error");
        setErrorMsg(payload?.error || GENERIC_ERROR);
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg(GENERIC_ERROR);
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full flex-col items-center justify-center rounded-4xl border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-10 text-center"
      >
        <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
          <Check className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold">Message sent!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out — I&apos;ll get back to you within a day. In
          the meantime, feel free to connect on LinkedIn.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--primary)]/50"
        >
          Send another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/*
        Honeypot. Positioned off-screen rather than display:none, which more
        bots know to skip, and hidden from assistive tech. A filled value is
        silently discarded server-side.
      */}
      <div aria-hidden className="absolute left-[-9999px] size-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-foreground/85"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            placeholder="Ada Lovelace"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputBase}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-foreground/85"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            onBlur={(e) => e.target.value.trim() && checkEmail(e.target.value)}
            onChange={(e) => errors.email && checkEmail(e.target.value)}
            className={inputBase}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-foreground/85"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          placeholder="Tell me about your project, role, or idea…"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputBase} resize-none`}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-xs text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            <AlertCircle className="size-4" />
            {errorMsg}{" "}
            <a href={site.socials.email} className="underline">
              {site.email}
            </a>
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === "submitting"}
        onPointerDown={createRipple}
        className="group relative mt-1 inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-glow transition-[transform,box-shadow] hover:shadow-glow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
