(function() {
  const sources = [
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
    "https://unpkg.com/@supabase/supabase-js@2"
  ];

  if (window.supabase && typeof window.supabase.createClient === "function") {
    window.BounceEJSupabaseReady = Promise.resolve(true);
    return;
  }

  let settled = false;

  window.BounceEJSupabaseReady = new Promise((resolve) => {
    function finish(loaded) {
      if (settled) {
        return;
      }

      settled = true;
      resolve(loaded);
      window.dispatchEvent(new CustomEvent("bounceej:supabase-ready", {
        detail: { loaded }
      }));
    }

    function loadSource(index) {
      if (window.supabase && typeof window.supabase.createClient === "function") {
        finish(true);
        return;
      }

      if (index >= sources.length) {
        console.warn("Supabase SDK did not load from any configured CDN; online features are unavailable.");
        finish(false);
        return;
      }

      const script = document.createElement("script");
      let triedNextSource = false;
      const tryNextSource = () => {
        if (triedNextSource || settled) {
          return;
        }

        triedNextSource = true;
        loadSource(index + 1);
      };

      script.src = sources[index];
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.supabase && typeof window.supabase.createClient === "function") {
          finish(true);
        } else {
          tryNextSource();
        }
      };
      script.onerror = tryNextSource;
      window.setTimeout(tryNextSource, 5000);
      document.head.appendChild(script);
    }

    loadSource(0);
  });
})();
