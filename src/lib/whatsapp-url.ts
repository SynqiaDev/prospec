/** Monta o link wa.me a partir do texto salvo (apenas dígitos na URL). */
export function buildWhatsappHref(
  input: string | null | undefined,
): string | null {
  if (!input?.trim()) return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/55${digits}`;
}
