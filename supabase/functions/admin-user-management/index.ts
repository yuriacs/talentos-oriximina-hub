import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generateTempPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const nums = "23456789";
  const syms = "!@#$%&*";
  const all = upper + lower + nums + syms;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = pick(upper) + pick(lower) + pick(nums) + pick(syms);
  for (let i = pwd.length; i < length; i++) pwd += pick(all);
  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify admin role
    const { data: roleCheck } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    if (action === "list_users") {
      const search = (body?.search ?? "").toString().toLowerCase().trim();

      // Fetch up to 1000 users; merge with profiles for name lookup
      const { data: usersList, error: listErr } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) throw listErr;

      const userIds = usersList.users.map((u) => u.id);
      const { data: profiles } = await admin
        .from("profiles")
        .select("user_id, full_name, id")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p]),
      );

      let merged = usersList.users.map((u) => {
        const p = profileMap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "",
          full_name:
            (p?.full_name as string) ??
            (u.user_metadata?.full_name as string) ??
            "",
          profile_id: (p?.id as string) ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
        };
      });

      if (search) {
        merged = merged.filter(
          (u) =>
            u.email.toLowerCase().includes(search) ||
            u.full_name.toLowerCase().includes(search),
        );
      }

      merged.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return new Response(
        JSON.stringify({ users: merged.slice(0, 200) }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "reset_password") {
      const targetUserId = body?.user_id as string;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tempPassword = generateTempPassword(12);
      const { error: updErr } = await admin.auth.admin.updateUserById(
        targetUserId,
        { password: tempPassword },
      );
      if (updErr) throw updErr;

      await admin.from("admin_logs").insert({
        admin_id: callerId,
        action: "admin_password_reset",
        target_id: targetUserId,
      });

      return new Response(
        JSON.stringify({ temp_password: tempPassword }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "send_recovery_link") {
      const email = body?.email as string;
      if (!email) {
        return new Response(JSON.stringify({ error: "email required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const redirectTo = (body?.redirect_to as string) ?? undefined;

      const { error: linkErr } = await admin.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );
      if (linkErr) throw linkErr;

      await admin.from("admin_logs").insert({
        admin_id: callerId,
        action: "admin_sent_recovery_link",
        details: { email },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-user-management error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
