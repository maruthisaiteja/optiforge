const fs = require('fs');
let code = fs.readFileSync('src/app/register/page.tsx', 'utf8');

const targetStr = `      if (!res.ok) {
        setErrorMsg(data.error || "Failed to register team. Please check your inputs.");
        setLoading(false);
        return;
      }`;

const replacementStr = `      if (!res.ok) {
        const errMsg = data.error || "Failed to register team. Please check your inputs.";
        setErrorMsg(errMsg);
        if (errMsg.toLowerCase().includes("team name")) {
          setFieldErrors({ teamName: errMsg });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/app/register/page.tsx', code);
console.log('Frontend duplicate check handled');
