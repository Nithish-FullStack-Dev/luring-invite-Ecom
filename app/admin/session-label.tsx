"use client";
import { useEffect, useState } from "react";
import { cmsRequest } from "@/lib/cms/client";
import type { AdminIdentity } from "@/lib/cms/contracts";
export default function SessionLabel({ email }: { email: string }) {
  const [current, setCurrent] = useState(email);
  useEffect(() => {
    let active = true;
    cmsRequest<AdminIdentity>("/api/me").then(admin => { if (active) setCurrent(admin.email); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <span>{current}</span>;
}
