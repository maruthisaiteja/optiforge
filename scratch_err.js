const fs = require('fs');

let code = fs.readFileSync('src/app/api/payment/verify/route.ts', 'utf8');

code = code.replace(
  /return NextResponse\.json\(\{ error: "Internal error processing payment verification\." \}, \{ status: 500 \}\);/,
  'return NextResponse.json({ error: "Internal error processing payment verification: " + (err.message || String(err)) }, { status: 500 });'
);

fs.writeFileSync('src/app/api/payment/verify/route.ts', code);
console.log('Updated error handling');
