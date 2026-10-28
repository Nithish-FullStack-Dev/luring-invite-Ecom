"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsRequest } from "@/lib/cms/client";
export default function Logout({ all = false }: { all?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        try {
          await cmsRequest("/api/logout", "POST", { all });
          router.replace("/admin/login");
          router.refresh();
        } catch {
          setError("Unable to log out. Please try again.");
          setPending(false);
        }
      }}
    >
      <button disabled={pending} className="p-2 ">
        {pending ? "Logging out…" : all ? "Log out all devices" : "Log out"}
      </button>
      {error && (
        <p className="cms-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
