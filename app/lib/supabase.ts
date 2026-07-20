export type DbRecord = Record<string, unknown>;

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && serviceRoleKey());
}

export function isPublicSupabaseConfigured() {
  return Boolean(supabaseUrl() && anonKey());
}

function serverConfig() {
  const url = supabaseUrl();
  const key = serviceRoleKey();
  if (!url || !key) {
    throw new Error("Supabase bağlantısı eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ayarlanmalı.");
  }
  return { url, key };
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = serverConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase isteği başarısız: ${response.status} ${detail}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function supabaseCount(path: string) {
  const config = serverConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase sayım isteği başarısız: ${response.status} ${detail}`);
  }

  const range = response.headers.get("content-range") || "0-0/0";
  return Number(range.split("/")[1] || 0);
}

export async function selectRows<T>(query: string) {
  return supabaseRequest<T[]>(query);
}

export async function insertRow<T extends DbRecord = DbRecord>(table: string, payload: DbRecord) {
  const rows = await supabaseRequest<T[]>(table, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return rows[0];
}

export async function updateRow<T extends DbRecord = DbRecord>(table: string, id: string, payload: DbRecord) {
  const rows = await supabaseRequest<T[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return rows[0];
}

export async function deleteRow(table: string, id: string) {
  await supabaseRequest<null>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function updateTenantRow<T extends DbRecord = DbRecord>(
  table: string,
  id: string,
  companyId: string,
  payload: DbRecord
) {
  const rows = await supabaseRequest<T[]>(
    `${table}?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(companyId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ ...payload, company_id: companyId }),
    }
  );
  return rows[0] ?? null;
}

export async function deleteTenantRow(table: string, id: string, companyId: string) {
  await supabaseRequest<null>(
    `${table}?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(companyId)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }
  );
}
