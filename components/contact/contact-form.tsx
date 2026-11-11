"use client";

import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextAreaField, TextField, focusFirstInvalid } from "@/components/forms/field";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useContact } from "@/components/providers/contact-provider";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { contactSchema, formDataToObject, toFieldErrors, type ContactInput, type FieldErrors } from "@/lib/validation";
import { whatsappUrl } from "@/lib/whatsapp";

function buildMessage(data: ContactInput): string {
  const lines = [
    `Hello ${site.name}, I'm sending a message from your website's contact form.`,
    "",
    `*Name:* ${data.name}`,
    `*Email:* ${data.email}`,
  ];
  if (data.phone) lines.push(`*Phone:* ${data.phone}`);
  lines.push(`*Subject:* ${data.subject}`, "", "*Message:*", data.message);
  return lines.join("\n");
}

export function ContactForm() {
  const contact = useContact();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSentUrl(null);
    const parsed = contactSchema.safeParse(formDataToObject(new FormData(form)));
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      window.setTimeout(() => focusFirstInvalid(form), 0);
      return;
    }
    setErrors({});
    const url = whatsappUrl(contact.whatsapp, buildMessage(parsed.data));
    // Open synchronously inside the submit handler so popup blockers allow it.
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
  };

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

      {sentUrl ? (
        <FormAlert title="Your message is ready in WhatsApp">
          Press send in WhatsApp to deliver it to us. If WhatsApp didn&apos;t open,{" "}
          <a
            href={sentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-whatsapp underline-offset-4 hover:underline"
          >
            open it here
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </FormAlert>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <WhatsAppIcon className="size-4" />
        Send via WhatsApp
      </Button>
    </form>
  );
}
