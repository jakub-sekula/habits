import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      username: "alice",
      email: "alice@prisma.io",
      salt: "$2b$10$aTiGWeioLMOidNUHWW/bRO",
      hashed_password:
        "$2b$10$aTiGWeioLMOidNUHWW/bRO7E6tV6q9774lsf9DG9WCcT5ulZZ/Y6i",
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      username: "bob",
      email: "bob@prisma.io",
      salt: "$2b$10$aTiGWeioLMOidNUHWW/bRO",
      hashed_password:
        "$2b$10$aTiGWeioLMOidNUHWW/bRO7E6tV6q9774lsf9DG9WCcT5ulZZ/Y6i",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
