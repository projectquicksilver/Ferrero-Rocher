// ============================================================
// ADD THESE TO src/context/AppContext.jsx
// Realtime listeners for campaigns, commissions, wallet updates
// And Ferrero theme color system
// ============================================================

// ─── ADD THESE STATE VARIABLES (in AppProvider component) ──────────────────

// Notifications & Campaigns
const [notifications, setNotificationsState] = useState(() =>
  loadFromStorage(STORAGE_KEYS.notifications, [])
);

// Active campaigns for this user
const [activeCampaigns, setActiveCampaigns] = useState([]);

// Commission earnings
const [commissionEarnings, setCommissionEarnings] = useState(0);

// Toast notifications
const [toastQueue, setToastQueue] = useState([]);

// ─── FERRERO ROCHER THEME COLORS ────────────────────────────────────────────

const FERRERO_THEME = {
  primary: '#d4a574',      // Gold - Main brand color
  secondary: '#c41e3a',    // Burgundy - Call-to-action
  accent: '#8b6f47',       // Dark gold - Accents
  light: '#f9f7f3',        // Cream - Light backgrounds
  lightGray: '#f5f5f5',    // Soft gray
  border: '#e5e5e5',       // Light border
  text: '#2d2d2d',         // Dark text
  textSecond: '#666',      // Secondary text
  textLight: '#999',       // Light text
};

// ─── TOAST NOTIFICATION SYSTEM ──────────────────────────────────────────────

const showToast = (message, type = 'info') => {
  const id = Date.now();
  const toastItem = { id, message, type };

  setToastQueue(prev => [...prev, toastItem]);

  // Auto remove after 3 seconds
  setTimeout(() => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  }, 3000);
};

// ─── CAMPAIGN NOTIFICATIONS LISTENER ────────────────────────────────────────

useEffect(() => {
  if (!isSupabaseConfigured || !user?.id) return;

  console.log('📡 Setting up campaign notifications listener');

  const campaignChannel = supabase
    .channel('campaigns-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_notifications',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('🎁 New Campaign Notification:', payload.new);

        const newNotif = {
          id: payload.new.id,
          title: payload.new.title,
          body: payload.new.body,
          offer_data: payload.new.offer_data,
          campaign_id: payload.new.campaign_id,
          is_read: false,
          is_claimed: false,
          created_at: payload.new.created_at,
          type: 'campaign'
        };

        // Add to notifications
        setNotificationsState(prev => [newNotif, ...prev]);

        // Show toast
        const offerType = payload.new.offer_data?.type;
        let emoji = '📣';
        if (offerType === 'commission') emoji = '💰';
        else if (offerType === 'discount') emoji = '🔥';
        else if (offerType === 'cashback') emoji = '💳';
        else if (offerType === 'combo') emoji = '🎁';

        showToast(`${emoji} ${payload.new.title}`, 'campaign');
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(campaignChannel);
  };
}, [user?.id]);

// ─── COMMISSION LEDGER LISTENER ────────────────────────────────────────────

useEffect(() => {
  if (!isSupabaseConfigured || !user?.id || user.role !== 'retailer') return;

  console.log('📡 Setting up commission ledger listener');

  const commissionChannel = supabase
    .channel('commissions-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'commission_ledger',
        filter: `retailer_id=eq.${user.id}`
      },
      (payload) => {
        console.log('💰 Commission Earned:', payload.new);

        const amount = parseFloat(payload.new.amount);
        setCommissionEarnings(prev => prev + amount);

        showToast(`💰 Earned ₹${amount.toFixed(2)} commission!`, 'success');
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(commissionChannel);
  };
}, [user?.id, user?.role]);

// ─── WALLET TRANSACTIONS LISTENER ──────────────────────────────────────────

useEffect(() => {
  if (!isSupabaseConfigured || !user?.id) return;

  console.log('📡 Setting up wallet transactions listener');

  const walletChannel = supabase
    .channel('wallet-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('💳 Wallet Updated:', payload.new);

        const newBalance = parseFloat(payload.new.balance_after);
        const amount = parseFloat(payload.new.amount);
        const type = payload.new.type;

        // Update wallet balance in user state
        setUserState(prev => ({
          ...prev,
          wallet: newBalance
        }));

        // Update storage
        const currentUser = loadFromStorage(STORAGE_KEYS.user, initialUser);
        saveToStorage(STORAGE_KEYS.user, {
          ...currentUser,
          wallet: newBalance
        });

        // Show appropriate toast
        const messages = {
          credit: `💳 Received ₹${amount.toFixed(2)}`,
          debit: `💸 Paid ₹${amount.toFixed(2)}`,
          commission: `💰 Commission: ₹${amount.toFixed(2)}`,
          cashback: `🎁 Cashback: ₹${amount.toFixed(2)}`,
          refund: `↩️ Refund: ₹${amount.toFixed(2)}`
        };

        showToast(messages[type] || `Wallet updated by ₹${amount.toFixed(2)}`, 'wallet');
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(walletChannel);
  };
}, [user?.id]);

// ─── CARTON ORDERS LISTENER (Distributor view) ────────────────────────────

