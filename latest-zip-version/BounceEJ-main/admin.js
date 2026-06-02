(function() {
    function getSupabaseClient() {
        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        const config = window.BOUNCE_EJ_SUPABASE;
        if (!window.supabase || !config || !config.url || !config.publishableKey) {
            console.warn("Supabase SDK is unavailable; admin panel commands are offline.");
            return null;
        }

        window.supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
        return window.supabaseClient;
    }

    const client = getSupabaseClient();
    if (!client) {
        return;
    }

    const adminChannel = client.channel('admin_control');
    adminChannel.subscribe();

    window.sendButtonCommand = function(buttonId, isLocked, newText) {
        adminChannel.send({
            type: 'broadcast',
            event: 'remote_lock',
            payload: { id: buttonId, locked: isLocked, text: newText }
        });
    };
})();
