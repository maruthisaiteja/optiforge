const fs = require('fs');

let code = fs.readFileSync('src/app/register/page.tsx', 'utf8');
code = code.replace(/updateMember\(m\.id, "branch"/g, 'updateMember(idx, "branch"');
code = code.replace(/updateMember\(m\.id, "year"/g, 'updateMember(idx, "year"');

fs.writeFileSync('src/app/register/page.tsx', code);
console.log('Fixed m.id -> idx in register page');
