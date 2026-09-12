import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/infrastructure/persistence/prisma-client";
import { BcryptPasswordHasher } from "@/infrastructure/services/bcrypt-password-hasher";

const SeedEnvSchema = z.object({
  SEED_SUPERADMIN_EMAIL: z.string().email(),
  SEED_SUPERADMIN_PASSWORD: z.string().min(8),
  SEED_SUPERADMIN_FIRSTNAME: z.string().min(1).default("Towelie"),
  SEED_SUPERADMIN_LASTNAME: z.string().min(1).default("Admin"),
});

async function main(): Promise<void> {
  const env = SeedEnvSchema.parse(process.env);
  const email = env.SEED_SUPERADMIN_EMAIL.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.warn(`Super-Admin ${email} already exists, skipping seed.`);
    return;
  }

  const hasher = new BcryptPasswordHasher();
  await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash: await hasher.hash(env.SEED_SUPERADMIN_PASSWORD),
      firstName: env.SEED_SUPERADMIN_FIRSTNAME,
      lastName: env.SEED_SUPERADMIN_LASTNAME,
      isSuperAdmin: true,
    },
  });

  console.warn(`Seeded Super-Admin ${email}.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
