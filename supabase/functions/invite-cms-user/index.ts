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
  const siteUrl = Deno.env.get("SITE_URL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !siteUrl) {
    return jsonResponse({ error: "Admin invitations are not configured on the server." }, 500);
  }

  let redirectTo: string;
  try {
    const parsedSiteUrl = new URL(siteUrl);
    if (parsedSiteUrl.protocol !== "https:" && parsedSiteUrl.hostname !== "localhost") {
      return jsonResponse({ error: "Admin invitations require an HTTPS site URL." }, 500);
    }
    redirectTo = new URL("/retailer/setup-password", parsedSiteUrl).toString();
  } catch {
    return jsonResponse({ error: "The configured site URL is invalid." }, 500);
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
    return jsonResponse({ error: "Only CMS admins can invite CMS users." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "A valid admin email address is required." }, 400);
  }
  const emailValue = isRecord(body) ? body.email : null;
  if (typeof emailValue !== "string" || emailValue.length > 254) {
    return jsonResponse({ error: "A valid CMS user email address is required." }, 400);
  }
  const email = emailValue.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Enter a valid CMS user email address." }, 400);
  }
  const role = isRecord(body) ? body.role : null;
  if (role !== "admin" && role !== "store_manager") {
    return jsonResponse({ error: "Choose either the admin or store manager role." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let existingUser: User | undefined;
  for (let page = 1; page <= 100; page += 1) {
    const { data, error: listError } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (listError) {
      return jsonResponse({ error: `Could not check for an existing account: ${listError.message}` }, 500);
    }
    existingUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (existingUser || data.users.length < 1000) break;
    if (page === 100) {
      return jsonResponse({ error: "Could not safely complete the account lookup. Contact the project owner." }, 500);
    }
  }

  if (existingUser) {
    return jsonResponse({
      error: "An account already exists for this email. Ask the project owner to review and assign access manually.",
    }, 409);
  }

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    { redirectTo },
  );
  if (inviteError || !inviteData.user) {
    return jsonResponse({
      error: `Could not send the admin invitation: ${inviteError?.message ?? "Supabase did not return the invited account."}`,
    }, 502);
  }

  const { error: roleError } = await adminClient.auth.admin.updateUserById(inviteData.user.id, {
    app_metadata: { ...inviteData.user.app_metadata, role },
  });
  if (roleError) {
    return jsonResponse({
      error: `The invitation was sent, but the ${role} role could not be assigned: ${roleError.message}. Contact the project owner before the recipient signs in.`,
    }, 500);
  }

  return jsonResponse({ status: "invited", role }, 200);
});
