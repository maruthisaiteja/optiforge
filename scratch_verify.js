const fs = require('fs');
let code = fs.readFileSync('src/app/api/payment/verify/route.ts', 'utf8');
code = code.replace(/paymentStatus: "CONFIRMED"/g, 'paymentStatus: "PENDING_PAYMENT"');
fs.writeFileSync('src/app/api/payment/verify/route.ts', code);
console.log('Updated verify route payment status');
