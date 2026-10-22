// ---------------------------------------------------------------------------
// HTML email template generators — Nusa Lingua
// Semua fungsi menghasilkan string HTML lengkap (inline CSS, table layout).
// ---------------------------------------------------------------------------

// ===== Design Tokens =====
const COLORS = {
  primary: "#228B54",
  primaryDark: "#1E7C4B",
  primaryDarker: "#16653C",
  secondary: "#E3A008",
  accent: "#DC5014",
  bg: "#FFFBF5",
  bgCard: "#FFFFFF",
  text: "#1C1917",
  textMuted: "#78716C",
  textLight: "#A8A29E",
  border: "#E7E5E4",
  streakOrange: "#EA580C",
} as const;

const FONT_FAMILY =
  "'Plus Jakarta Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

// ===== Shared layout helpers =====

function emailHeader(siteUrl: string) {
  return `
    <tr>
      <td align="center" style="padding: 32px 24px 24px;">
        <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
          <img
            src="${siteUrl}/media/logo/nusa-lingua-logo.png"
            alt="Nusa Lingua"
            width="160"
            style="display: block; max-width: 160px; height: auto; border: 0;"
          />
        </a>
      </td>
    </tr>`;
}

function emailFooter(siteUrl: string) {
  return `
    <tr>
      <td style="padding: 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="border-top: 1px solid ${COLORS.border}; padding-top: 24px;"></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0 24px 32px; font-family: ${FONT_FAMILY}; font-size: 12px; line-height: 20px; color: ${COLORS.textLight};">
        &copy; ${new Date().getFullYear()} Nusa Lingua — Kenali Indonesia lewat bahasanya.
        <br />
        <a href="${siteUrl}" style="color: ${COLORS.textLight}; text-decoration: underline;">nusalingua.id</a>
        &nbsp;&bull;&nbsp;
        <a href="${siteUrl}/pengaturan" style="color: ${COLORS.textLight}; text-decoration: underline;">Berhenti berlangganan</a>
      </td>
    </tr>`;
}

function ctaButton(label: string, href: string, bgColor: string = COLORS.primary) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding: 28px 0 8px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="${bgColor}" fillcolor="${bgColor}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:${FONT_FAMILY};font-size:16px;font-weight:700;">
              ${label}
            </center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${href}" target="_blank" style="display: inline-block; background-color: ${bgColor}; color: #ffffff; font-family: ${FONT_FAMILY}; font-size: 16px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; mso-padding-alt: 0; text-align: center;">
            ${label}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

