import { POST as RegisterPOST } from "./src/app/api/registration/route";
import { POST as VerifyPOST } from "./src/app/api/payment/verify/route";
import { cookies } from "next/headers";

// Can't run Next.js API easily with node due to next/headers invariant.
// Let's use fetch instead!
