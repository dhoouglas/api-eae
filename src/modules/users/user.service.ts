import { prisma } from "../../server";

export async function findOrCreateUserService(clerkId: string) {
  if (!clerkId) {
    throw new Error("clerkId é obrigatório");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (user) {
    return user;
  }

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkId,
    },
  });

  return newUser;
}
