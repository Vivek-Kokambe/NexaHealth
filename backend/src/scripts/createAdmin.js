require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend-v1/.env before creating an admin");
  }

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
    throw new Error("Use a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("That email already belongs to an account. Choose an unused email for the administrator");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Administrator account created for ${email}`);
};

createAdmin()
  .catch((error) => {
    console.error("Could not create administrator:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
