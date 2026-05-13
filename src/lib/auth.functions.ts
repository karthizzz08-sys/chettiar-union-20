// Server function: send & verify OTP via Brevo API v3.
// Uses Supabase admin to create users and issue magic-link tokens that the
// client exchanges for a real session.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BREVO_API_URL = "https://api.brevo.com/v3";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "ablelov252@gmail.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Chettiar Connect";

// Dynamic import for crypto (server-only) to prevent browser bundling
const getCryptoFunctions = async () => {
  const { createHash, randomInt } = await import("crypto");
  return { createHash, randomInt };
};

const hashCode = async (code: string) => {
  const { createHash } = await getCryptoFunctions();
  return createHash("sha256").update(code).digest("hex");
};

const generateOtpCode = async () => {
  const { randomInt } = await getCryptoFunctions();
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
};

async function sendBrevoEmail(toEmail: string, code: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    console.error("[Brevo] Error: BREVO_API_KEY environment variable is not set");
    throw new Error("BREVO_API_KEY environment variable is not set");
  }

  // Validate Brevo API key format (should start with xkeysib- or similar)
  if (!BREVO_API_KEY.includes("-") && !BREVO_API_KEY.startsWith("xkey")) {
    console.error("[Brevo] Error: Invalid API key format. Key should start with 'xkey' prefix");
    throw new Error("Invalid BREVO_API_KEY format. Brevo API keys typically start with 'xkey' prefix");
  }

  console.log(`[Brevo] Preparing to send OTP email to: ${toEmail}`);
  console.log(`[Brevo] Sender: "${SENDER_NAME}" <${SENDER_EMAIL}>`);

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fdf8f0;border-radius:12px">
      <h1 style="font-family:Georgia,serif;color:#5a1a1a;margin:0 0 8px">Chettiar Connect</h1>
      <p style="color:#7a4a4a;margin:0 0 24px;font-size:14px">Premium Tamil Matrimony</p>
      <div style="background:linear-gradient(135deg,#f5d182,#d4a04a);padding:24px;border-radius:8px;text-align:center">
        <p style="margin:0 0 8px;color:#3a1a1a;font-size:13px;letter-spacing:1px">YOUR VERIFICATION CODE</p>
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#3a1a1a;font-family:Georgia,serif">${code}</p>
      </div>
      <p style="color:#7a4a4a;margin:24px 0 0;font-size:13px">This code expires in 5 minutes. Do not share it with anyone.</p>
      <p style="color:#aaa;margin:24px 0 0;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  const emailPayload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: `${code} is your Chettiar Connect verification code`,
    htmlContent: html,
  };

  console.log(`[Brevo] Sending email via Brevo Transactional API...`);
  
  try {
    const res = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(emailPayload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Brevo] Failed to send email. Status: ${res.status}`);
      console.error(`[Brevo] Response: ${errorText}`);
      
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch {
        // If not JSON, use raw text
      }
      
      throw new Error(`Brevo email send failed [${res.status}]: ${errorDetails}`);
    }
    
    const responseData = await res.json();
    console.log(`[Brevo] Email sent successfully! Message ID: ${responseData.messageId || responseData.id}`);
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Brevo] Email send error: ${error.message}`);
      throw error;
    }
    throw new Error(`Brevo send failed: Unknown error`);
  }
}

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const email = data.email;
    console.log(`[OTP] Request to send OTP to: ${email}`);

    try {
      // Rate limit: max 1 OTP per 30s, 5 per hour
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recent } = await supabaseAdmin
        .from("otp_codes")
        .select("created_at")
        .eq("email", email)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      
      if (recent && recent.length >= 5) {
        console.warn(`[OTP] Rate limit exceeded for ${email}: 5+ requests in the last hour`);
        throw new Error("Too many OTP requests. Try again in an hour.");
      }
      
      if (recent && recent.length > 0) {
        const last = new Date(recent[0].created_at).getTime();
        if (Date.now() - last < 30_000) {
          console.warn(`[OTP] Rate limit exceeded for ${email}: less than 30 seconds since last request`);
          throw new Error("Please wait 30 seconds before requesting another code.");
        }
      }

      const code = await generateOtpCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      console.log(`[OTP] Generated code: ${code}, expires at: ${expiresAt}`);

      const { error: insErr } = await supabaseAdmin.from("otp_codes").insert({
        email,
        code_hash: await hashCode(code),
        expires_at: expiresAt,
      });
      
      if (insErr) {
        console.error(`[OTP] Database insert error for ${email}:`, insErr.message);
        throw new Error(insErr.message);
      }

      console.log(`[OTP] Code stored in database. Now sending email...`);
      await sendBrevoEmail(email, code);
      
      console.log(`[OTP] Successfully sent OTP to: ${email}`);
      return { ok: true, expiresAt };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[OTP] Failed to send OTP to ${email}: ${errorMessage}`);
      throw error;
    }
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; code: string }) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        code: z.string().trim().regex(/^\d{6}$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { email, code } = data;
    console.log(`[OTP] Verifying OTP for: ${email}`);

    try {
      const { data: rows } = await supabaseAdmin
        .from("otp_codes")
        .select("*")
        .eq("email", email)
        .eq("consumed", false)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const row = rows?.[0];
      if (!row) {
        console.warn(`[OTP] No active OTP code found for ${email}`);
        throw new Error("No active code. Request a new one.");
      }
      
      if (new Date(row.expires_at).getTime() < Date.now()) {
        console.warn(`[OTP] Code expired for ${email}`);
        throw new Error("Code expired. Request a new one.");
      }
      
      const attempts = row.attempts ?? 0;
      if (attempts >= 5) {
        console.warn(`[OTP] Too many failed attempts for ${email} (${attempts})`);
        throw new Error("Too many attempts. Request a new code.");
      }
      
      const codeHash = await hashCode(code);
      if (row.code_hash !== codeHash) {
        console.warn(`[OTP] Invalid code attempt for ${email} (attempt ${attempts + 1}/5)`);
        await supabaseAdmin
          .from("otp_codes")
          .update({ attempts: attempts + 1 })
          .eq("id", row.id);
        throw new Error("Invalid code.");
      }

      console.log(`[OTP] Code verified successfully for ${email}`);
      await supabaseAdmin.from("otp_codes").update({ consumed: true }).eq("id", row.id);

      // Find or create user — paginate listUsers to find by email
      let userId: string | null = null;
      for (let page = 1; page <= 20 && !userId; page++) {
        const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (error) break;
        const found = list.users.find((u) => u.email?.toLowerCase() === email);
        if (found) userId = found.id;
        if (list.users.length < 200) break;
      }
      
      if (!userId) {
        console.log(`[OTP] Creating new user for: ${email}`);
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        });
        if (created.error) {
          console.error(`[OTP] Failed to create user: ${created.error.message}`);
          throw new Error(created.error.message);
        }
        userId = created.data.user!.id;
      }

      // Generate a magic link, return token_hash for client to verify
      const linkRes = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (linkRes.error) {
        console.error(`[OTP] Failed to generate magic link: ${linkRes.error.message}`);
        throw new Error(linkRes.error.message);
      }
      
      const tokenHash =
        // @ts-ignore
        linkRes.data?.properties?.hashed_token ??
        // @ts-ignore
        linkRes.data?.hashed_token;
      
      if (!tokenHash) {
        console.error(`[OTP] No token hash in response for ${email}`);
        throw new Error("Could not issue session token.");
      }

      console.log(`[OTP] Successfully verified OTP and issued token for: ${email}`);
      return { tokenHash, userId, email };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[OTP] Verification failed for ${email}: ${errorMessage}`);
      throw error;
    }
  });
