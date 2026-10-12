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
    return jsonResponse({ error: "Retailer account setup is not configured on the server." }, 500);
  }

  let redirectTo: string;
  try {
    const parsedSiteUrl = new URL(siteUrl);
    if (parsedSiteUrl.protocol !== "https:" && parsedSiteUrl.hostname !== "localhost") {
      return jsonResponse({ error: "Retailer account setup requires an HTTPS site URL." }, 500);
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
    return jsonResponse({ error: "Only CMS admins can provision retailer access." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "A valid retailer application ID is required." }, 400);
  }
  const applicationId = isRecord(body) ? body.applicationId : null;
  if (typeof applicationId !== "number" || !Number.isSafeInteger(applicationId) || applicationId < 1) {
    return jsonResponse({ error: "A valid retailer application ID is required." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: application, error: applicationError } = await adminClient
    .from("retailer_applications")
    .select("id,email,business_name,status")
    .eq("id", applicationId)
    .maybeSingle();
  if (applicationError) {
    return jsonResponse({ error: `Could not verify the application: ${applicationError.message}` }, 500);
  }
  if (!application || application.status !== "approved") {
    return jsonResponse({ error: "Approve this retailer application before granting account access." }, 409);
  }

  const email = application.email.trim().toLowerCase();
  if (!email) {
    return jsonResponse({ error: "This application has no email address for account setup." }, 400);
  }

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
      return jsonResponse({ error: "Could not safely complete the account lookup. Contact the project administrator." }, 500);
    }
  }

  if (existingUser) {
    const role = existingUser.app_metadata.role;
    if (role && role !== "customer" && role !== "retailer") {
      return jsonResponse({ error: "This email already belongs to an account with a different privileged role." }, 409);
    }
    const { error: updateError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      app_metadata: { ...existingUser.app_metadata, role: "retailer" },
      user_metadata: {
        ...existingUser.user_metadata,
        business_name: application.business_name,
        retailer_application_id: String(application.id),
      },
    });
    if (updateError) {
      return jsonResponse({ error: `Could not enable retailer access: ${updateError.message}` }, 500);
    }
    return jsonResponse({ status: "existing_account" }, 200);
  }

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        business_name: application.business_name,
        retailer_application_id: String(application.id),
      },
      redirectTo,
    },
  );
  if (inviteError || !inviteData.user) {
    return jsonResponse({
      error: `Could not send the retailer invitation: ${inviteError?.message ?? "Supabase did not return the invited account."}`,
    }, 502);
  }

  const { error: roleError } = await adminClient.auth.admin.updateUserById(inviteData.user.id, {
    app_metadata: { ...inviteData.user.app_metadata, role: "retailer" },
  });
  if (roleError) {
    return jsonResponse({
      error: `The invitation was sent, but retailer access could not be assigned: ${roleError.message}. Retry access setup from the approved application.`,
    }, 500);
  }

  return jsonResponse({ status: "invited" }, 200);
});
