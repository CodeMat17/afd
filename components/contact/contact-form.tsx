"use client";

import { Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextAreaField, TextField, focusFirstInvalid } from "@/components/forms/field";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { contactService, type ServiceResult } from "@/lib/services";
import { site } from "@/lib/site";
import { contactSchema, formDataToObject, toFieldErrors, type ContactInput, type FieldErrors } from "@/lib/validation";
import { whatsappUrl } from "@/lib/whatsapp";

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<{ result: ServiceResult; data: ContactInput } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setOutcome(null);
    const parsed = contactSchema.safeParse(formDataToObject(new FormData(form)));
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      window.setTimeout(() => focusFirstInvalid(form), 0);
      return;
    }
    setErrors({});
    setPending(true);
    const result = await contactService.sendMessage(parsed.data);
    setPending(false);
    setOutcome({ result, data: parsed.data });
  };

  const fallbackBody = outcome
    ? `${outcome.data.message}\n\n— ${outcome.data.name}${outcome.data.phone ? `, ${outcome.data.phone}` : ""}`
    : "";

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="name" label="Name" autoComplete="name" error={errors.name} />
        <TextField id="email" type="email" label="Email" autoComplete="email" error={errors.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="phone" type="tel" label="Phone" optional autoComplete="tel" error={errors.phone} />
        <TextField id="subject" label="Subject" error={errors.subject} />
      </div>
      <TextAreaField id="message" label="Message" error={errors.message} />

      {outcome && !outcome.result.ok ? (
        <FormAlert title="The contact form isn't connected yet">
          Your message hasn&apos;t been sent. You can send the same message directly instead:
          <span className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(outcome.data.subject)}&body=${encodeURIComponent(fallbackBody)}`}
              className="inline-flex min-h-10 items-center gap-2 font-semibold text-foreground"
            >
              <Mail className="size-4" aria-hidden="true" /> Open in your email app
            </a>
            <a
              href={whatsappUrl(`${outcome.data.subject}\n\n${fallbackBody}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 font-semibold text-whatsapp"
            >
              <WhatsAppIcon className="size-4" /> Send on WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </span>
        </FormAlert>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
