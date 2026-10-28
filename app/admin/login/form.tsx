"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { cmsRequest } from "@/lib/cms/client";

type LoginState = {
  error?: string;
};

async function login(
  _state: LoginState,
  form: FormData,
  navigate: (url: string) => void,
): Promise<LoginState> {
  try {
    await cmsRequest("/api/login", "POST", {
      email: form.get("email"),
      password: form.get("password"),
    });

    navigate("/admin/dashboard");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Sign-in is unavailable. Please try again later.",
    };
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, action, pending] = useActionState(
    (previousState: LoginState, formData: FormData) =>
      login(previousState, formData, (url) => {
        router.replace(url);
        router.refresh();
      }),
    {},
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[#34283c]"
        >
          Email address
        </label>

        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={254}
            className="h-13 w-full rounded-xl border border-[#e6ddea] bg-white pl-12 pr-4 text-sm text-[#24192d] outline-none transition placeholder:text-[#b0a5b9] hover:border-[#cdb1df] focus:border-[#a86dcd] focus:ring-4 focus:ring-[#a86dcd]/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-[#34283c]"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            maxLength={128}
            className="h-13 w-full rounded-xl border border-[#e6ddea] bg-white pl-12 pr-12 text-sm text-[#24192d] outline-none transition placeholder:text-[#b0a5b9] hover:border-[#cdb1df] focus:border-[#a86dcd] focus:ring-4 focus:ring-[#a86dcd]/10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#94869e] transition hover:bg-[#f7f0fb] hover:text-[#8950b0] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#a86dcd]"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#a86dcd] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#a86dcd]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#9257b7] hover:shadow-xl hover:shadow-[#a86dcd]/25 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#a86dcd] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
