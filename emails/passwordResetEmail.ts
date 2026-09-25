// Template provisório. O design final vem do Claude Design.
export function passwordResetEmail(name: string, url: string) {
  return {
    subject: "Trocar sua senha do SPOP!",
    text: `Oi, ${name}.\n\nPra criar uma senha nova, abre este link (vale por 1 hora):\n${url}\n\nSe não foi você, ignora. Sua pobreza continua segura.`,
    html: `<p>Oi, ${escapeHtml(name)}.</p><p>Pra criar uma senha nova, abre este link (vale por 1 hora):</p><p><a href="${url}">Trocar senha</a></p><p>Se não foi você, ignora. Sua pobreza continua segura.</p>`,
  };
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
