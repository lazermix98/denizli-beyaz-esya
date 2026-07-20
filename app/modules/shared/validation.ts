export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> };

export function cleanText(value: unknown, max = 500) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function isMobilePhone(value: string) {
  return /^0?5\d{9}$/.test(value.replace(/\s/g, ""));
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function requireLength(errors: Record<string, string>, key: string, value: string, min: number, max: number) {
  if (value.length < min) errors[key] = `En az ${min} karakter olmalı.`;
  if (value.length > max) errors[key] = `En fazla ${max} karakter olmalı.`;
}
