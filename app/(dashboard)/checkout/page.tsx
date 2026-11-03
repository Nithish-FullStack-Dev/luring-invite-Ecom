"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Form = Record<
  | "fullName"
  | "email"
  | "primaryPhone"
  | "alternatePhone"
  | "address"
  | "city"
  | "state"
  | "country"
  | "postalCode"
  | "companyName",
  string
>;

type FormErrors = Partial<Record<keyof Form, string>>;

const initial: Form = {
  fullName: "",
  email: "",
  primaryPhone: "",
  alternatePhone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  companyName: "",
};

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

const NAME_REGEX = /^[a-zA-Z]+(?:[ .'-][a-zA-Z]+)*$/;

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const INDIAN_PIN_REGEX = /^[1-9]\d{5}$/;

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  "Germany",
  "France",
  "Ireland",
  "New Zealand",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
  "Saudi Arabia",
  "Qatar",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Thailand",
  "Sri Lanka",
  "Nepal",
  "Bangladesh",
  "Pakistan",
];

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

function validatePhone(value: string, required: boolean): string {
  if (!value && !required) return "";

  if (!value) return "Mobile number is required.";

  if (!INDIAN_PHONE_REGEX.test(value)) {
    return "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
  }

  return "";
}

function validateField(key: keyof Form, value: string, form: Form): string {
  const trimmed = value.trim();

  switch (key) {
    case "fullName":
      if (!trimmed) return "Full name is required.";
      if (trimmed.length < 2) return "Name must contain at least 2 characters.";
      if (trimmed.length > 100) return "Name cannot exceed 100 characters.";
      if (!NAME_REGEX.test(trimmed)) {
        return "Enter a valid name. Numbers and special characters are not allowed.";
      }
      return "";

    case "email":
      if (!trimmed) return "Email address is required.";
      if (trimmed.length > 254) return "Email address is too long.";
      if (!EMAIL_REGEX.test(trimmed)) {
        return "Enter a valid email address (example: name@example.com).";
      }
      return "";

    case "primaryPhone":
      return validatePhone(value, true);

    case "alternatePhone":
      return validatePhone(value, false);

    case "address":
      if (!trimmed) return "Full address is required.";
      if (trimmed.length < 5) return "Please enter a complete address.";
      if (trimmed.length > 300) return "Address cannot exceed 300 characters.";
      return "";

    case "city":
      if (!trimmed) return "City is required.";
      if (trimmed.length < 2) return "City must contain at least 2 characters.";
      if (trimmed.length > 100) return "City cannot exceed 100 characters.";
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        return "City can only contain letters, spaces, dots, and hyphens.";
      }
      return "";

    case "state":
      if (!trimmed) return "State is required.";
      if (trimmed.length < 2)
        return "State must contain at least 2 characters.";
      if (trimmed.length > 100) return "State cannot exceed 100 characters.";
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        return "State can only contain letters, spaces, dots, and hyphens.";
      }
      return "";

    case "country":
      if (!trimmed) return "Country is required.";
      if (!COUNTRIES.includes(trimmed)) {
        return "Please select a valid country from the list.";
      }
      return "";

    case "postalCode":
      if (!trimmed) return "PIN / postal code is required.";

      if (form.country === "India") {
        if (!INDIAN_PIN_REGEX.test(trimmed)) {
          return "Enter a valid 6-digit Indian PIN code.";
        }
      } else {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9\s-]{1,11}$/.test(trimmed)) {
          return "Enter a valid postal code (2–12 characters).";
        }
      }
      return "";

    case "companyName":
      if (trimmed.length > 120) {
        return "Company name cannot exceed 120 characters.";
      }
      if (trimmed && !/^[a-zA-Z0-9\s&.,'()/-]+$/.test(trimmed)) {
        return "Enter a valid company name.";
      }
      return "";

    default:
      return "";
  }
}

