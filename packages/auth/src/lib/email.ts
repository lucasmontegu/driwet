// packages/auth/src/lib/email.ts
import { Resend } from "resend";
import { env } from "@gowai/env/server";

const resend = new Resend(env.RESEND_API_KEY);

interface MagicLinkEmailParams {
  email: string;
  url: string;
  isNativeApp?: boolean;
}

function getMagicLinkTemplate({ url, isNativeApp }: { url: string; isNativeApp?: boolean }) {
  // For native app, we need to convert the URL to use the gowai:// scheme
  const displayUrl = isNativeApp ? "la app de Gowai" : "Gowai";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inicia sesión en Gowai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 16px 24px; border-radius: 12px;">
                <span style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Gowai</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #18181b;">
                Inicia sesión en ${displayUrl}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #71717a; line-height: 1.6;">
                Haz clic en el botón de abajo para iniciar sesión de forma segura. Este enlace expirará en 10 minutos.
              </p>

              <!-- CTA Button -->
              <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                Iniciar sesión
              </a>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #a1a1aa;">
                Si no solicitaste este enlace, puedes ignorar este email de forma segura.
              </p>
            </td>
          </tr>

          <!-- Weather Icon -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background-color: #f0f9ff; border-radius: 8px;">
                <span style="font-size: 20px;">⛈️</span>
                <span style="font-size: 14px; color: #0369a1; font-weight: 500;">Tu co-piloto climático</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                © 2025 Gowai. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #d4d4d8;">
                Este enlace solo funciona una vez y expira en 10 minutos.
              </p>
            </td>
          </tr>
        </table>

        <!-- URL Fallback -->
        <table role="presentation" style="max-width: 480px; width: 100%; margin-top: 16px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ¿Problemas con el botón? Copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #a1a1aa; word-break: break-all;">
                ${url}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendMagicLinkEmail({ email, url, isNativeApp }: MagicLinkEmailParams) {
  const html = getMagicLinkTemplate({ url, isNativeApp });

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "🔐 Tu enlace de acceso a Gowai",
    html,
  });

  if (error) {
    console.error("Error sending magic link email:", error);
    throw new Error("Failed to send magic link email");
  }

  return data;
}
