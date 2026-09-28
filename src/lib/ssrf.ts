import dns from "dns/promises";
import { URL } from "url";

/**
 * Checks whether an IP address belongs to private, loopback, link-local, or cloud metadata ranges.
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  const ipv4Parts = ip.split(".").map(Number);
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = ipv4Parts;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 10.0.0.0/8 (Private)
    if (a === 10) return true;

    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata)
    if (a === 169 && b === 254) return true;

    // 0.0.0.0/8
    if (a === 0) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    return false;
  }

  // IPv6 checks
  const normalized = ip.toLowerCase();
  if (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fe80:") || // Link-local
    normalized.startsWith("fc00:") || // Unique local
    normalized.startsWith("fd00:")
  ) {
    return true;
  }

  return false;
}

/**
 * Validates a user-supplied URL to guarantee it does not target internal services or cloud metadata.
 */
export async function validateExternalUrl(
  urlString: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const parsed = new URL(urlString);

    // Enforce HTTP/HTTPS protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, reason: "Only HTTP and HTTPS protocols are allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block obvious local hostnames
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname === "metadata.google.internal" ||
      hostname === "instance-data"
    ) {
      return { valid: false, reason: "Access to internal or local domains is blocked." };
    }

    // If hostname is directly an IP literal
    if (isPrivateIp(hostname)) {
      return { valid: false, reason: "Access to private or link-local IP addresses is blocked." };
    }

    // Resolve DNS to verify against DNS rebinding
    try {
      const records = await dns.lookup(hostname, { all: true });
      for (const record of records) {
        if (isPrivateIp(record.address)) {
          return { valid: false, reason: "Target hostname resolves to a restricted private network." };
        }
      }
    } catch {
      return { valid: false, reason: "Could not resolve hostname." };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid URL format." };
  }
}
