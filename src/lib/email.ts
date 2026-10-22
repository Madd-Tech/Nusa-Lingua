import "server-only";
import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Resend client — digunakan untuk mengirim email transaksional.
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY && process.env.NODE_ENV === "production") {
  console.warn(
    "[Nusa Lingua] RESEND_API_KEY belum diatur. Pengiriman email tidak akan berfungsi.",
  );
}

/** Instance Resend yang bisa diimpor langsung jika butuh akses penuh ke SDK. */
export const resend = new Resend(RESEND_API_KEY);

/** Alamat pengirim default. */
const DEFAULT_FROM = "Nusa Lingua <noreply@nusalingua.id>";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Kirim email lewat Resend.
 *
 * @returns `{ success: true; id: string }` jika berhasil,
 *          `{ success: false; error: string }` jika gagal.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false as const, error: error.message };
    }

    console.log(`[email] Terkirim ke ${Array.isArray(to) ? to.join(", ") : to} — id: ${data?.id}`);
    return { success: true as const, id: data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Exception:", message);
    return { success: false as const, error: message };
  }
}
