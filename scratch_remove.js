const fs = require('fs');

// 1. Register Page
let regCode = fs.readFileSync('src/app/register/page.tsx', 'utf8');
const regRegex = /\{\/\* Note on Credentials \*\/\}[\s\S]*?<\/div>/;
regCode = regCode.replace(regRegex, '');
fs.writeFileSync('src/app/register/page.tsx', regCode);

// 2. Payment Page
let payCode = fs.readFileSync('src/app/payment/page.tsx', 'utf8');
const payRegex = /<div className="mt-4 p-5 rounded-xl border border-gray-700 bg-black text-white shadow-2xl">[\s\S]*?<\/div>/;
payCode = payCode.replace(payRegex, '');
fs.writeFileSync('src/app/payment/page.tsx', payCode);

// 3. Home Page
let homeCode = fs.readFileSync('src/app/page.tsx', 'utf8');
const homeRegex = /\{\/\* Note on Credentials \*\/\}[\s\S]*?<\/div>/;
homeCode = homeCode.replace(homeRegex, '');
fs.writeFileSync('src/app/page.tsx', homeCode);

console.log('Removed notes from everywhere.');
