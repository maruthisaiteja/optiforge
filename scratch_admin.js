const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Update default stage
code = code.replace(/STAGE_3_ATTEMPT_1/g, 'STAGE_0_PRE_EVENT');

// Update tournamentStages array
const oldStagesStr = `const tournamentStages = [
    { key: "STAGE_1_ROUND_1", label: "Stage 1", time: "09:00 - 12:15", name: "1st Round" },`;

const newStagesStr = `const tournamentStages = [
    { key: "STAGE_0_PRE_EVENT", label: "Stage 0", time: "Before 09:00", name: "Pre-Event Stage" },
    { key: "STAGE_1_ROUND_1", label: "Stage 1", time: "09:00 - 12:15", name: "1st Round" },`;

code = code.replace(oldStagesStr, newStagesStr);

// Update colors
code = code.replace(
  '"bg-teal-accent/15 border-teal-accent shadow-glow"',
  '"bg-gradient-to-r from-[#00629B] to-[#004A75] border-[#00629B] text-white shadow-xl"'
);

fs.writeFileSync('src/app/admin/page.tsx', code);
console.log('Admin page updated');