export default function CheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();

  const videoJobId = search.get("videoJobId") || "";

  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>(
    {},
  );
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trackingReady, setTrackingReady] = useState(false);

  useEffect(() => {
    fetch("/api/cart/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user?.email) {
          setForm((previous) => ({
            ...previous,
            email: data.user.email,
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  function set(key: keyof Form, value: string) {
    setForm((previous) => {
      const updated = { ...previous, [key]: value };

      if (touched[key]) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          [key]: validateField(key, value, updated),
        }));
      }

      if (key === "country") {
        setErrors((previousErrors) => ({
          ...previousErrors,
          postalCode: validateField("postalCode", updated.postalCode, updated),
        }));
      }

      return updated;
    });
  }

  function handleBlur(key: keyof Form) {
    setTouched((previous) => ({
      ...previous,
      [key]: true,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: validateField(key, form[key], form),
    }));
  }

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    (Object.keys(form) as (keyof Form)[]).forEach((key) => {
      nextErrors[key] = validateField(key, form[key], form);
    });

    setErrors(nextErrors);

    setTouched(
      Object.fromEntries(
        Object.keys(form).map((key) => [key, true]),
      ) as Partial<Record<keyof Form, boolean>>,
    );

    return Object.values(nextErrors).every((message) => !message);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (!videoJobId) {
      setError(
        "Your customized video reference is missing. Return to the editor and try again.",
      );
      return;
    }

    if (!validateForm()) {
      setError("Please correct the highlighted fields before continuing.");
      return;
    }

    if (!terms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          primaryPhone: form.primaryPhone,
          alternatePhone: form.alternatePhone,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          postalCode: form.postalCode.trim(),
          companyName: form.companyName.trim(),
          videoJobId,
          termsAccepted: terms,
        }),
      });

      const payment = await response.json();

      if (!response.ok) {
        throw new Error(payment.message || "Unable to start payment.");
      }

      if (!payment.keyId || !(await loadRazorpay()) || !window.Razorpay) {
        throw new Error(
          "Secure payment checkout could not be loaded. Please retry.",
        );
      }

      const razorpay = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Luring Invite",
        description: "Personalized invitation video",
        order_id: payment.razorpayOrderId,

        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim(),
          contact: `+91${form.primaryPhone}`,
        },

        theme: { color: "#985cc0" },

        handler: async (answer: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verified = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: payment.orderId,
                razorpayOrderId: answer.razorpay_order_id,
                razorpayPaymentId: answer.razorpay_payment_id,
                razorpaySignature: answer.razorpay_signature,
              }),
            });

            const result = await verified.json();

            if (!verified.ok) {
              setError(
                result.message ||
                  "Payment is pending verification. Please contact support with your payment ID.",
              );
              setBusy(false);
              return;
            }

            const query = new URLSearchParams({
              order: result.orderNumber,
              download: "1",
            });

            if (result.videoJobId) {
              query.set("videoJobId", result.videoJobId);
            }

            router.push(`/checkout/success?${query.toString()}`);
          } catch {
            setError("Unable to verify payment. Please contact support.");
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => setBusy(false),
        },
      });

      razorpay.open();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to start payment.",
      );
      setBusy(false);
    }
  }

  // Create or resume checkout tracking when the page opens.
  useEffect(() => {
    let active = true;

    async function startTracking() {
      try {
        const response = await fetch("/api/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({ videoJobId }),
        });

        if (!response.ok) {
          throw new Error("Unable to start checkout tracking.");
        }

        if (active) {
          setTrackingReady(true);
        }
      } catch (error) {
        console.error("Checkout tracking initialization failed:", error);
      }
    }

    if (videoJobId) {
      void startTracking();
    }

    return () => {
      active = false;
      setTrackingReady(false);
    };
  }, [videoJobId]);

  // Update customer information and activity after typing pauses.
  useEffect(() => {
    if (!trackingReady || !videoJobId) return;

    const timeout = window.setTimeout(() => {
      void fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          videoJobId,
          email: form.email,
        }),
      }).catch((error) => {
        console.error("Checkout activity update failed:", error);
      });
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [form, videoJobId, trackingReady]);

  const fields: {
    key: keyof Form;
    label: string;
    required?: boolean;
    type?: string;
    maxLength?: number;
    autoComplete?: string;
  }[] = [
    {
      key: "fullName",
      label: "Full name",
      required: true,
      maxLength: 100,
      autoComplete: "name",
    },
    {
      key: "email",
      label: "Email address",
      required: true,
      type: "email",
      maxLength: 254,
      autoComplete: "email",
    },
    {
      key: "primaryPhone",
      label: "Primary contact number",
      required: true,
      type: "tel",
      maxLength: 10,
      autoComplete: "tel-national",
    },
    {
      key: "alternatePhone",
      label: "Alternate phone",
      type: "tel",
      maxLength: 10,
      autoComplete: "tel-national",
    },
    {
      key: "companyName",
      label: "Company name",
      maxLength: 120,
      autoComplete: "organization",
    },
    {
      key: "city",
      label: "City",
      required: true,
      maxLength: 100,
      autoComplete: "address-level2",
    },
    {
      key: "state",
      label: "State",
      required: true,
      maxLength: 100,
      autoComplete: "address-level1",
    },
    {
      key: "country",
      label: "Country",
      required: true,
      autoComplete: "country-name",
    },
    {
      key: "postalCode",
      label: "PIN / postal code",
      required: true,
      maxLength: form.country === "India" ? 6 : 12,
      autoComplete: "postal-code",
    },
  ];

  const inputClass = (key: keyof Form) =>
    `mt-1.5 h-11 w-full rounded-xl border px-3 text-sm text-gray-900 outline-none transition focus:ring-2 ${
      touched[key] && errors[key]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-[#a86dcd] focus:ring-purple-100"
    }`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fcf9fd] px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/templates"
            className="text-sm font-medium text-[#9259b7]"
          >
            ← Continue browsing
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={submit}
              noValidate
              className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-8"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                Secure checkout
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Your payment is processed securely by Razorpay.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map(
                  ({ key, label, required, type, maxLength, autoComplete }) => (
                    <label
                      key={key}
                      className="text-sm font-medium text-gray-700"
                    >
                      {label}
                      {required && <span className="text-red-500"> *</span>}

                      {key === "country" ? (
                        <select
                          required
                          value={form.country}
                          onChange={(event) => {
                            set("country", event.target.value);
                          }}
                          onBlur={() => handleBlur("country")}
                          className={inputClass(key)}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          required={required}
                          type={type || "text"}
                          maxLength={maxLength}
                          autoComplete={autoComplete}
                          inputMode={
                            key === "primaryPhone" ||
                            key === "alternatePhone" ||
                            (key === "postalCode" && form.country === "India")
                              ? "numeric"
                              : undefined
                          }
                          value={form[key]}
                          onChange={(event) => {
                            let value = event.target.value;

                            if (
                              key === "primaryPhone" ||
                              key === "alternatePhone"
                            ) {
                              value = sanitizePhone(value);
                            }

                            if (
                              key === "postalCode" &&
                              form.country === "India"
                            ) {
                              value = value.replace(/\D/g, "").slice(0, 6);
                            }

                            set(key, value);
                          }}
                          onBlur={() => handleBlur(key)}
                          className={inputClass(key)}
                        />
                      )}

                      {touched[key] && errors[key] && (
                        <span
                          role="alert"
                          className="mt-1 block text-xs font-normal text-red-600"
                        >
                          {errors[key]}
                        </span>
                      )}
                    </label>
                  ),
                )}

                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Full address
                  <span className="text-red-500"> *</span>
                  <textarea
                    required
                    maxLength={300}
                    value={form.address}
                    onChange={(event) => set("address", event.target.value)}
                    onBlur={() => handleBlur("address")}
                    className={`mt-1.5 min-h-24 w-full rounded-xl border p-3 text-sm outline-none transition focus:ring-2 ${
                      touched.address && errors.address
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-[#a86dcd] focus:ring-purple-100"
                    }`}
                  />
                  {touched.address && errors.address && (
                    <span
                      role="alert"
                      className="mt-1 block text-xs font-normal text-red-600"
                    >
                      {errors.address}
                    </span>
                  )}
                </label>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm text-gray-600">
                <input
                  required
                  type="checkbox"
                  checked={terms}
                  onChange={(event) => setTerms(event.target.checked)}
                  className="mt-0.5 size-4 accent-[#985cc0]"
                />

                <span>I accept the Terms of Service and Privacy Policy.</span>
              </label>

              <button
                type="submit"
                disabled={busy || !videoJobId}
                className="mt-6 w-full rounded-xl bg-[#985cc0] px-5 py-3.5 font-semibold text-white shadow-lg shadow-purple-100 transition hover:bg-[#8548ad] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy
                  ? "Opening secure payment…"
                  : "Pay securely with Razorpay"}
              </button>
            </form>

            <aside className="h-fit rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">Order summary</h2>

              <div className="mt-4 border-y border-dashed py-4 text-sm text-gray-600">
                <p>Personalized invitation video</p>
                <p className="mt-1">
                  Your price is verified securely before payment.
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                We never collect card details or UPI PINs in this form. Razorpay
                handles payment credentials.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
