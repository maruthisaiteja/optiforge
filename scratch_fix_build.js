const fs = require('fs');

// Fix route.ts
let routeCode = fs.readFileSync('src/app/api/auth/login/route.ts', 'utf8');
routeCode = routeCode.replace(/console\.log\(\\'LOGIN ATTEMPT:\\', \{ cleanId, role \}\); const user = await db\.user\.findUnique\(\{/g, 'const user = await db.user.findUnique({');
routeCode = routeCode.replace(/console\.log\(\\'USER FOUND\?:\\', !!user\); if \(!user\) \{/g, 'if (!user) {');
fs.writeFileSync('src/app/api/auth/login/route.ts', routeCode);
console.log('Fixed route.ts');

// Fix dashboard
let dashCode = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
dashCode = dashCode.replace(/\\`Forge#\\\$\{team\?\.teamCode\?\.split\("-"\)\[2\] \|\| "2026"\}\\\`/g, '`Forge#${team?.teamCode?.split("-")[2] || "2026"}`');
fs.writeFileSync('src/app/dashboard/page.tsx', dashCode);
console.log('Fixed dashboard');
