const run = async () => {
  try {
    // 1. Register
    const regRes = await fetch("http://localhost:3000/api/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamName: "CrashTest5",
        leaderEmail: "crash5@test.com",
        leaderPhone: "9999999999",
        domainPreference: "theme-1-biomedical-ai",
        agreedToTerms: true,
        members: [
          { name: "A", collegeName: "VCE", rollNumber: "11111", email: "a@a.com", phone: "9999999999", branch: "CSE", year: "1st Year" },
          { name: "B", collegeName: "VCE", rollNumber: "22222", email: "b@a.com", phone: "8888888888", branch: "CSE", year: "1st Year" }
        ]
      })
    });
    const regData = await regRes.json();
    console.log("Reg:", regData);

    const cookies = regRes.headers.get("set-cookie");
    
    // 2. Verify
    const verRes = await fetch("http://localhost:3000/api/payment/verify", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "cookie": cookies || ""
      },
      body: JSON.stringify({
        teamCode: regData.teamCode,
        utrNumber: "123123123123"
      })
    });
    const verData = await verRes.json();
    console.log("Verify:", verData);
  } catch (e) {
    console.error("Error:", e);
  }
};
run();
