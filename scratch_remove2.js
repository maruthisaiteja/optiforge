const fs = require('fs');

// 2. Payment Page
let payCode = fs.readFileSync('src/app/payment/page.tsx', 'utf8');
const payRegex = /<div className="mt-4 p-4 rounded-xl border border-orange-accent\/40 bg-orange-accent\/10">[\s\S]*?<\/div>/;
payCode = payCode.replace(payRegex, '');
fs.writeFileSync('src/app/payment/page.tsx', payCode);

console.log('Removed orange box from payment page.');
