import { db } from "../src/lib/db";
import { generateSecureTeamPassword, hashPassword } from "../src/lib/auth";

async function main() {
  const teams = await db.team.findMany();
  console.log(`Checking ${teams.length} teams for password upgrades...`);

  for (const team of teams) {
    if (team.teamCode === "OPT-26-TEST") {
      await db.team.update({
        where: { id: team.id },
        data: {
          rawPassword: "Test#Forge2026",
          password: await hashPassword("Test#Forge2026"),
        },
      });
      console.log(`Updated test team OPT-26-TEST password.`);
      continue;
    }

    const currentRaw = (team as any).rawPassword;
    const isPredictable = !currentRaw || currentRaw.startsWith(`Forge#${team.teamCode.split("-")[2] || "2026"}`);

    if (isPredictable) {
      const newSecurePassword = generateSecureTeamPassword();
      const newHash = await hashPassword(newSecurePassword);

      await db.team.update({
        where: { id: team.id },
        data: {
          rawPassword: newSecurePassword,
          password: newHash,
        },
      });

      console.log(`Upgraded team ${team.teamCode} (${team.teamName}):`);
      console.log(`  New Password: ${newSecurePassword}`);
    } else {
      console.log(`Team ${team.teamCode} already has a secure password.`);
    }
  }

  console.log("Password migration complete! Verifying database integrity...");
  const updatedTeams = await db.team.findMany();
  for (const t of updatedTeams) {
    console.log(`- ${t.teamCode} (${t.teamName}): ${ (t as any).rawPassword }`);
  }
}

main().catch(console.error);
