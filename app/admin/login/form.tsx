"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cmsRequest } from "@/lib/cms/client";
async function login(_state: { error?: string }, form: FormData, navigate: (url: string) => void) {
  try { await cmsRequest("/api/login", "POST", { email: form.get("email"), password: form.get("password") }); navigate("/admin/dashboard"); return {}; }
  catch (error) { return { error: error instanceof Error ? error.message : "Sign-in is unavailable. Please try again later." }; }
}
export default function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState((state: { error?: string }, form: FormData) => login(state, form, url => { router.replace(url); router.refresh(); }), {});
  return <form action={action}>
    <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
    <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} />
    {state.error && <p className="cms-error" role="alert">{state.error}</p>}
    <div className="cms-actions"><button className="cms-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in securely"}</button></div>
  </form>;
}
