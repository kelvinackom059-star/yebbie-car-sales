// Creates the admin account, or turns an existing account into an admin.
// Run it with:  npm run create-admin
// It ASKS for the details, so no password is ever written in the code.

import "dotenv/config";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const lines = rl[Symbol.asyncIterator](); // reads your answers one line at a time

// While muted, what you type isn't shown on screen (for passwords)
let muted = false;
const rlOutput = rl as unknown as { _writeToOutput: (s: string) => void };
const writeToOutput = rlOutput._writeToOutput.bind(rl);
rlOutput._writeToOutput = (s: string) => {
  if (!muted) writeToOutput(s);
};

async function ask(question: string, hidden = false): Promise<string> {
  process.stdout.write(question);
  muted = hidden;
  const { value } = await lines.next();
  muted = false;
  if (hidden) process.stdout.write("\n");
  const answer = String(value ?? "");
  return hidden ? answer : answer.trim(); // passwords are kept exactly as typed
}

async function main() {
  console.log("\nCreate the Yebbie admin account\n");
  const name = await ask("Full name: ");
  const email = (await ask("Email: ")).toLowerCase();
  const phone = (await ask("Phone (e.g. 0541234567): ")).replace(/\s/g, "");
  const password = await ask("Password (min 8 characters, hidden): ", true);
  const confirm = await ask("Confirm password: ", true);

  if (!name || !email.includes("@") || !phone) throw new Error("Name, email and phone are all required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (password !== confirm) throw new Error("Passwords don't match.");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, phone, passwordHash, role: "ADMIN" },
    create: { name, email, phone, passwordHash, role: "ADMIN" },
  });

  console.log(`\n✅ ${user.name} (${user.email}) is now an admin. Log in at /login\n`);
}

main()
  .catch((error) => {
    console.error(`\n❌ ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
