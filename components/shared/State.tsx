import type { ReactNode } from "react";

export function EmptyState({ children = "Kayıt yok." }: { children?: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function StatusMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="status">{message}</p>;
}
