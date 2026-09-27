const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');
code = code.replace(
  /<h2\s+className="text-3xl sm:text-5xl font-black"\s+style=\{\{ fontFamily: 'Sora, sans-serif', color: \$\.navy \}\}\s+>\s+Certificates/g,
  `<h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: 'Sora, sans-serif', color: $.navy }}
            >
              Exciting Prizes & Certificates`
);

code = code.replace(
  /<p className="text-sm sm:text-base opacity-80" style=\{\{ color: \$\.navy \}\}>\s+All registered participants who complete both submission rounds successfully will receive verifiable certificates.\s+<\/p>/g,
  `<p className="text-sm sm:text-base opacity-80" style={{ color: $.navy }}>
              Prize money and exciting rewards will be awarded to the winning teams across all problem tracks! All registered participants who complete both submission rounds successfully will also receive verifiable certificates.
            </p>`
);

fs.writeFileSync('src/app/page.tsx', code);
console.log('Updated landing page prizes.');
