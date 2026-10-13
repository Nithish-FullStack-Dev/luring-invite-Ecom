export function assertOrigin(
  origin: string | null,
  configuredOrigin: string | undefined,
  production: boolean,
) {
  const configured =
    configuredOrigin || (production ? "" : "http://localhost:3000");
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("CMS_ORIGIN is required.");
  }
  if (url.origin !== configured || (production && url.protocol !== "https:"))
    throw new Error("Invalid CMS_ORIGIN.");
  if (!origin || origin !== url.origin)
    throw new Error("Request origin rejected.");
}
export const SESSION_SECONDS = 60 * 60 * 8;
export const sessionCookie = (production: boolean) => ({
  name: production ? "__Host-luring-cms" : "luring-cms",
  httpOnly: true,
  secure: production,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
});
