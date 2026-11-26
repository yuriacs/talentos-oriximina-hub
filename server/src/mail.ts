// Envio de e-mails pelo SMTP institucional.
import nodemailer, { type Transporter } from 'nodemailer';
import { config, emailEnabled } from './config.js';

let transport: Transporter | null = null;

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
  }
  return transport;
}

/** Testa a conexão e o login no SMTP (usado ao iniciar a API) */
export async function verifySmtp(): Promise<string | null> {
  if (!emailEnabled()) return null;
  try {
    await getTransport().verify();
    return null;
  } catch (err) {
    return (err as Error).message;
  }
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function send(to: string, subject: string, intro: string, buttonText: string, link: string, outro: string) {
  if (!emailEnabled()) throw new Error('Envio de e-mail não configurado (SMTP_HOST)');
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
    <h2 style="color:#0f766e">Observatório da Juventude</h2>
    <p>${escapeHtml(intro)}</p>
    <p style="margin:28px 0"><a href="${link}" style="background:#0f766e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${escapeHtml(buttonText)}</a></p>
    <p style="font-size:13px;color:#6b7280">${escapeHtml(outro)}</p>
    <p style="font-size:12px;color:#9ca3af">Prefeitura Municipal de Oriximiná — Secretaria Municipal da Juventude (SEMJU)</p>
  </div>`;
  const text = `${intro}\n\n${buttonText}: ${link}\n\n${outro}\n\nPrefeitura Municipal de Oriximiná — SEMJU`;
  await getTransport().sendMail({ from: config.smtp.from, to, subject, html, text });
}

export const sendConfirmationEmail = (to: string, link: string) =>
  send(to, 'Confirme seu e-mail — Observatório da Juventude',
    'Recebemos seu cadastro no Observatório da Juventude de Oriximiná. Confirme seu e-mail para ativar a conta.',
    'Confirmar e-mail', link,
    'O link vale por 48 horas. Se você não fez esse cadastro, ignore esta mensagem.');

export const sendPasswordResetEmail = (to: string, link: string) =>
  send(to, 'Redefinição de senha — Observatório da Juventude',
    'Recebemos um pedido para redefinir a senha da sua conta.',
    'Criar nova senha', link,
    'O link vale por 1 hora. Se você não pediu, ignore esta mensagem: sua senha continua a mesma.');
