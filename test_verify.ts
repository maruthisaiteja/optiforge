import { POST } from "./src/app/api/payment/verify/route";

async function run() {
  const req = new Request("http://localhost/api/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamCode: "OPT-26-9999", // Dummy
      utrNumber: "123412341234",
    }),
  });

  const res = await POST(req);
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

run().catch(console.error);
