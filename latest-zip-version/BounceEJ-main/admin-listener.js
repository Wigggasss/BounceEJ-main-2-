(function() {
    function getSupabaseClient() {
        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        const config = window.BOUNCE_EJ_SUPABASE;
        if (!window.supabase || !config || !config.url || !config.publishableKey) {
            console.warn("Supabase SDK is unavailable; admin commands are offline.");
            return null;
        }

        window.supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
        return window.supabaseClient;
    }

    const client = getSupabaseClient();
    if (!client) {
        return;
    }

    const admin = client.channel('admin_control');

    admin.on('broadcast', { event: 'remote_lock' }, ({ payload }) => {
        if (!payload || !payload.id) {
            return;
        }

        const btn = document.getElementById(payload.id);
        if (btn) {
            btn.disabled = Boolean(payload.locked);

            const label = btn.querySelector('span:not(.menu-emoji):not(.lock-icon)');
            if (label && payload.text) {
                label.innerText = payload.text;
            }

            btn.style.opacity = payload.locked ? "0.5" : "1";
            btn.style.filter = payload.locked ? "grayscale(100%)" : "none";
            btn.style.pointerEvents = payload.locked ? "none" : "auto";
        }
    })
    .on('broadcast', { event: 'remote_debug' }, ({ payload }) => {
        if (!payload || !payload.code) {
            return;
        }

        const errorCodes = {
            101: "DATABASE_STALE: Reloading schema...",
            404: "TABLE_MISSING: Check Supabase Dashboard.",
            888: "MAINTENANCE: Game features are being updated.",
            999: "FORCE_RELOAD: Refreshing page for updates..."
        };

        const msg = errorCodes[payload.code] || "UNKNOWN_DEBUG_CODE";
        console.warn(`[ADMIN] Code ${payload.code}: ${msg}`);

        if (payload.code === '999') {
            window.location.reload();
        } else {
            alert(`Admin Message (${payload.code}):\n${msg}`);
        }
    })
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log("Admin listener connected to Supabase.");
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'A') {
            const panel = document.getElementById('adminPanelUI');
            if (panel) {
                panel.classList.toggle('hidden');
                console.log("Admin Mode Toggled");
            }
        }
    });
})();
