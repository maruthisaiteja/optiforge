const fs = require('fs');
let code = fs.readFileSync('src/app/api/registration/route.ts', 'utf8');

// add check for duplicate team name
const checkDuplicateStr = `// Simple duplication check (email)`;
const newDuplicateStr = `
    // Check for duplicate team name
    const existingTeamByName = await db.team.findFirst((t) => t.teamName.toLowerCase() === body.teamName.toLowerCase());
    if (existingTeamByName) {
      return NextResponse.json({ error: 'Team name already exists. Please choose a different team name.' }, { status: 400 });
    }

    // Simple duplication check (email)`;

code = code.replace(checkDuplicateStr, newDuplicateStr);
fs.writeFileSync('src/app/api/registration/route.ts', code);
console.log('Registration route updated');
