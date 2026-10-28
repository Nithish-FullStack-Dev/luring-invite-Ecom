import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cart/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { user: null },
      {
        status: 401,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
    );
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
      },
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
