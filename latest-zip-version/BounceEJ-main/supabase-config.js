window.BOUNCE_EJ_SUPABASE = {
  url: "https://imhorwdmvhguvsayleqr.supabase.co",
  publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaG9yd2RtdmhndXZzYXlsZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTQ4MjMsImV4cCI6MjA5MzIzMDgyM30.r0rKsHkIAQ8GrUPCY0rYS1z-8rT7fTGDRJfWU6RSNWM"
};

window.getBounceEJSupabaseClient = function getBounceEJSupabaseClient() {
  const config = window.BOUNCE_EJ_SUPABASE;

  if (window.supabaseClient) {
    return window.supabaseClient;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function" || !config || !config.url || !config.publishableKey) {
    return null;
  }

  window.supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
  return window.supabaseClient;
};

window.whenBounceEJSupabaseClient = function whenBounceEJSupabaseClient(timeoutMs = 12000) {
  const existingClient = window.getBounceEJSupabaseClient();

  if (existingClient) {
    return Promise.resolve(existingClient);
  }

  const sdkReady = window.BounceEJSupabaseReady || Promise.resolve(false);
  const timeout = new Promise((resolve) => {
    window.setTimeout(() => resolve(false), timeoutMs);
  });

  return Promise.race([sdkReady, timeout]).then(() => window.getBounceEJSupabaseClient());
};
