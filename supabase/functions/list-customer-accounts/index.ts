import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function metadataName(user: User) {
  const metadata = user.user_metadata;
  for (const key of ["full_name", "name", "display_name", "business_name"]) {
    const value: unknown = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

const pageSize = 50;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Admin sign-in is required." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Account management is not configured on the server." }, 500);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData.user) {
    return jsonResponse({ error: "Your admin session is invalid or expired. Sign in again." }, 401);
  }
  if (callerData.user.app_metadata.role !== "admin") {
    return jsonResponse({ error: "Only CMS admins can view registered accounts." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "A valid account-list request is required." }, 400);
  }
  const pageValue = isRecord(body) ? body.page : null;
  const page = typeof pageValue === "number" && Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const source = isRecord(body) && typeof body.source === "string" ? body.source : "registered";
  if (!["registered", "retailer-applications", "guest-orders"].includes(source)) {
    return jsonResponse({ error: "Choose registered accounts, retailer applications, or guest orders." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const offset = (page - 1) * pageSize;

  if (source === "retailer-applications") {
    const { data, error: queryError } = await adminClient
      .from("retailer_applications")
      .select("id,owner_name,email,business_name,phone,city,status,created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize);
    if (queryError) {
      return jsonResponse({ error: `Could not load retailer applications: ${queryError.message}` }, 500);
    }
    const records = data.slice(0, pageSize).map((application) => ({
      id: `retailer-application-${application.id}`,
      email: application.email,
      phone: application.phone,
      name: application.owner_name,
      role: "retailer applicant",
      status: application.status,
      details: application.business_name,
      city: application.city,
      createdAt: application.created_at,
      lastSignInAt: null,
    }));
    return jsonResponse({ records, page, pageSize, hasMore: data.length > pageSize, source }, 200);
  }

  if (source === "guest-orders") {
    const { data, error: queryError } = await adminClient
      .from("customer_orders")
      .select("id,tracking_code,customer_name,phone,city,delivery_area,created_at")
      .eq("order_type", "Customer")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize);
    if (queryError) {
      return jsonResponse({ error: `Could not load guest checkout records: ${queryError.message}` }, 500);
    }
    const records = data.slice(0, pageSize).map((order) => ({
      id: `guest-order-${order.id}`,
      email: "",
      phone: order.phone,
      name: order.customer_name,
      role: "guest checkout",
      status: "order submitted",
      details: `Order ${order.tracking_code} · ${order.delivery_area}, ${order.city}`,
      city: order.city,
      createdAt: order.created_at,
      lastSignInAt: null,
    }));
    return jsonResponse({ records, page, pageSize, hasMore: data.length > pageSize, source }, 200);
  }

  const { data, error: listError } = await adminClient.auth.admin.listUsers({
    page,
    perPage: pageSize + 1,
  });
  if (listError) {
    return jsonResponse({ error: `Could not load registered accounts: ${listError.message}` }, 500);
  }

  const records = data.users.slice(0, pageSize).map((user) => ({
    id: user.id,
    email: user.email ?? "",
    phone: user.phone ?? "",
    name: metadataName(user),
    role: typeof user.app_metadata.role === "string" ? user.app_metadata.role : "customer",
    status: user.email_confirmed_at ? "email confirmed" : "email unconfirmed",
    details: "",
    city: "",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  }));

  return jsonResponse({
    records,
    page,
    pageSize,
    hasMore: data.users.length > pageSize,
    source,
  }, 200);
});
