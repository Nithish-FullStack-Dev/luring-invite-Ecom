import { Prisma, type CartUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCustomerOrderWhere(
  user: Pick<CartUser, "id" | "email">,
): Promise<Prisma.OrderWhereInput> {
  const email = user.email.trim().toLowerCase();
  const matchingOrders = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id"
      FROM "Order"
      WHERE LOWER(TRIM("customerEmail")) = ${email}
    `,
  );
  const emailOrderIds = matchingOrders.map((order) => order.id);

  if (emailOrderIds.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: emailOrderIds }, userId: null },
      data: { userId: user.id },
    });
  }

  return {
    OR: [
      { userId: user.id },
      { customer: { is: { userId: user.id } } },
      ...(emailOrderIds.length > 0 ? [{ id: { in: emailOrderIds } }] : []),
    ],
  };
}
