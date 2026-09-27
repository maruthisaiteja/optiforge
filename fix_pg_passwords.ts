import { db } from "./src/lib/db";
import bcrypt from "bcryptjs";

async function run() {
  console.log("Fetching users...");
  const users = await db.user.findMany();
  
  const newJudgeHash = await bcrypt.hash('judge@optiforge2026', 10);
  const newAdminHash = await bcrypt.hash('admin@optiforge2026', 10);

  let updated = 0;
  for (const u of users) {
    if (u.role === 'JUDGE') {
      await db.user.upsert({
        where: { username: u.username },
        update: { password: newJudgeHash },
        create: { ...u, password: newJudgeHash } as any
      });
      updated++;
    } else if (u.role === 'ADMIN') {
      await db.user.upsert({
        where: { username: u.username },
        update: { password: newAdminHash },
        create: { ...u, password: newAdminHash } as any
      });
      updated++;
    }
  }

  console.log('Fixed passwords for ' + updated + ' users.');
  process.exit(0);
}

run().catch(console.error);
