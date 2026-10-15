import { useState } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Set these in a `.env` file (see `.env.example`) with your own EmailJS
// service, template and public key. See: https://www.emailjs.com/docs/
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const [status, setStatus] = useState(null); // "success" | "error" | null

  const onSubmit = async (data) => {
    setStatus(null);
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        // EmailJS isn't configured yet — surface this clearly instead of failing silently.
        throw new Error("EmailJS is not configured yet.");
      }
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      setStatus("success");
      reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-ink-600 bg-ink-900 light:bg-paper-100 light:border-paper-300 px-4 py-3 text-paper-100 light:text-ink-900 placeholder:text-paper-300/50 focus:border-teal-400 outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block font-mono text-xs text-paper-300 light:text-ink-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClasses}
            {...register("name", { required: "Please enter your name." })}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block font-mono text-xs text-paper-300 light:text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClasses}
            {...register("email", {
              required: "Please enter your email.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
            })}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block font-mono text-xs text-paper-300 light:text-ink-700">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          aria-invalid={!!errors.subject}
          className={inputClasses}
          {...register("subject", { required: "Please add a subject." })}
        />
        {errors.subject && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block font-mono text-xs text-paper-300 light:text-ink-700">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          className={inputClasses}
          {...register("message", { required: "Please add a message." })}
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-mono text-sm font-medium text-ink-950 transition-colors hover:bg-amber-500 disabled:opacity-60"
      >
        <FiSend aria-hidden="true" />
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>

      <div aria-live="polite">
        {status === "success" && (
          <p className="flex items-center gap-2 text-sm text-teal-400">
            <FiCheckCircle /> Thanks — your message is on its way. I'll reply soon.
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <FiAlertCircle /> EmailJS isn't connected yet. Add your service, template, and public key in
            <code className="ml-1 font-mono">ContactForm.jsx</code>.
          </p>
        )}
      </div>
    </form>
  );
}
