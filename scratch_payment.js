const fs = require('fs');
let code = fs.readFileSync('src/app/payment/page.tsx', 'utf8');

const targetStr = `<div className="mt-4 p-4 rounded-xl border border-orange-accent/40 bg-orange-accent/10">
              <h4 className="text-orange-accent font-bold text-sm mb-1">⚠️ IMPORTANT: SAVE YOUR CREDENTIALS</h4>
              <p className="text-xs text-orange-accent/90 mb-2">
                Please take note of your TEAM ID. Your initial login password is: <span className="font-mono bg-navy-deep px-1.5 py-0.5 rounded text-white">Forge#{(receiptData?.teamCode || teamCode)?.split("-").pop()}</span>
              </p>
              <p className="text-[11px] text-orange-accent/80">
                We will also send you an email containing your Team ID and Password from <span className="font-mono bg-navy-deep px-1 py-0.5 rounded text-white">vuggidisaivarshith@gmail.com</span>.
              </p>
            </div>`;

const replacementStr = `<div className="mt-4 p-5 rounded-xl border border-gray-700 bg-black text-white shadow-2xl">
              <h4 className="font-bold text-sm mb-3 text-red-500">⚠️ IMPORTANT: SAVE YOUR CREDENTIALS</h4>
              <div className="text-sm font-mono space-y-2 mb-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Team ID:</span>
                  <span className="text-teal-400 font-bold">{receiptData?.teamCode || teamCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Password:</span>
                  <span className="text-teal-400 font-bold">Forge#{(receiptData?.teamCode || teamCode)?.split("-").pop()}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed text-center">
                We will also send you a confirmation email containing your Team ID and Password from:<br/>
                <strong className="text-white mt-1 inline-block text-xs">vuggidisaivarshith@gmail.com</strong>
              </p>
            </div>`;

if(code.includes('⚠️ IMPORTANT: SAVE YOUR CREDENTIALS')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/app/payment/page.tsx', code);
  console.log('Payment page credentials box updated');
} else {
  console.log('Target string not found');
}
