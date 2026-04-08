/** Exibe telefone brasileiro como (DD) 9 XXXX-XXXX (celular) ou (DD) XXXX-XXXX (fixo). */
export function formatBrazilPhoneDisplay(input: string | null | undefined): string {
  if (!input?.trim()) return "";
  const digits = input.replace(/\D/g, "");
  if (!digits.length) return input.trim();

  let n = digits;
  if (n.startsWith("55") && (n.length === 12 || n.length === 13)) {
    n = n.slice(2);
  }

  if (n.length === 11) {
    return `(${n.slice(0, 2)}) ${n[2]} ${n.slice(3, 7)}-${n.slice(7)}`;
  }
  if (n.length === 10) {
    return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  }
  if (n.length === 9) {
    return `${n[0]} ${n.slice(1, 5)}-${n.slice(5)}`;
  }
  if (n.length === 8) {
    return `${n.slice(0, 4)}-${n.slice(4)}`;
  }

  return input.trim();
}
