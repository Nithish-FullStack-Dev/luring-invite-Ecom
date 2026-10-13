import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { passwordSchema } from "./schema";
// Maintained Node scrypt implementation: N=2^17, r=8, p=1 (~128 MiB).
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64,
    { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
    (error, key) => error ? reject(error) : resolve(key)));
}
export async function hashPassword(password: string) {
  passwordSchema.parse(password);
  const salt = randomBytes(16);
  return ["scrypt-v1", salt.toString("hex"), (await derive(password, salt)).toString("hex")].join("$");
}
export async function verifyPassword(password: string, encoded: string) {
  if (password.length > 128 || !/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(encoded)) return false;
  const [, salt, hash] = encoded.split("$");
  return timingSafeEqual(await derive(password, Buffer.from(salt, "hex")), Buffer.from(hash, "hex"));
}
export const digestToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export const dummyHash = ["scrypt-v1", "0".repeat(32), "0".repeat(128)].join("$");