useEffect(() => {
  if (!isSupabaseConfigured || !user?.id || user.role !== 'distributor') return;

  console.log('📡 Setting up carton orders listener');

  const ordersChannel = supabase
    .channel('orders-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'carton_orders',
        filter: `distributor_id=eq.${user.id}`
      },
      (payload) => {
        console.log('📦 New Order Received:', payload.new);

        showToast(`📦 New order received!`, 'success');

        // Update orders state
        setDistOrdersState(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(ordersChannel);
  };
}, [user?.id, user?.role]);

// ─── FETCH ACTIVE CAMPAIGNS ───────────────────────────────────────────────

const loadActiveCampaigns = async () => {
  if (!isSupabaseConfigured || !user?.id) return;

  try {
    const { data, error } = await supabase
      .from('offer_campaigns')
      .select('*')
      .eq('is_active', true)
      .eq('target_role', user.role === 'retailer' ? 'retailer' : 'distributor')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .limit(10);

    if (error) throw error;

    setActiveCampaigns(data || []);
    console.log('📋 Active campaigns loaded:', data?.length || 0);
  } catch (error) {
    console.error('Error loading campaigns:', error);
  }
};

// Load campaigns on mount
useEffect(() => {
  loadActiveCampaigns();
  const interval = setInterval(loadActiveCampaigns, 60000); // Refresh every minute
  return () => clearInterval(interval);
}, [user?.id]);

// ─── APPLY COMMISSION TO SALE ──────────────────────────────────────────────

const applySaleCommission = async (productId, piecesSold, pricePerPiece) => {
  if (!isSupabaseConfigured || !user?.id || user.role !== 'retailer') return null;

  try {
    // Find campaign for this product
    const campaign = activeCampaigns.find(c => {
      const productIds = c.product_ids || [];
      return productIds.some(p => p.id === productId);
    });

    if (!campaign || campaign.offer_type !== 'commission') {
      return { commission: 0, cashback: 0 };
    }

    // Check if sale meets minimum quantity
    if (piecesSold < campaign.commission_min_qty) {
      return { commission: 0, cashback: 0 };
    }

    // Calculate earnings
    const baseTotal = piecesSold * pricePerPiece;
    let commission = 0;
    let cashback = 0;

    if (campaign.offer_type === 'commission') {
      commission = (baseTotal * campaign.commission_pct) / 100;
    } else if (campaign.offer_type === 'cashback') {
      cashback = piecesSold * campaign.cashback_amount;
    }

    // Call RPC function to process sale
    const { data, error } = await supabase.rpc('process_customer_sale', {
      p_product_id: productId,
      p_pieces_sold: piecesSold,
      p_piece_price: pricePerPiece,
      p_campaign_id: campaign.id
    });

    if (error) throw error;

    console.log('💰 Sale processed with commission:', data);
    return data[0];
  } catch (error) {
    console.error('Error applying commission:', error);
    return { commission: 0, cashback: 0 };
  }
};

// ─── APPLY DISCOUNT TO ORDER ────────────────────────────────────────────────

const applyOrderDiscount = async (productId, quantityCartons) => {
  if (!isSupabaseConfigured) return null;

  try {
    // Find campaign for this product
    const campaign = activeCampaigns.find(c => {
      const productIds = c.product_ids || [];
      return productIds.some(p => p.id === productId);
    });

    if (!campaign || campaign.offer_type !== 'discount') {
      return { discount_pct: 0, discount_amount: 0 };
    }

    // Check if order meets minimum quantity
    if (quantityCartons < campaign.discount_min_qty) {
      return { discount_pct: 0, discount_amount: 0 };
    }

    return {
      discount_pct: campaign.discount_pct,
      campaign_id: campaign.id
    };
  } catch (error) {
    console.error('Error applying discount:', error);
    return { discount_pct: 0, discount_amount: 0 };
  }
};

// ─── MARK CAMPAIGN AS CLAIMED ──────────────────────────────────────────────

const claimCampaign = async (campaignId) => {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('campaign_notifications')
      .update({ is_claimed: true })
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id);

    if (error) throw error;

    showToast('✓ Offer claimed!', 'success');
    return true;
  } catch (error) {
    console.error('Error claiming campaign:', error);
    return false;
  }
};

// ─── CONTEXT VALUE TO EXPORT ──────────────────────────────────────────────

// Add these to the value object being returned:
const value = {
  // ... existing values ...

  // Ferrero Theme
  FERRERO_THEME,

  // Notifications & Campaigns
  notifications,
  activeCampaigns,
  commissionEarnings,
  toastQueue,

  // Functions
  showToast,
  applySaleCommission,
  applyOrderDiscount,
  claimCampaign,
  loadActiveCampaigns,
};

// ============================================================
// USAGE IN COMPONENTS
// ============================================================

/*
// In any component:
const {
  FERRERO_THEME,
  notifications,
  activeCampaigns,
  applySaleCommission,
  showToast,
  claimCampaign
} = useAppContext();

// Apply commission on sale:
const result = await applySaleCommission(productId, pieces, price);
console.log(`Commission: ₹${result.commission}`);

// Show toast notification:
showToast('✓ Sale completed!', 'success');

// Use theme colors:
<div style={{
  background: FERRERO_THEME.primary,
  color: FERRERO_THEME.light
}}>
  Styled with Ferrero colors
</div>

// Check for active campaigns:
const commissionOffers = activeCampaigns.filter(c =>
  c.offer_type === 'commission'
);

// Claim a campaign offer:
await claimCampaign(campaignId);
*/
