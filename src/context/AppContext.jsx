import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Intelligence } from '../services/intelligence';

const AppContext = createContext();

const initialUser = { phone: '', name: 'Ramesh Kumar', shop: 'Kumar Sweet House', loc: 'Khetgaon, MP', cat: 'rocher', role: '' };
const initialInv = [];

const getInitialTransactions = (category) => {
  const txns = {
    rocher: [
      {id:1, type:'purchase',label:'Gupta Ferrero Rocher Wholesaler', sub:'Invoice · 3 prod',date:'Today, 2:30 PM',  amt:'+₹12,500',clr:'#d4af37',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Customer',sub:'Ferrero Rocher 16pc × 2',date:'Today, 11 AM',amt:'+₹330',clr:'#d4af37',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Gift Buyer',sub:'Ferrero Rocher 48pc × 1',date:'Yesterday',amt:'+₹450',clr:'#d4af37',icon:'storefront'},
    ],
    gallery: [
      {id:1, type:'purchase',label:'Golden Gallery Wholesale', sub:'Invoice · 2 prod',date:'Today, 2:30 PM',  amt:'+₹9,600',clr:'#ffd700',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Corporate',sub:'Golden Gallery 42pc × 4',date:'Today, 11 AM',amt:'+₹1,500',clr:'#ffd700',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Customer',sub:'Golden Gallery 18pc × 2',date:'Yesterday',amt:'+₹360',clr:'#ffd700',icon:'storefront'},
    ],
    raffaello: [
      {id:1, type:'purchase',label:'Raffaello Coconut Sweets', sub:'Invoice · 2 prod',date:'Today, 2:30 PM',  amt:'+₹8,400',clr:'#ffffff',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Walk-in',sub:'Raffaello 20pc × 5',date:'Today, 11 AM',amt:'+₹1,100',clr:'#ffffff',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Customer',sub:'Raffaello 42pc × 2',date:'Yesterday',amt:'+₹840',clr:'#ffffff',icon:'storefront'},
    ],
    rondnoir: [
      {id:1, type:'purchase',label:'Rondnoir Dark Chocolate Dist.', sub:'Invoice · 2 prod',date:'Today, 2:30 PM',  amt:'+₹7,800',clr:'#4a154b',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Dark Choc Lover',sub:'Rondnoir 20pc × 3',date:'Today, 11 AM',amt:'+₹660',clr:'#4a154b',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Customer',sub:'Rondnoir 42pc × 2',date:'Yesterday',amt:'+₹840',clr:'#4a154b',icon:'storefront'},
    ],
    hazelnut: [
      {id:1, type:'purchase',label:'Hazelnut Truffle Wholesalers', sub:'Invoice · 2 prod',date:'Today, 2:30 PM',  amt:'+₹10,200',clr:'#8b4513',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Customer',sub:'Hazelnut Specialty Box × 2',date:'Today, 11 AM',amt:'+₹960',clr:'#8b4513',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Confectioner',sub:'Hazelnut Truffle Pieces × 5',date:'Yesterday',amt:'+₹600',clr:'#8b4513',icon:'storefront'},
    ],
    assortment: [
      {id:1, type:'purchase',label:'Holiday Gift Box Distributors', sub:'Invoice · 2 prod',date:'Today, 2:30 PM',  amt:'+₹15,000',clr:'#d4af37',icon:'local_shipping'},
      {id:2, type:'sale',label:'Sale to Wedding Event',sub:'Holiday Gift Set × 10',date:'Today, 11 AM',amt:'+₹7,500',clr:'#d4af37',icon:'storefront'},
      {id:3, type:'sale',label:'Sale to Customer',sub:'Premium Assortment Box × 3',date:'Yesterday',amt:'+₹1,800',clr:'#d4af37',icon:'storefront'},
    ],
  };

  return txns[category] || txns.rocher;
};

const STORAGE_KEYS = {
  user: 'counterOS_user',
  inventory: 'counterOS_inventory',
  wallet: 'counterOS_wallet',
  theme: 'counterOS_theme',
  distOrders: 'counterOS_distOrders',
  myRetailers: 'counterOS_myRetailers',
  notifications: 'counterOS_notifications'
};

const initialRetailers = [
  { id: 'RET-001', name: 'Kumar Sweet House', ltv: 125000, tier: 'Gold', lastOrder: '2 days ago' },
  { id: 'RET-002', name: 'Patel Gift Store', ltv: 85000, tier: 'Silver', lastOrder: '1 week ago' },
  { id: 'RET-003', name: 'Sharma Confectionery', ltv: 210000, tier: 'Diamond', lastOrder: 'Today' }
];

const initialOrders = [
  { id: 'ORD-8291', retailer: 'Kumar Sweet House', items: 12, total: 4500, status: 'pending', time: '10 mins ago', date: new Date().toISOString() },
  { id: 'ORD-8290', retailer: 'Patel Gift Store', items: 5, total: 1280, status: 'fulfilled', time: '2 hours ago', date: new Date().toISOString() }
];

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null || stored === 'undefined') return defaultValue;
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
};

export const AppProvider = ({ children }) => {
  // ─── STATE DEFINITIONS ───
  const [user, setUserState] = useState(() => loadFromStorage(STORAGE_KEYS.user, initialUser));
  const [theme, setThemeState] = useState(() => loadFromStorage(STORAGE_KEYS.theme, 'light'));
  const [inventory, setInventoryState] = useState(() => loadFromStorage(STORAGE_KEYS.inventory, initialInv));
  const [distOrdersState, setDistOrdersState] = useState(() => loadFromStorage(STORAGE_KEYS.distOrders, initialOrders));
  const [myRetailersState, setMyRetailersState] = useState(() => loadFromStorage(STORAGE_KEYS.myRetailers, initialRetailers));
  const [transactions, setTransactions] = useState(() => {
    const restoredUser = loadFromStorage(STORAGE_KEYS.user, initialUser);
    return getInitialTransactions(restoredUser?.cat || 'rocher');
  });
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };
  const [linkedDists, setLinkedDists] = useState([]);
  const [walletBalance, setWalletBalanceState] = useState(() => loadFromStorage(STORAGE_KEYS.wallet, 3482.50));
  const [notifications, setNotificationsState] = useState(() => loadFromStorage(STORAGE_KEYS.notifications, []));
  const [globalPopup, setGlobalPopup] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // ─── POINT CREDIT SYSTEM (for Ferrero products) ───────────────────────────
  const [pointCredits, setPointCreditsState] = useState(() => loadFromStorage('counterOS_pointCredits', 0));
  const [pointTransactions, setPointTransactionsState] = useState(() =>
    loadFromStorage('counterOS_pointTransactions', [])
  );

  // Use a ref to always access current user inside realtime callbacks (avoid stale closure)
  const userRef = React.useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ─── LOCAL STORAGE FALLBACK SYNCS ───
  const setUser = (updater) => {
    setUserState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.user, updated);
      return updated;
    });
  };

  const setTheme = (theme) => {
    setThemeState(theme);
    saveToStorage(STORAGE_KEYS.theme, theme);
  };

  const setInventory = (updater) => {
    setInventoryState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.inventory, updated);
      return updated;
    });
  };

  const setNotifications = (updater) => {
    setNotificationsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.notifications, next);
      return next;
    });
  };

  const setDistOrders = (updater) => {
    setDistOrdersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.distOrders, next);
      return next;
    });
  };

  const setMyRetailers = (updater) => {
    setMyRetailersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.myRetailers, next);
      return next;
    });
  };

  const setWalletBalance = (updater) => {
    setWalletBalanceState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(STORAGE_KEYS.wallet, updated);
      return updated;
    });
  };

  // ─── POINT CREDIT SYSTEM FUNCTIONS ────────────────────────────────────────
  const addPointCredits = (amount, description = 'Points earned') => {
    setPointCreditsState(prev => {
      const updated = prev + amount;
      saveToStorage('counterOS_pointCredits', updated);
      return updated;
    });

    // Log transaction
    setPointTransactionsState(prev => {
      const txn = {
        id: Date.now(),
        type: 'credit',
        amount,
        description,
        timestamp: new Date().toLocaleString(),
        balance: pointCredits + amount
      };
      const updated = [txn, ...prev];
      saveToStorage('counterOS_pointTransactions', updated);
      return updated;
    });
  };

  const redeemPointCredits = (amount, description = 'Points redeemed') => {
    if (pointCredits < amount) {
      showToast('❌ Insufficient point credits!', 'error');
      return false;
    }

    setPointCreditsState(prev => {
      const updated = prev - amount;
      saveToStorage('counterOS_pointCredits', updated);
      return updated;
    });

    // Log transaction
    setPointTransactionsState(prev => {
      const txn = {
        id: Date.now(),
        type: 'debit',
        amount,
        description,
        timestamp: new Date().toLocaleString(),
        balance: pointCredits - amount
      };
      const updated = [txn, ...prev];
      saveToStorage('counterOS_pointTransactions', updated);
      return updated;
    });

    showToast(`✅ Redeemed ${amount} points!`, 'success');
    return true;
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), isRead: false, time: 'Just now' }, ...prev]);
  };

  const addTransaction = (txn) => {
    setTransactions(prev => [{ ...txn, id: Date.now(), date: 'Just now' }, ...prev]);
  };

  // Sync theme to HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ─── POPUP SYSTEM (LOCAL FALLBACK) ───
  const showGlobalPopup = (popup, targetRole) => {
    if (!popup) { setGlobalPopup(null); return; }

    if (!targetRole || !isSupabaseConfigured) {
      setGlobalPopup(popup);
      return;
    }

    // Write cross-tab popup signal to localStorage for local testing
    localStorage.setItem(
      `counterOS_popup_for_${targetRole}`,
      JSON.stringify({ ...popup, savedAt: Date.now() })
    );
  };

  // Check saved popups on local storage (fallback)
  useEffect(() => {
    const role = user?.role;
    if (!role || isSupabaseConfigured) return;
    const saved = localStorage.getItem(`counterOS_popup_for_${role}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Date.now() - data.savedAt < 10 * 60 * 1000) {
          setTimeout(() => setGlobalPopup(data), 600);
        }
      } catch(e) {}
      localStorage.removeItem(`counterOS_popup_for_${role}`);
    }
  }, [user?.role]);

  // Sync tab updates in local testing mode
  useEffect(() => {
    if (isSupabaseConfigured) return;
    const handleStorage = (e) => {
      if (e.key === `counterOS_popup_for_${user?.role}` && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (Date.now() - data.savedAt < 10 * 60 * 1000) {
            setGlobalPopup(data);
          }
          localStorage.removeItem(`counterOS_popup_for_${user?.role}`);
        } catch(e) {}
      }
      if (e.key === 'counterOS_distOrders' && e.newValue) {
        setDistOrdersState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user?.role]);

  // Seed inventory dynamically if empty
  useEffect(() => {
    if (inventory.length === 0 && user?.cat && !isSeeding) {
      const CAT_LABELS = { 
        rocher: 'Ferrero Rocher', gallery: 'Golden Gallery', raffaello: 'Raffaello', 
        rondnoir: 'Rondnoir', hazelnut: 'Hazelnut Specialties', assortment: 'Premium Assortments'
      };
      const label = CAT_LABELS[user.cat] || user.cat;
      initializeAIStore(user.cat, label);
    }
  }, [inventory.length, user?.cat, isSeeding]);

  // Clean up old non-Ferrero Rocher products from inventory state
  useEffect(() => {
    if (inventory.length > 0) {
      const VALID_CATS = ['rocher', 'gallery', 'raffaello', 'rondnoir', 'hazelnut', 'assortment'];
      const hasInvalidItem = inventory.some(item => 
        !VALID_CATS.includes(item.businessCat) || 
        ['grains', 'flour', 'oils', 'legumes', 'sweeteners', 'beverages'].includes(item.cat?.toLowerCase()) ||
        ['rice', 'wheat', 'mustard', 'dal', 'sugar', 'tea', 'dap', 'urea', 'seed'].some(keyword => item.name?.toLowerCase().includes(keyword))
      );
      if (hasInvalidItem) {
        console.log('🧹 Inventory cleanup: removing generic products...');
        if (isSupabaseConfigured && user?.id) {
          supabase.from('inventory').delete().eq('user_id', user.id).then(() => {
            setInventoryState([]);
          });
        } else {
          setInventoryState([]);
          saveToStorage(STORAGE_KEYS.inventory, []);
        }
      }
    }
  }, [inventory.length, user?.id]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ─── SUPABASE CONTROLLER & REAL-TIME FLOWS ───

  // 1. Authenticate user, loading/creating their persistent Supabase profile
  const loginUser = async (phone, role, isNew) => {
    if (!isSupabaseConfigured) {
      // Offline fallback
      const isDist = role === 'distributor';
      const dummyUser = {
        phone,
        name: isDist ? 'Rajesh Gupta' : 'Ramesh Kumar',
        shop: isDist ? 'Gupta Ferrero Rocher Wholesaler' : 'Kumar Sweet House',
        loc: isDist ? 'Indore, MP' : 'Khetgaon, MP',
        role,
        cat: 'rocher',
        wallet_balance: 3482.50
      };
      setUser(dummyUser);
      setWalletBalance(3482.50);
      return dummyUser;
    }

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        const isDist = role === 'distributor';
        const newProfile = {
          phone,
          name: isDist ? 'Rajesh Gupta' : 'Ramesh Kumar',
          shop: isDist ? 'Gupta Ferrero Rocher Wholesaler' : 'Kumar Sweet House',
          loc: isDist ? 'Indore, MP' : 'Khetgaon, MP',
          role,
          cat: 'rocher',
          wallet_balance: 3482.50
        };

        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        profile = data;
      } else {
        if (profile.role !== role) {
          const { data, error: updateError } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', profile.id)
            .select()
            .single();
          if (updateError) throw updateError;
          profile = data;
        }
      }

      setUser(profile);
      setWalletBalance(Number(profile.wallet_balance || 0));
      return profile;
    } catch (e) {
      console.error('Supabase auth failed, running local mode:', e);
      throw e;
    }
  };

  // 2. Save shop onboarding or profile modifications
  const updateProfile = async (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    if (!isSupabaseConfigured || !user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      console.log('✅ Profile updated in database:', updates);
    } catch (e) {
      console.error('Failed to save profile updates to database:', e);
    }
  };

  // 3. Populate database initial seed list
  const initializeAIStore = async (category, categoryLabel) => {
    if (inventory.length > 0 || isSeeding) return;
    setIsSeeding(true);

    try {
      const label = categoryLabel || category;
      const parsedData = await Intelligence.generateInventory(label);
      
      if (parsedData && parsedData.length > 0) {
        const withCodes = parsedData.map((p, i) => ({
          ...p,
          id: p.id || Date.now() + i,
          code: p.code || `P${1000 + i}`,
          businessCat: category
        }));

        if (isSupabaseConfigured && user?.id) {
          const dbRows = withCodes.map(item => ({
            user_id: user.id,
            code: item.code,
            name: item.name,
            cat: item.cat,
            unit: item.unit,
            qty: item.qty,
            buy: item.buy,
            sell: item.sell,
            earn: item.earn,
            mfg: item.mfg || '2024-06',
            exp: item.exp || '2027-05',
            business_cat: category
          }));

          const { error } = await supabase.from('inventory').insert(dbRows);
          if (error) throw error;
          
          // Re-fetch clean list from database
          const { data: updatedInv } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id);
          
          if (updatedInv) {
            setInventory(updatedInv.map(row => ({
              id: row.id,
              code: row.code,
              name: row.name,
              cat: row.cat,
              unit: row.unit,
              qty: row.qty,
              buy: Number(row.buy),
              sell: Number(row.sell),
              earn: Number(row.earn),
              mfg: row.mfg,
              exp: row.exp,
              businessCat: row.business_cat
            })));
          }
        } else {
          setInventory(withCodes);
        }
        console.log(`✅ Inventory seed successful for: ${category}`);
      }
    } catch (e) {
      console.error('Failed to initialize AI store list:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  // ─── SUBSCRIBER CORE (LOAD & SUBSCRIBE REALTIME FROM DATABASE) ───
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    // Load initial data
    const loadInitialData = async () => {
      try {
        // A. Inventory
        const { data: dbInv } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id);

        const VALID_CATS = ['rocher', 'gallery', 'raffaello', 'rondnoir', 'hazelnut', 'assortment'];

        // 1. Reset user category and profile if invalid
        if (user && (!user.cat || !VALID_CATS.includes(user.cat))) {
          console.log(`⚠️ Invalid category detected for user: ${user.cat}. Resetting to 'rocher'.`);
          await supabase.from('profiles').update({ cat: 'rocher' }).eq('id', user.id);
          await supabase.from('inventory').delete().eq('user_id', user.id);
          setInventoryState([]);
          setUser(prev => ({ ...prev, cat: 'rocher' }));
          return;
        }

        // 2. Check if inventory contains old/generic items (grains, oils, dal, seeds etc.)
        if (dbInv && dbInv.length > 0) {
          const hasInvalidItem = dbInv.some(row => 
            !VALID_CATS.includes(row.business_cat) || 
            ['grains', 'flour', 'oils', 'legumes', 'sweeteners', 'beverages'].includes(row.cat?.toLowerCase()) ||
            ['rice', 'wheat', 'mustard', 'dal', 'sugar', 'tea', 'dap', 'urea', 'seed'].some(keyword => row.name?.toLowerCase().includes(keyword))
          );
          
          if (hasInvalidItem) {
            console.log('⚠️ Non-Ferrero items detected in inventory. Resetting inventory...');
            await supabase.from('inventory').delete().eq('user_id', user.id);
            setInventoryState([]);
            const cat = VALID_CATS.includes(user.cat) ? user.cat : 'rocher';
            const CAT_LABELS = { 
              rocher: 'Ferrero Rocher', gallery: 'Golden Gallery', raffaello: 'Raffaello', 
              rondnoir: 'Rondnoir', hazelnut: 'Hazelnut Specialties', assortment: 'Premium Assortments'
            };
            const label = CAT_LABELS[cat];
            initializeAIStore(cat, label);
            return;
          }
        }

        if (dbInv) {
          setInventoryState(dbInv.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            cat: row.cat,
            unit: row.unit,
            qty: row.qty,
            buy: Number(row.buy),
            sell: Number(row.sell),
            earn: Number(row.earn),
            mfg: row.mfg,
            exp: row.exp,
            businessCat: row.business_cat
          })));
        }

        // B. Orders (Retailers see their orders, Distributors see all orders sent to them)
        const orderQuery = user.role === 'distributor' 
          ? supabase.from('orders').select('*') 
          : supabase.from('orders').select('*').eq('retailer_id', user.id);
        
        const { data: dbOrders } = await orderQuery;
        if (dbOrders) {
          setDistOrdersState(dbOrders.map(o => ({
            id: o.id,
            retailer: o.retailer_name,
            retailer_id: o.retailer_id,
            items: o.items,
            total: Number(o.total),
            status: o.status,
            otp: o.otp,
            time: 'Active',
            date: o.created_at,
            items_list: o.items_list
          })));
        }

        // C. Transactions
        const { data: dbTxns } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (dbTxns) {
          setTransactions(dbTxns.map(t => ({
            id: t.id,
            type: t.type,
            label: t.label,
            sub: t.sub,
            amt: t.amt,
            clr: t.clr,
            icon: t.icon,
            date: new Date(t.created_at).toLocaleDateString()
          })));
        }

        // D. Notifications
        const { data: dbNotifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (dbNotifs) {
          setNotificationsState(dbNotifs.map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            role: n.role,
            isRead: n.is_read,
            time: 'Recent',
            type: n.type,
            offerType: n.offer_type,
            offer_data: n.offer_data,
            campaignId: n.campaign_id
          })));
        }

        // E. Connections / Linked distributors
        if (user.role === 'retailer') {
          const { data: connections } = await supabase
            .from('connections')
            .select('distributor_id, profiles!connections_distributor_id_fkey(*)')
            .eq('retailer_id', user.id);
          
          if (connections) {
            setLinkedDists(connections.map(c => ({
              id: c.profiles.id,
              name: c.profiles.shop || c.profiles.name,
              city: c.profiles.loc || 'India',
              products: [c.profiles.cat || 'Wholesale'],
              rating: 4.8,
              distance: 5,
              emoji: '🏭'
            })));
          }
        } else {
          // Distributor sees linked retailers
          const { data: connections } = await supabase
            .from('connections')
            .select('retailer_id, profiles!connections_retailer_id_fkey(*)')
            .eq('distributor_id', user.id);
          
          if (connections) {
            setMyRetailers(connections.map(c => ({
              id: c.profiles.id,
              name: c.profiles.shop || c.profiles.name,
              ltv: 125000,
              tier: 'Gold',
              lastOrder: 'Active'
            })));
          }
        }
      } catch (err) {
        console.error('Initial DB load error:', err);
      }
    };

    loadInitialData();

    // SETUP WEB SOCKET REAL-TIME LISTENERS
    const ordersChannel = supabase
      .channel('realtime-orders-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const currentUser = userRef.current;
        console.log('🔔 Realtime Order Update:', payload.eventType, payload.new?.status, 'for retailer:', payload.new?.retailer_id, 'current user:', currentUser?.id, 'role:', currentUser?.role);
        
        if (!payload.new) return;

        const mappedNew = {
          id: payload.new.id,
          retailer: payload.new.retailer_name,
          retailer_id: payload.new.retailer_id,
          items: payload.new.items,
          total: Number(payload.new.total),
          status: payload.new.status,
          otp: payload.new.otp,
          time: 'Just now',
          date: payload.new.created_at,
          items_list: payload.new.items_list
        };

        // Always update the orders list
        setDistOrdersState(prev => {
          if (payload.eventType === 'INSERT') {
            return [mappedNew, ...prev.filter(o => o.id !== mappedNew.id)];
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map(o => o.id === mappedNew.id ? mappedNew : o);
          }
          return prev;
        });

        // Show popup notifications based on role and event
        if (payload.eventType === 'INSERT') {
          // Distributor sees new order popup
          if (currentUser?.role === 'distributor') {
            setGlobalPopup({
              title: '🛍️ New Order Received!',
              message: `${payload.new.retailer_name} placed a B2B order worth ₹${Number(payload.new.total).toLocaleString('en-IN')}.`,
              type: 'pending',
              icon: 'shopping_bag'
            });
          }
        }

        if (payload.eventType === 'UPDATE') {
          const newStatus = payload.new.status;
          const isThisRetailersOrder = payload.new.retailer_id === currentUser?.id;

          // Retailer gets popup when THEIR order status changes
          if (currentUser?.role === 'retailer' && isThisRetailersOrder) {
            if (newStatus === 'approved') {
              setGlobalPopup({
                title: '✅ Order Approved!',
                message: `Your order ${payload.new.id} was approved! Delivery OTP: ${payload.new.otp}`,
                type: 'approved',
                icon: 'check_circle'
              });
            } else if (newStatus === 'fulfilled') {
              setGlobalPopup({
                title: '🎉 Order Delivered!',
                message: `Order ${payload.new.id} has been delivered successfully!`,
                type: 'fulfilled',
                icon: 'local_shipping'
              });
            } else if (newStatus === 'rejected') {
              setGlobalPopup({
                title: '❌ Order Rejected',
                message: `Your order ${payload.new.id} was rejected by the distributor.`,
                type: 'rejected',
                icon: 'cancel'
              });
            }
          }
        }
      })
      .subscribe((status) => {
        console.log('📡 Orders channel status:', status);
      });

    const profileChannel = supabase
      .channel('realtime-profile')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        console.log('🔔 Wallet Balance Updated:', payload.new.wallet_balance);
        setWalletBalanceState(Number(payload.new.wallet_balance));
        setUserState(payload.new);
      })
      .subscribe();

    const notifChannel = supabase
      .channel('realtime-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        console.log('🔔 New Notification:', payload);
        const notif = payload.new;
        setNotificationsState(prev => [{
          id: notif.id,
          title: notif.title,
          body: notif.body,
          role: notif.role,
          isRead: notif.is_read,
          time: 'Just now',
          type: notif.type,
          offerType: notif.offer_type,
          offer_data: notif.offer_data,
          campaignId: notif.campaign_id
        }, ...prev]);

        // Trigger notification toast on retailer side
        const msg = notif.type === 'campaign' 
          ? `🎉 New Ferrero Offer: ${notif.title}!` 
          : `🔔 ${notif.title}`;
        showToast(msg);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id, user?.role]);

  // 4. Record new product item in DB
  const addInventoryItem = async (item) => {
    const defaultItem = {
      ...item,
      id: Date.now(),
      code: item.code || `FR-${48 + inventory.length}`,
      mfg: item.mfg || '2024-06',
      exp: item.exp || '2027-05',
      businessCat: item.businessCat || user.cat || 'rocher'
    };

    setInventory(prev => [defaultItem, ...prev]);

    // Handle reward cashback logic
    const purchaseTotal = Number(item.buy) * Number(item.qty);
    let reward = 0;
    if (purchaseTotal >= 10000) reward = purchaseTotal * 0.1;
    else if (purchaseTotal >= 5000) reward = purchaseTotal * 0.05;

    if (isSupabaseConfigured && user?.id) {
      try {
        const { error: invErr } = await supabase.from('inventory').insert([{
          user_id: user.id,
          code: defaultItem.code,
          name: defaultItem.name,
          cat: defaultItem.cat,
          unit: defaultItem.unit,
          qty: Number(defaultItem.qty),
          buy: Number(defaultItem.buy),
          sell: Number(defaultItem.sell),
          earn: Number(defaultItem.earn),
          mfg: defaultItem.mfg,
          exp: defaultItem.exp,
          business_cat: defaultItem.businessCat
        }]);
        if (invErr) throw invErr;

        if (reward > 0) {
          const newBalance = walletBalance + reward;
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
          await supabase.from('transactions').insert([{
            user_id: user.id,
            type: 'purchase',
            label: 'Purchase Reward',
            sub: `Cashback on ${item.name}`,
            amt: '+₹' + reward.toFixed(0),
            clr: '#78f275',
            icon: 'card_giftcard'
          }]);
        }
      } catch(e) {
        console.error('Failed to sync added inventory item to Supabase:', e);
      }
    } else {
      if (reward > 0) {
        setWalletBalance(prev => prev + reward);
        addTransaction({
          type: 'purchase',
          label: 'Purchase Reward',
          sub: `Cashback on ${item.name}`,
          date: 'Just now',
          amt: '+₹' + reward.toFixed(0),
          clr: '#78f275',
          icon: 'card_giftcard'
        });
      }
    }
  };

  // 5. Complete walk-in customer sale & adjust quantities
  const completeSale = async (customerName, customerPhone, usedOtp = false) => {
    const baseEarned = cart.reduce((s, c) => s + c.earn * c.qty, 0);
    const otpBonus = usedOtp ? 5 : 0;
    const earned = +(baseEarned + otpBonus).toFixed(2);
    const firstItem = cart[0]?.name.split(' ').slice(0, 3).join(' ') || 'Products';
    const ct = cart.reduce((s, c) => s + c.qty, 0);

    // Update local state inventory quantities
    setInventory(prev => {
      const nextInv = [...prev];
      cart.forEach(c => {
        const p = nextInv.find(x => x.id === c.id);
        if (p) p.qty = Math.max(0, p.qty - c.qty);
      });
      return nextInv;
    });

    if (isSupabaseConfigured && user?.id) {
      try {
        // Deduct quantities in DB
        for (const cartItem of cart) {
          const matchingDbItem = inventory.find(p => p.id === cartItem.id || p.code === cartItem.code);
          if (matchingDbItem) {
            const newQty = Math.max(0, matchingDbItem.qty - cartItem.qty);
            await supabase.from('inventory').update({ qty: newQty }).eq('id', matchingDbItem.id);
          }
        }

        // Add funds to wallet balance
        const newBalance = walletBalance + earned;
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);

        // Record retail transaction
        await supabase.from('transactions').insert([{
          user_id: user.id,
          type: 'sale',
          label: 'Sale to ' + customerName,
          sub: firstItem + ' · ' + ct + ' items',
          amt: '+₹' + earned,
          clr: '#ffd060',
          icon: 'storefront'
        }]);
      } catch (e) {
        console.error('Failed to save sale updates to database:', e);
      }
    } else {
      addTransaction({
        type: 'sale',
        label: 'Sale to ' + customerName,
        sub: firstItem + ' · ' + ct + ' items',
        date: 'Just now',
        amt: '+₹' + earned,
        clr: '#ffd060',
        icon: 'storefront'
      });
      setWalletBalance(prev => prev + earned);
    }

    clearCart();
    return earned;
  };

  // 6. Create B2B purchase order
  const placeB2BOrder = async (order) => {
    const orderId = `ORD-${Math.floor(8000 + Math.random()*1000)}`;
    const newOrder = {
      ...order,
      id: orderId,
      status: 'pending',
      time: 'Just now',
      date: new Date().toISOString()
    };

    setDistOrders(prev => [newOrder, ...prev]);

    if (isSupabaseConfigured && user?.id) {
      try {
        // Target distributor ID matching name selection or connection lookup
        const { data: distProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('shop', order.distributorName || 'Gupta Ferrero Rocher Wholesaler')
          .maybeSingle();

        const distributorId = distProfile?.id || null;

        const { error } = await supabase.from('orders').insert([{
          id: orderId,
          retailer_id: user.id,
          retailer_name: user.shop || user.name,
          items: Number(order.items),
          total: Number(order.total),
          status: 'pending',
          items_list: order.cartItems || []
        }]);

        if (error) throw error;

        // If distributor has an account, log a database notification
        if (distributorId) {
          await supabase.from('notifications').insert([{
            user_id: distributorId,
            title: 'New Order Received',
            body: `${user.shop || user.name} placed a wholesale order for ${order.items} items.`,
            role: 'distributor'
          }]);
        }
      } catch(e) {
        console.error('Failed to place order in Supabase:', e);
      }
    } else {
      addNotification({
        title: 'New Order Received',
        body: `${order.retailer} placed an order for ${order.items} items.`,
        role: 'distributor', isRead: false
      });
      showGlobalPopup({
        title: '🛍️ New Order Received!',
        message: `${order.retailer} just placed an order for ${order.items} items worth ₹${order.total?.toLocaleString('en-IN')}.`,
        type: 'pending',
        icon: 'shopping_bag'
      }, 'distributor');
    }
  };

  // 7. Approve pending B2B order & dispatch OTP code
  const approveB2BOrder = async (orderId) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    setDistOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'approved', otp: otp } : o));

    if (isSupabaseConfigured) {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('retailer_id')
          .eq('id', orderId)
          .single();

        await supabase
          .from('orders')
          .update({ status: 'approved', otp: otp })
          .eq('id', orderId);

        if (order?.retailer_id) {
          await supabase.from('notifications').insert([{
            user_id: order.retailer_id,
            title: 'Order Approved!',
            body: `Your order ${orderId} has been approved. Delivery OTP: ${otp}`,
            role: 'retailer'
          }]);
        }
      } catch(e) {
        console.error('Failed to approve order in database:', e);
      }
    } else {
      addNotification({
        title: 'Order Approved!',
        body: `Your order ${orderId} has been approved. Delivery OTP: ${otp}`,
        role: 'retailer', isRead: false
      });
      showGlobalPopup({
        title: '✅ Order Approved!',
        message: `Your order ${orderId} has been approved! Your delivery OTP is: ${otp}. Share this with the delivery person.`,
        type: 'approved',
        icon: 'check_circle'
      }, 'retailer');
    }
  };

  // 8. Verify OTP delivery and settle amounts
  const deliverB2BOrder = async (orderId, enteredOtp) => {
    let success = false;
    let earned = 0;
    let retailerId = null;

    if (isSupabaseConfigured) {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (order && order.otp === enteredOtp) {
          success = true;
          earned = Number(order.total);
          retailerId = order.retailer_id;

          // Update order status to fulfilled
          await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', orderId);

          // Update distributor balance
          const newBalance = walletBalance + earned;
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);

          // Add transaction for wholesaler
          await supabase.from('transactions').insert([{
            user_id: user.id,
            type: 'sale',
            label: 'B2B Wholesale Fulfillment',
            sub: 'Order ' + orderId,
            amt: '+₹' + earned.toLocaleString('en-IN'),
            clr: '#ffd060',
            icon: 'local_shipping'
          }]);

          // Notify Retailer
          await supabase.from('notifications').insert([{
            user_id: retailerId,
            title: 'Order Fulfilled',
            body: `Order ${orderId} delivered successfully!`,
            role: 'retailer'
          }]);
        }
      } catch(e) {
        console.error('Failed to complete delivery in database:', e);
      }
    } else {
      const match = distOrdersState.find(o => o.id === orderId);
      if (match && match.otp === enteredOtp) {
        success = true;
        earned = match.total;

        setDistOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'fulfilled' } : o));
        setWalletBalance(prev => prev + earned);
        addTransaction({
          type: 'sale',
          label: 'B2B Wholesale Fulfillment',
          sub: 'Order ' + orderId,
          date: 'Just now',
          amt: '+₹' + earned.toLocaleString('en-IN'),
          clr: '#ffd060',
          icon: 'local_shipping'
        });
        addNotification({
          title: 'Order Fulfilled',
          body: `Order ${orderId} delivered successfully!`,
          role: 'retailer', isRead: false
        });
        showGlobalPopup({
          title: '🎉 Order Delivered!',
          message: `OTP verified for order ${orderId}. Your order has been delivered successfully!`,
          type: 'fulfilled',
          icon: 'local_shipping'
        }, 'retailer');
      }
    }

    return success;
  };

  // 9. Reject order (out of stock/issue)
  const rejectB2BOrder = async (orderId) => {
    setDistOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));

    if (isSupabaseConfigured) {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('retailer_id')
          .eq('id', orderId)
          .single();

        await supabase.from('orders').update({ status: 'rejected' }).eq('id', orderId);

        if (order?.retailer_id) {
          await supabase.from('notifications').insert([{
            user_id: order.retailer_id,
            title: 'Order Rejected',
            body: `Order ${orderId} was rejected by the distributor.`,
            role: 'retailer'
          }]);
        }
      } catch(e) {
        console.error('Failed to reject order in database:', e);
      }
    } else {
      addNotification({
        title: 'Order Rejected',
        body: `Order ${orderId} was rejected by the distributor.`,
        role: 'retailer', isRead: false
      });
      showGlobalPopup({
        title: '❌ Order Rejected',
        message: `Order ${orderId} was rejected by the distributor (out of stock).`,
        type: 'rejected',
        icon: 'cancel'
      }, 'retailer');
    }
  };

  // 10. Link connections (Retailers linking to wholesalers)
  const saveConnectionLink = async (distributorProfile) => {
    if (!isSupabaseConfigured || !user?.id) return;
    try {
      const isLinked = linkedDists.some(d => d.id === distributorProfile.id);
      
      if (isLinked) {
        setLinkedDists(prev => prev.filter(d => d.id !== distributorProfile.id));
        await supabase
          .from('connections')
          .delete()
          .eq('retailer_id', user.id)
          .eq('distributor_id', distributorProfile.id);
      } else {
        setLinkedDists(prev => [...prev, distributorProfile]);
        await supabase
          .from('connections')
          .insert([{ retailer_id: user.id, distributor_id: distributorProfile.id }]);
      }
    } catch (e) {
      console.error('Failed to save connection in database:', e);
    }
  };

  // ─── FERRERO THEME ──────────────────────────────────────────────────────
  const FERRERO_THEME = {
    primary: '#d4a574',      // Gold
    secondary: '#c41e3a',    // Burgundy
    accent: '#8b6f47',       // Dark gold
    light: '#f9f7f3',        // Cream
    lightGray: '#f5f5f5',
    border: '#e5e5e5',
    text: '#2d2d2d',
    textSecond: '#666',
    textLight: '#999',
  };

  // ─── CAMPAIGN STATES ────────────────────────────────────────────────────
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [commissionEarnings, setCommissionEarnings] = useState(0);

  // ─── TOAST NOTIFICATIONS ────────────────────────────────────────────────
  const showToast = (message, type = 'info') => {
    // Dispatch global toast event to trigger UI
    const event = new CustomEvent('show-toast', { detail: { message } });
    window.dispatchEvent(event);

    // Also add to notifications for history
    addNotification({
      id: Date.now(),
      title: message,
      body: '',
      type: 'toast',
      isRead: false,
      timestamp: new Date().toLocaleString()
    });
  };

  // ─── LOAD ACTIVE CAMPAIGNS (with real-time) ─────────────────────────────
  const loadActiveCampaigns = async () => {
    if (!isSupabaseConfigured || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('offer_campaigns')
        .select('*')
        .eq('is_active', true)
        .eq('target_role', user.role === 'retailer' ? 'retailer' : 'distributor')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      if (error) {
        console.log('Campaigns not yet available (table may not exist yet):', error.message);
        return;
      }

      setActiveCampaigns(data || []);
      console.log('📋 Active campaigns loaded:', data?.length || 0);

      // Show toast for newly loaded campaigns
      if (data && data.length > 0) {
        data.forEach(campaign => {
          showToast(`🎉 New offer: ${campaign.title}! Check "Active Offers" on home.`, 'campaign');
        });
      }
    } catch (error) {
      console.warn('Campaign loading skipped (not yet deployed):', error.message);
    }
  };

  // Setup real-time campaign subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    console.log('🔄 Setting up real-time subscription for:', user.role);

    // Initial load
    loadActiveCampaigns();

    // Create unique channel name
    const channelName = `public:offer_campaigns:target_role=eq.${user.role}`;

    // Subscribe to real-time campaign changes
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offer_campaigns'
          // ✅ NO filter here - will filter in JavaScript for reliability
        },
        (payload) => {
          console.log('🔔 Real-time campaign INSERT received:', payload);
          const newCampaign = payload.new;

          if (!newCampaign) {
            console.log('⚠️ No campaign data in payload');
            return;
          }

          console.log('📋 Campaign target_role:', newCampaign.target_role, 'User role:', user.role);

          // ✅ Filter in JavaScript for guaranteed reliability
          if (newCampaign.target_role === user.role || newCampaign.target_role === 'all') {
            console.log('✅ Campaign matches user role, showing toast...');

            // Show toast immediately
            showToast(
              `🎉 New offer from Ferrero: ${newCampaign.title}! Check "Active Offers" now.`,
              'campaign'
            );
            console.log('✅ Toast shown for:', newCampaign.title);

            // Reload campaigns to show the new one
            loadActiveCampaigns();

            // Create local notification
            addNotification({
              id: Date.now(),
              title: `✨ New Campaign: ${newCampaign.title}`,
              body: newCampaign.description || 'Check out this new offer!',
              role: user.role,
              isRead: false,
              type: 'campaign',
              offerType: newCampaign.offer_type,
              timestamp: new Date().toLocaleString(),
              campaignId: newCampaign.id
            });
          } else {
            console.log('⏭️ Campaign target_role', newCampaign.target_role, 'does not match user role', user.role);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 Subscription status for ${user.role}:`, status);
        if (err) {
          console.error('❌ Subscription error:', err);
        }
      });

    return () => {
      console.log('🧹 Cleaning up subscription for:', user.role);
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.role]);

  // Setup real-time B2B order subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    console.log('🔄 Setting up B2B order subscriptions for:', user.role);

    if (user.role === 'retailer') {
      // RETAILER: Subscribe to order status changes (approvals, deliveries)
      console.log('👥 Retailer subscribing to order updates...');
      const retailerOrdersChannel = supabase
        .channel(`retailer-orders-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `retailer_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📦 Order status change received:', payload.new);
            const order = payload.new;

            if (order.status === 'approved' && order.otp) {
              showToast(`✅ Order ${order.id} Approved! Delivery OTP: ${order.otp}`, 'success');
              addNotification({
                id: Date.now(),
                title: `✅ Order Approved`,
                body: `Order ${order.id} approved! Delivery OTP: ${order.otp}`,
                type: 'order',
                timestamp: new Date().toLocaleString(),
                role: 'retailer'
              });
            } else if (order.status === 'fulfilled') {
              showToast(`🎉 Order ${order.id} Delivered Successfully!`, 'success');
              addNotification({
                id: Date.now(),
                title: `🎉 Order Delivered`,
                body: `Order ${order.id} has been delivered`,
                type: 'order',
                timestamp: new Date().toLocaleString(),
                role: 'retailer'
              });
            } else if (order.status === 'rejected') {
              showToast(`❌ Order ${order.id} Rejected`, 'error');
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Retailer orders subscription status:`, status);
        });

      return () => {
        console.log('🧹 Cleaning up retailer orders subscription');
        supabase.removeChannel(retailerOrdersChannel);
      };
    } else if (user.role === 'distributor') {
      // DISTRIBUTOR: Subscribe to new orders from retailers
      console.log('📦 Distributor subscribing to new orders...');
      const distNewOrdersChannel = supabase
        .channel(`distributor-new-orders-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('📦 New order received:', payload.new);
            const order = payload.new;

            showToast(`📦 New Order from ${order.retailer_name}! ${order.items} items, ₹${order.total}`, 'info');
            addNotification({
              id: Date.now(),
              title: `📦 New Order from ${order.retailer_name}`,
              body: `${order.items} items worth ₹${order.total?.toLocaleString('en-IN')}`,
              type: 'order',
              timestamp: new Date().toLocaleString(),
              role: 'distributor'
            });

            // Reload orders to show new one
            loadDistOrders();
          }
        )
        .subscribe((status) => {
          console.log(`📡 Distributor new orders subscription status:`, status);
        });

      return () => {
        console.log('🧹 Cleaning up distributor orders subscription');
        supabase.removeChannel(distNewOrdersChannel);
      };
    }
  }, [user?.id, user?.role]);

  // ─── APPLY COMMISSION TO SALE ──────────────────────────────────────────
  const applySaleCommission = async (productId, piecesSold, pricePerPiece) => {
    if (!isSupabaseConfigured || !user?.id || user.role !== 'retailer') return null;

    try {
      const campaign = activeCampaigns.find(c => {
        const productIds = c.product_ids || [];
        return productIds.some(p => p.id === productId);
      });

      if (!campaign || campaign.offer_type !== 'commission') {
        return { commission: 0, cashback: 0 };
      }

      if (piecesSold < campaign.commission_min_qty) {
        return { commission: 0, cashback: 0 };
      }

      const baseTotal = piecesSold * pricePerPiece;
      let commission = 0;
      let cashback = 0;

      if (campaign.offer_type === 'commission') {
        commission = (baseTotal * campaign.commission_pct) / 100;
      } else if (campaign.offer_type === 'cashback') {
        cashback = piecesSold * campaign.cashback_amount;
      }

      // Update wallet and commission earnings
      setWalletBalance(prev => prev + commission + cashback);
      setCommissionEarnings(prev => prev + commission);

      if (commission + cashback > 0) {
        const totalEarned = commission + cashback;
        showToast(`💰 Earned ₹${totalEarned.toFixed(2)} from campaign!`, 'success');

        // Also add point credits (1 rupee = 1 point)
        addPointCredits(Math.floor(totalEarned), `Points from ${campaign.title} sale`);
      }

      return { commission, cashback };
    } catch (error) {
      console.warn('Commission calculation skipped (database not ready):', error.message);
      return { commission: 0, cashback: 0 };
    }
  };

  // ─── APPLY DISCOUNT TO ORDER ────────────────────────────────────────────
  const applyOrderDiscount = async (productId, quantityCartons) => {
    if (!isSupabaseConfigured) return null;

    try {
      const campaign = activeCampaigns.find(c => {
        const productIds = c.product_ids || [];
        return productIds.some(p => p.id === productId);
      });

      if (!campaign || campaign.offer_type !== 'discount') {
        return { discount_pct: 0, discount_amount: 0 };
      }

      if (quantityCartons < campaign.discount_min_qty) {
        return { discount_pct: 0, discount_amount: 0 };
      }

      return {
        discount_pct: campaign.discount_pct,
        campaign_id: campaign.id
      };
    } catch (error) {
      console.warn('Discount calculation skipped (database not ready):', error.message);
      return { discount_pct: 0, discount_amount: 0 };
    }
  };

  // ─── CLAIM CAMPAIGN ────────────────────────────────────────────────────
  const claimCampaign = async (campaignId) => {
    if (!isSupabaseConfigured) {
      showToast('✓ Offer claimed!', 'success');
      return true;
    }

    try {
      await supabase
        .from('campaign_notifications')
        .update({ is_claimed: true })
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      showToast('✓ Offer claimed!', 'success');
      return true;
    } catch (error) {
      console.warn('Claim failed (database not ready):', error.message);
      return false;
    }
  };

  const value = {
    user,
    setUser,
    loginUser,
    updateProfile,
    theme,
    toggleTheme,
    inventory,
    setInventory,
    addInventoryItem,
    transactions,
    addTransaction,
    cart,
    addToCart,
    updateCartQty,
    clearCart,
    completeSale,
    linkedDists,
    setLinkedDists,
    saveConnectionLink,
    walletBalance,
    setWalletBalance,
    initializeAIStore,
    distOrders: distOrdersState,
    setDistOrders,
    myRetailers: myRetailersState,
    setMyRetailers,
    placeB2BOrder,
    approveB2BOrder,
    deliverB2BOrder,
    rejectB2BOrder,
    notifications,
    setNotifications,
    addNotification,
    globalPopup,
    showGlobalPopup,
    // Ferrero Campaign System
    FERRERO_THEME,
    activeCampaigns,
    commissionEarnings,
    showToast,
    applySaleCommission,
    applyOrderDiscount,
    claimCampaign,
    loadActiveCampaigns,
    // Point Credit System
    pointCredits,
    pointTransactions,
    addPointCredits,
    redeemPointCredits
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
