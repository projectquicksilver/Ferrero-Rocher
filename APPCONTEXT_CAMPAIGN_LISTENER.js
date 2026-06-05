// ============================================================
//  COPY THIS TO AppContext.jsx
//  Add this realtime listener for campaign notifications
// ============================================================

// Place this code INSIDE the useEffect that starts around line 432
// AFTER the existing ordersChannel, profileChannel, notifChannel subscriptions

// ─── CAMPAIGN NOTIFICATIONS (REALTIME) ──────────────────────
const campaignChannel = supabase
  .channel('realtime-campaigns-' + user.id)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('🎁 New Campaign Notification Received:', payload.new);

      if (payload.new.campaign_id) {
        // Create notification object
        const newNotif = {
          id: payload.new.id,
          campaign_id: payload.new.campaign_id,
          title: payload.new.title,
          body: payload.new.body,
          image_url: payload.new.image_url,
          action_url: payload.new.action_url,
          role: payload.new.role,
          isRead: payload.new.is_read,
          time: 'Just now'
        };

        // Add to notifications list at top
        setNotificationsState(prev => [newNotif, ...prev]);

        // Show a branded toast
        // Uncomment if you have showToast function:
        // showToast(`🎁 ${payload.new.title}`);

        // Optional: Show global popup (special banner)
        showGlobalPopup({
          title: payload.new.title,
          message: payload.new.body,
          type: 'campaign',
          icon: 'campaign'
        });

        console.log('✅ Campaign notification added to state');
      }
    }
  )
  .subscribe((status) => {
    console.log('📡 Campaign channel status:', status);
  });

// ============================================================

// THEN IN THE RETURN CLEANUP FUNCTION (around line 665):
// Add this line to the existing cleanup:

return () => {
  supabase.removeChannel(ordersChannel);
  supabase.removeChannel(profileChannel);
  supabase.removeChannel(notifChannel);
  supabase.removeChannel(campaignChannel);  // ← ADD THIS LINE
};

// ============================================================
//  FULL CONTEXT OF WHERE TO PUT IT
// ============================================================

/*

  // ─── SUBSCRIBER CORE (LOAD & SUBSCRIBE REALTIME FROM DATABASE) ───
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    // Load initial data...
    const loadInitialData = async () => { ... };
    loadInitialData();

    // EXISTING CHANNELS...
    const ordersChannel = supabase.channel(...);
    const profileChannel = supabase.channel(...);
    const notifChannel = supabase.channel(...);

    // ────────────────────────────────────────────────────────────
    // 👇 ADD THE campaignChannel CODE HERE 👇
    // ────────────────────────────────────────────────────────────

    const campaignChannel = supabase
      .channel('realtime-campaigns-' + user.id)
      .on('postgres_changes', { ... })
      .subscribe();

    // ────────────────────────────────────────────────────────────

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(campaignChannel);  // ← ADD THIS
    };
  }, [user?.id, user?.role]);

*/

// ============================================================
//  OPTIONAL: Add this to Notifications.jsx
//  To show a "Campaign" badge next to campaign notifs
// ============================================================

/*

In src/screens/Notifications.jsx, find the notification map:

{myNotifs.map(n => (
  <div key={n.id} style={{ background: 'var(--bg2)', padding: '1rem', borderRadius: 'var(--r12)', border: '1px solid var(--bdr)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
      <h4 style={{ fontSize: '.9rem', fontWeight: 800 }}>{n.title}</h4>

      {/* ADD THESE LINES: */}
      {n.campaign_id && (
        <span style={{
          background: 'rgba(212,165,116,.15)',
          color: '#d4a574',
          fontSize: '.65rem',
          fontWeight: 700,
          padding: '.2rem .5rem',
          borderRadius: '4px',
          marginRight: '0.5rem'
        }}>
          📣 Campaign
        </span>
      )}
      {/* END ADD */}

      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--e4)' }}></span>}
    </div>
    <p style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.4 }}>{n.body}</p>
  </div>
))}

*/

// ============================================================
//  OPTIONAL: Add campaign banner to Home.jsx
//  Shows active campaigns prominently
// ============================================================

/*

In src/screens/Home.jsx, after the wallet section (around line 145):

// Add this code:
const activeCampaigns = notifications.filter(n =>
  n.campaign_id && !n.isRead && n.role === 'retailer'
);

{activeCampaigns.length > 0 && (
  <div className="au" style={{
    background: 'linear-gradient(135deg, rgba(212,165,116,.1), rgba(196,30,58,.1))',
    border: '1px solid rgba(212,165,116,.2)',
    borderRadius: 'var(--r12)',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📣</span>
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize: '.85rem',
        fontWeight: 800,
        marginBottom: '.2rem',
        color: 'var(--t1)'
      }}>
        🎁 Special Offer from Ferrero!
      </p>
      <p style={{
        fontSize: '.75rem',
        color: 'var(--t2)',
        lineHeight: 1.4
      }}>
        {activeCampaigns[0].body.slice(0, 100)}...
      </p>
    </div>
    <button
      onClick={() => navigate('/notifications')}
      style={{
        marginLeft: 'auto',
        background: 'var(--g4)',
        color: '#000',
        border: 'none',
        padding: '.4rem .8rem',
        borderRadius: '.5rem',
        fontWeight: 700,
        cursor: 'pointer',
        flexShrink: 0,
        fontSize: '.75rem'
      }}
    >
      View
    </button>
  </div>
)}

*/

// ============================================================
//  HOW TO TEST THE REALTIME
// ============================================================

/*

1. Open two browser tabs:
   - Tab A: Your app logged in as retailer (phone: 9900000001)
   - Tab B: Campaign portal (http://localhost:5173/campaign-portal?access=ferrero-admin-2025)

2. In Tab B:
   - Fill campaign form
   - Click "Launch Campaign"
   - Wait for success screen

3. In Tab A:
   - Should see toast notification immediately
   - Notification should appear in list without page refresh
   - Check console: you should see "🎁 New Campaign Notification Received"

4. Verify in Supabase:
   - Go to SQL Editor
   - Run: SELECT * FROM notifications WHERE campaign_id IS NOT NULL ORDER BY created_at DESC LIMIT 1;
   - Should see the campaign notification you just sent

5. Check AppContext state:
   - In browser console, type: console.log(window.appContext) (if you expose it)
   - Or just verify notifications array has new item

*/
