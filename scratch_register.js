const fs = require('fs');
let code = fs.readFileSync('src/app/register/page.tsx', 'utf8');

// Replace default values for branch and year
code = code.replace(/branch: "CSE"/g, 'branch: ""');
code = code.replace(/branch: "IT"/g, 'branch: ""');
code = code.replace(/year: "3rd Year"/g, 'year: ""');

// Provide exhaustive list of branches
const oldBranches = `<option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="AI">AI/ML</option>
                  <option value="DS">Data Science</option>`;

const newBranches = `<option value="" disabled>Select Department</option>
                  <option value="CSE">Computer Science and Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics and Communication Engineering (ECE)</option>
                  <option value="EEE">Electrical and Electronics Engineering (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                  <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  <option value="AIML">Artificial Intelligence & Machine Learning (AIML)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                  <option value="CSIT">Computer Science & Information Technology (CSIT)</option>
                  <option value="IOT">Internet of Things (IoT)</option>
                  <option value="PHARM">B. Pharmacy</option>
                  <option value="PHARMD">Pharm.D</option>
                  <option value="PHARMACOLOGY">Pharmacology</option>
                  <option value="OTHER">Other</option>`;

if(code.includes('value="CSE">CSE</option>')) {
  // It's a bit tricky to replace exactly because indentation might vary.
  // I will use regex to find the select block for branch and replace its options.
}

// Let's do a more robust replacement for the select options.
const branchSelectRegex = /<select\s+value=\{m\.branch\}[\s\S]*?<\/select>/g;
code = code.replace(branchSelectRegex, (match) => {
  return `<select
                  value={m.branch}
                  onChange={(e) => updateMember(m.id, "branch", e.target.value)}
                  className="w-full bg-bg-primary/50 border border-navy-border rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-teal-accent transition-colors text-sm"
                  required
                >
                  ${newBranches}
                </select>`;
});

const yearSelectRegex = /<select\s+value=\{m\.year\}[\s\S]*?<\/select>/g;
const newYears = `<option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="6th Year">6th Year</option>`;

code = code.replace(yearSelectRegex, (match) => {
  return `<select
                  value={m.year}
                  onChange={(e) => updateMember(m.id, "year", e.target.value)}
                  className="w-full bg-bg-primary/50 border border-navy-border rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-teal-accent transition-colors text-sm"
                  required
                >
                  ${newYears}
                </select>`;
});

fs.writeFileSync('src/app/register/page.tsx', code);
console.log('Register page updated');
