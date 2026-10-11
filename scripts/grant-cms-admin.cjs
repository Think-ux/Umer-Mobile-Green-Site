const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) {
    throw new Error(".env.local was not found.");
  }

  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const uid = process.env.CMS_ADMIN_UID;

  if (!url || !key || !uid) {
    throw new Error(
      "Missing Supabase URL, service role key, or CMS_ADMIN_UID. Check .env.local."
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabase.auth.admin.getUserById(uid);
  if (error) throw error;
  if (!data.user) throw new Error("User not found in this Supabase project.");

  const { error: updateError } = await supabase.auth.admin.updateUserById(uid, {
    app_metadata: { ...data.user.app_metadata, role: "admin" }
  });

  if (updateError) throw updateError;

  console.log("Success: CMS admin role assigned.");
  console.log("Sign out and sign in again to refresh your session.");
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exitCode = 1;
});
