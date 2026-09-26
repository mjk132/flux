"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICES } from "@/config/services";

type FieldErrors = Partial<Record<"name" | "contact" | "serviceType" | "description", string>>;

const CONTACT_PATTERN = /^(@?[\w.]{2,32}|[^@\s]+@[^@\s]+\.[^@\s]+)$/;
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 2000;

const emptyForm = {
  name: "",
  contact: "",
  serviceType: "",
  description: "",
};

/** Mirrors serviceRequestCreateSchema from @/lib/validations, in Arabic. */
function validate(form: typeof emptyForm): FieldErrors {
  const errors: FieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "أدخل اسماً من حرفين على الأقل";
  }
  if (form.contact.trim().length < 3 || !CONTACT_PATTERN.test(form.contact.trim())) {
    errors.contact = "أدخل بريداً إلكترونياً أو اسم مستخدم ديسكورد";
  }
  if (!SERVICES.some((service) => service.slug === form.serviceType)) {
    errors.serviceType = "اختر نوع الخدمة";
  }
  const description = form.description.trim();
  if (description.length < DESCRIPTION_MIN) {
    errors.description = `الوصف يجب أن يكون ${DESCRIPTION_MIN} حرفاً على الأقل`;
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `الوصف طويل جداً (الحد الأقصى ${DESCRIPTION_MAX} حرف)`;
  }

  return errors;
}

const inputErrorClass =
  "border-danger focus:border-danger focus:ring-danger/30";

export function ServiceRequestForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedContact, setSubmittedContact] = useState("");

  const descriptionLength = form.description.trim().length;

  function handleChange(field: keyof typeof emptyForm, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    // After the first submit attempt, keep errors in sync while typing.
    if (Object.keys(errors).length > 0) {
      setErrors(validate(next));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          contact: form.contact.trim(),
          serviceType: form.serviceType,
          description: form.description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || "تعذّر إرسال الطلب، حاول مرة أخرى");
        setStatus("idle");
        return;
      }
      setSubmittedContact(form.contact.trim());
      setStatus("success");
    } catch {
      setFormError("تعذّر إرسال الطلب، تحقّق من اتصالك وحاول مرة أخرى");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-6 text-center"
      >
        <p className="text-lg font-extrabold text-white">تم استلام طلبك</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-text">
          سن التواصل معك عبر{" "}
          <span className="font-semibold text-purple-accent" dir="auto">
            {submittedContact}
          </span>{" "}
          التي أدخلتها.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input
            id="service-request-name"
            label="الاسم"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="اسمك أو اسم منشأتك"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "service-request-name-error" : undefined}
            className={errors.name ? inputErrorClass : undefined}
          />
          {errors.name && (
            <p
              id="service-request-name-error"
              role="alert"
              className="mt-1 text-xs text-danger"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Input
            id="service-request-contact"
            label="وسيلة التواصل"
            value={form.contact}
            onChange={(event) => handleChange("contact", event.target.value)}
            placeholder="you@email.com أو discord-username"
            dir="auto"
            autoComplete="email"
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? "service-request-contact-error" : undefined}
            className={errors.contact ? inputErrorClass : undefined}
          />
          {errors.contact && (
            <p
              id="service-request-contact-error"
              role="alert"
              className="mt-1 text-xs text-danger"
            >
              {errors.contact}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="service-request-type"
          className="mb-1.5 block text-sm font-medium text-gray-text"
        >
          نوع الخدمة
        </label>
        <Select
          value={form.serviceType}
          onValueChange={(value) => handleChange("serviceType", value)}
        >
          <SelectTrigger
            id="service-request-type"
            aria-invalid={errors.serviceType ? true : undefined}
            aria-describedby={
              errors.serviceType ? "service-request-type-error" : undefined
            }
            className={errors.serviceType ? inputErrorClass : undefined}
          >
            <SelectValue placeholder="اختر نوع الخدمة" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((service) => (
              <SelectItem key={service.slug} value={service.slug}>
                {service.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p
            id="service-request-type-error"
            role="alert"
            className="mt-1 text-xs text-danger"
          >
            {errors.serviceType}
          </p>
        )}
      </div>

      <div>
        <Textarea
          id="service-request-description"
          label="تفاصيل الطلب"
          rows={5}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          placeholder="اشرح ما تحتاجه بالتفصيل: فكرة المشروع، الميزات المطلوبة، وأي مراجع لديك"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description
              ? "service-request-description-error service-request-description-hint"
              : "service-request-description-hint"
          }
          className={errors.description ? inputErrorClass : undefined}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <p id="service-request-description-hint" className="text-xs text-gray-muted">
            الحد الأدنى {DESCRIPTION_MIN} حرفاً
          </p>
          <p className="text-xs text-gray-muted" aria-hidden="true">
            {descriptionLength} / {DESCRIPTION_MAX}
          </p>
        </div>
        {errors.description && (
          <p
            id="service-request-description-error"
            role="alert"
            className="mt-1 text-xs text-danger"
          >
            {errors.description}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" loading={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