function wrapLayout(bodyContent: string, siteUrl: string, preheader = "") {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Nusa Lingua</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: ${FONT_FAMILY}; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .fluid { max-width: 100% !important; height: auto !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .stat-card { display: block !important; width: 100% !important; margin-bottom: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; word-spacing: normal; background-color: ${COLORS.bg}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${preheader ? `<div style="display:none;font-size:1px;color:${COLORS.bg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}

  <!--[if mso]>
  <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:600px;">
  <tr><td>
  <![endif]-->

  <table class="email-container" align="center" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; background-color: ${COLORS.bgCard}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    ${emailHeader(siteUrl)}
    ${bodyContent}
    ${emailFooter(siteUrl)}
  </table>

  <!--[if mso]>
  </td></tr></table>
  <![endif]-->
</body>
</html>`;
}

// ===== Template generators =====

interface WelcomeEmailParams {
  name: string;
  siteUrl: string;
}

/**
 * Email selamat datang — dikirim setelah user menyelesaikan onboarding.
 */
export function generateWelcomeEmail({ name, siteUrl }: WelcomeEmailParams): string {
  const body = `
    <tr>
      <td style="padding: 0 32px; font-family: ${FONT_FAMILY};">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: ${COLORS.primary};">
          Selamat datang, ${name}! 🎉
        </h1>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 26px; color: ${COLORS.text};">
          Kami senang sekali kamu bergabung dengan <strong>Nusa Lingua</strong> — platform belajar bahasa daerah Indonesia yang seru dan interaktif.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px 20px; background-color: ${COLORS.bg}; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
              <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: ${COLORS.primaryDark}; font-family: ${FONT_FAMILY};">
                Apa yang bisa kamu nikmati:
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 4px 0; font-family: ${FONT_FAMILY}; font-size: 14px; line-height: 22px; color: ${COLORS.text};">
                    🗣️&nbsp; <strong>10+ bahasa daerah</strong> — Jawa, Sunda, Bali, Minang, dan lainnya
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: ${FONT_FAMILY}; font-size: 14px; line-height: 22px; color: ${COLORS.text};">
                    🤖&nbsp; <strong>Asisten AI</strong> — teman ngobrol yang sabar dan pintar
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: ${FONT_FAMILY}; font-size: 14px; line-height: 22px; color: ${COLORS.text};">
                    🏆&nbsp; <strong>Gamifikasi</strong> — XP, streak, lencana, & papan peringkat
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: ${FONT_FAMILY}; font-size: 14px; line-height: 22px; color: ${COLORS.text};">
                    📖&nbsp; <strong>Budaya & Sejarah</strong> — kenali Indonesia lebih dalam
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin: 0 0 4px; font-size: 15px; line-height: 24px; color: ${COLORS.text};">
          Cukup 5 menit sehari untuk mulai menguasai bahasa daerah pilihanmu. Yuk, langsung coba! 🚀
        </p>

        ${ctaButton("Mulai Belajar", `${siteUrl}/beranda`)}

        <p style="margin: 24px 0 0; font-size: 13px; line-height: 20px; color: ${COLORS.textMuted};">
          Punya pertanyaan? Balas email ini — kami dengan senang hati membantu.
        </p>
      </td>
    </tr>
    <tr><td style="height: 32px;"></td></tr>`;

  return wrapLayout(body, siteUrl, `Selamat datang di Nusa Lingua, ${name}! Mulai petualangan bahasa daerahmu.`);
}

// ---------------------------------------------------------------------------

interface AchievementEmailParams {
  name: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  siteUrl: string;
}

/**
 * Email notifikasi pencapaian / lencana baru.
 */
export function generateAchievementEmail({
  name,
  achievementName,
  achievementDescription,
  achievementIcon,
  siteUrl,
}: AchievementEmailParams): string {
  const body = `
    <tr>
      <td style="padding: 0 32px; font-family: ${FONT_FAMILY};">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: ${COLORS.primary};">
          Pencapaian Baru! 🎉
        </h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 26px; color: ${COLORS.text};">
          Hai <strong>${name}</strong>, keren banget! Kamu baru saja membuka pencapaian baru:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding: 28px 20px; background: linear-gradient(135deg, ${COLORS.bg}, #FEF9C3); border: 2px solid ${COLORS.secondary}; border-radius: 12px;">
              <div style="font-size: 48px; line-height: 1; margin-bottom: 12px;">
                ${achievementIcon || "🏅"}
              </div>
              <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: ${COLORS.primaryDark}; font-family: ${FONT_FAMILY};">
                ${achievementName}
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: ${COLORS.textMuted}; font-family: ${FONT_FAMILY};">
                ${achievementDescription}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 24px 0 0; font-size: 15px; line-height: 24px; color: ${COLORS.text};">
          Terus semangat belajar dan kumpulkan lebih banyak pencapaian! 💪
        </p>

        ${ctaButton("Lihat Pencapaian", `${siteUrl}/profil`, COLORS.secondary)}
      </td>
    </tr>
    <tr><td style="height: 32px;"></td></tr>`;

  return wrapLayout(body, siteUrl, `🏅 Selamat ${name}! Kamu mendapat pencapaian "${achievementName}".`);
}

// ---------------------------------------------------------------------------

interface StreakReminderEmailParams {
  name: string;
  currentStreak: number;
  siteUrl: string;
}

/**
 * Email pengingat streak — dikirim saat user belum belajar hari ini.
 */
export function generateStreakReminderEmail({
  name,
  currentStreak,
  siteUrl,
}: StreakReminderEmailParams): string {
  const body = `
    <tr>
      <td style="padding: 0 32px; font-family: ${FONT_FAMILY};">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: ${COLORS.streakOrange};">
          Streak-mu dalam bahaya! 🔥
        </h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 26px; color: ${COLORS.text};">
          Hai <strong>${name}</strong>, jangan sampai streak harianmu terputus!
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding: 24px; background-color: #FFF7ED; border: 2px dashed ${COLORS.streakOrange}; border-radius: 12px;">
              <div style="font-size: 48px; line-height: 1; margin-bottom: 4px;">🔥</div>
              <div style="font-size: 48px; font-weight: 900; color: ${COLORS.streakOrange}; font-family: ${FONT_FAMILY}; line-height: 1.1;">
                ${currentStreak}
              </div>
              <div style="font-size: 14px; font-weight: 600; color: ${COLORS.textMuted}; font-family: ${FONT_FAMILY}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                hari berturut-turut
              </div>
            </td>
          </tr>
        </table>

        <p style="margin: 24px 0 0; font-size: 15px; line-height: 24px; color: ${COLORS.text};">
          Cukup selesaikan <strong>1 pelajaran singkat</strong> untuk menjaga streak-mu tetap hidup. Hanya butuh 5 menit! ⏱️
        </p>

        ${ctaButton("Lanjutkan Belajar", `${siteUrl}/belajar`, COLORS.streakOrange)}

        <p style="margin: 20px 0 0; font-size: 13px; line-height: 20px; color: ${COLORS.textMuted};">
          Konsistensi adalah kunci — ${currentStreak} hari bukan pencapaian kecil, lho!
        </p>
      </td>
    </tr>
    <tr><td style="height: 32px;"></td></tr>`;

  return wrapLayout(body, siteUrl, `🔥 ${name}, streak ${currentStreak} harimu hampir berakhir! Belajar sebentar yuk.`);
}

// ---------------------------------------------------------------------------

interface WeeklyProgressEmailParams {
  name: string;
  xpGained: number;
  lessonsCompleted: number;
  wordsLearned: number;
  streak: number;
  rank?: number;
  siteUrl: string;
}

/**
 * Email ringkasan progres mingguan.
 */
export function generateWeeklyProgressEmail({
  name,
  xpGained,
  lessonsCompleted,
  wordsLearned,
  streak,
  rank,
  siteUrl,
}: WeeklyProgressEmailParams): string {
  function statCard(emoji: string, value: string | number, label: string) {
    return `
      <td class="stat-card" width="25%" style="padding: 4px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding: 16px 8px; background-color: ${COLORS.bg}; border-radius: 8px; border: 1px solid ${COLORS.border};">
              <div style="font-size: 24px; line-height: 1; margin-bottom: 4px;">${emoji}</div>
              <div style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; font-family: ${FONT_FAMILY}; line-height: 1.2;">
                ${typeof value === "number" ? value.toLocaleString("id-ID") : value}
              </div>
              <div style="font-size: 11px; font-weight: 600; color: ${COLORS.textMuted}; font-family: ${FONT_FAMILY}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                ${label}
              </div>
            </td>
          </tr>
        </table>
      </td>`;
  }

  const rankSection = rank
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 16px;">
      <tr>
        <td align="center" style="padding: 16px; background: linear-gradient(135deg, ${COLORS.primaryDarker}, ${COLORS.primary}); border-radius: 8px;">
          <p style="margin: 0; font-family: ${FONT_FAMILY}; font-size: 14px; color: rgba(255,255,255,0.85);">
            Peringkat kamu minggu ini
          </p>
          <p style="margin: 4px 0 0; font-family: ${FONT_FAMILY}; font-size: 28px; font-weight: 900; color: #ffffff;">
            🏆 #${rank}
          </p>
        </td>
      </tr>
    </table>`
    : "";

  const body = `
    <tr>
      <td style="padding: 0 32px; font-family: ${FONT_FAMILY};">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: ${COLORS.primary};">
          Ringkasan Mingguanmu 📊
        </h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 26px; color: ${COLORS.text};">
          Hai <strong>${name}</strong>, ini progres belajarmu selama seminggu terakhir:
        </p>

        <!--[if mso]>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <![endif]-->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            ${statCard("⚡", xpGained, "XP")}
            ${statCard("📚", lessonsCompleted, "Pelajaran")}
            ${statCard("💬", wordsLearned, "Kata")}
            ${statCard("🔥", streak, "Streak")}
          </tr>
        </table>
        <!--[if mso]>
        </tr>
        </table>
        <![endif]-->

        ${rankSection}

        <p style="margin: 24px 0 0; font-size: 15px; line-height: 24px; color: ${COLORS.text};">
          ${xpGained > 0 ? "Kerja bagus! Terus tingkatkan dan raih pencapaian baru minggu depan. 🚀" : "Minggu ini agak sepi — tidak apa-apa, yuk mulai lagi! Cukup 5 menit sehari. 💪"}
        </p>

        ${ctaButton("Lanjut Belajar", `${siteUrl}/beranda`)}
      </td>
    </tr>
    <tr><td style="height: 32px;"></td></tr>`;

  return wrapLayout(body, siteUrl, `📊 Progres mingguan ${name}: ${xpGained} XP, ${lessonsCompleted} pelajaran, streak ${streak} hari.`);
}
