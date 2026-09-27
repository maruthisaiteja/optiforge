const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const startStr = '{/* 6. PRIZES, GOODIES & CERTIFICATES — Interactive Section */}';
const endStr = '{/* EVENT COORDINATORS & LINKS */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* 6. CERTIFICATES — Interactive Section */}
        <section id="prizes" className="py-16 max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider glass-card-subtle"
              style={{ color: $.ieeeBlue }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rewards & Recognition</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: 'Sora, sans-serif', color: $.navy }}
            >
              Certificates
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: $.slate }}>
              Every registered participant receives an IEEE-authenticated certificate of participation.
            </p>
          </div>

          <div
            className="rounded-3xl p-8 space-y-5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            style={{ backgroundColor: $.white, border: \`1px solid \${$.border}\` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: \`\${$.success}15\` }}
              >
                📜
              </div>
              <div>
                <h3 className="font-black text-xl" style={{ fontFamily: 'Sora, sans-serif', color: $.navy }}>
                  Verified Certificates
                </h3>
                <p className="text-xs" style={{ color: $.slate }}>For all participants</p>
              </div>
            </div>
            <div className="space-y-3 text-sm" style={{ color: $.slate }}>
              {[
                'Certificate of Excellence (Top 3 Teams)',
                'Certificate of Merit (Top 10 Teams)',
                'Certificate of Participation (All Teams)',
                'Cryptographically verified & verifiable online',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: $.success }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div
              className="p-3 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: \`\${$.success}10\`, color: $.success, border: \`1px solid \${$.success}30\` }}
            >
              Every verified participant receives a certificate — regardless of final rank!
            </div>
          </div>
        </section>

        `;
  
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/app/page.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Could not find start or end string', startIndex, endIndex);
}
