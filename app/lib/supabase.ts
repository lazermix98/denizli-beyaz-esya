export type DbRecord = Record<string, unknown>;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getPublicSupabaseConfig() {
  return {
    url: getSupabaseUrl() || "",
    anonKey: getAnonKey() || "",
  };
}

export function isDatabaseConfigured() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function isPublicSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getAnonKey());
}

export function requirePublicSupabaseConfig() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getAnonKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase public client yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ayarlayın."
    );
  }

  return { supabaseUrl, supabaseKey };
}

export function requireServerSupabaseConfig() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getServiceRoleKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase server bağlantısı eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY değerlerini ayarlayın."
    );
  }

  return { supabaseUrl, supabaseKey };
}

export async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { publicClient?: boolean } = {}
): Promise<T> {
  const config = options.publicClient ? requirePublicSupabaseConfig() : requireServerSupabaseConfig();
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${config.supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase isteği başarısız: ${response.status} ${detail}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function insertOne<T extends DbRecord = DbRecord>(table: string, payload: DbRecord) {
  const rows = await supabaseRequest<T[]>(table, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return rows[0];
}

export async function selectRows<T>(tableAndQuery: string) {
  return supabaseRequest<T[]>(tableAndQuery, { method: "GET" });
}

export async function insertAdminRow<T extends DbRecord>(table: string, payload: T) {
  return insertOne<T>(table, payload);
}

export async function updateAdminRow<T extends DbRecord>(table: string, id: string, payload: T) {
  const rows = await supabaseRequest<T[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return rows[0];
}

export async function deleteAdminRow(table: string, id: string) {
  await supabaseRequest<null>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}
