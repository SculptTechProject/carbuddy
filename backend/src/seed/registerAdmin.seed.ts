import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_PASSWORD environment variable is not set.");
  }
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await prisma.admin.create({
    data: {
      email: process.env.ADMIN_EMAIL,
      password: hashed,
    },
  });
}

main().catch(console.error);
