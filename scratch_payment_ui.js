const fs = require('fs');

let code = fs.readFileSync('src/app/payment/page.tsx', 'utf8');

// Replace copy team id button block
code = code.replace(/<button[\s\S]*?onClick=\{copyToClipboard\}[\s\S]*?<\/button>/, '');

// Replace Team ID div
code = code.replace(/<div className="p-3 rounded-lg bg-bg-primary border border-navy-border">\s*<span className="text-brand-dim text-\[10px\] block uppercase">Team ID<\/span>\s*<span className="text-sm font-bold text-teal-accent">\{receiptData\?\.teamCode \|\| teamCode\}<\/span>\s*<\/div>/, '');

// Replace Payment Status block
code = code.replace(/<span className="text-xs text-status-green font-bold flex items-center gap-1 mt-0\.5">\s*<CheckCircle2 className="w-3\.5 h-3\.5" \/>\s*<span>✓ Paid Online via UPI<\/span>\s*<\/span>/, `<span className="text-xs text-orange-accent font-bold flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending Admin Verification</span>
                </span>`);

// Replace team ID header in success UI
code = code.replace(/<h3 className="text-lg font-bold text-teal-accent font-mono">\{receiptData\?\.teamCode \|\| teamCode\}<\/h3>/, `<h3 className="text-lg font-bold text-teal-accent font-mono">Team Registered</h3>`);

// Replace instructions at the bottom
code = code.replace(/Your OptiForge 2026 registration has been successfully confirmed\./, 'Your OptiForge 2026 registration and payment are pending admin verification. Once verified, your Team ID and credentials will be sent via email.');

fs.writeFileSync('src/app/payment/page.tsx', code);
console.log('Payment UI updated');
