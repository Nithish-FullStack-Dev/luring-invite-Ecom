import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import LoginForm from "./form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-[#24192d] lg:grid lg:grid-cols-[1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#f5eefb] p-10 lg:flex xl:p-16">
        <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
          <img
            src="https://res.cloudinary.com/drdotym31/image/upload/v1750078130/main-logo-1-1024x795_lfasd5.webp"
            alt=""
            className="size-28"
          />
        </Link>

        <div className="relative z-10 max-w-xl py-12">
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.12] tracking-[-0.055em] xl:text-6xl">
            Beautiful invitations.
            <span className="mt-2 block text-[#a86dcd]">
              Effortless management.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-[#776980]">
            Manage your website content, invitation templates, and creative
            experiences from one simple workspace.
          </p>

          <div className="mt-12 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/80 bg-white/70 p-5">
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-[#f0e1fa] text-[#9658ba]">
                <Sparkles className="size-5" />
              </span>
              <p className="text-sm font-semibold">Creative freedom</p>
              <p className="mt-1 text-xs leading-5 text-[#82738a]">
                Your content, your style.
              </p>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/70 p-5">
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-[#f0e1fa] text-[#9658ba]">
                <ArrowUpRight className="size-5" />
              </span>
              <p className="text-sm font-semibold">One workspace</p>
              <p className="mt-1 text-xs leading-5 text-[#82738a]">
                Everything in one place.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#93839b]">
          © 2026 Luring Invite
        </p>
      </aside>

      {/* Login panel */}
      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <img
              src="https://res.cloudinary.com/drdotym31/image/upload/v1750078130/main-logo-1-1024x795_lfasd5.webp"
              alt=""
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[#776980] transition hover:text-[#8950b0]"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to website</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-[#eadcf3] bg-[#f7f0fb] text-[#a86dcd]">
              <Sparkles className="size-6" />
            </div>

            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#9a61bb]">
              ADMIN WORKSPACE
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#817487]">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#92869a]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Secure administrator sign-in
          </div>
        </div>

        <footer className="border-t border-[#f0eaf3] py-5 text-center text-xs text-[#a095a8]">
          © 2026 Luring Invite. All rights reserved.
        </footer>
      </section>
    </main>
  );
}
