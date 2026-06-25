import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const SubDBContext = createContext();

export const useSubDB = () => {
  const ctx = useContext(SubDBContext);
  if (!ctx) throw new Error('useSubDB must be used inside SubDBProvider');
  return ctx;
};

// ─── Local storage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'subdb_session';

const loadSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch { return null; }
};

const saveSession = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
};

const clearSession = () => localStorage.removeItem(STORAGE_KEY);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SubDBProvider = ({ children }) => {
  const [subUser, setSubUserState] = useState(() => loadSession());
  const [invoices, setInvoices] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const setSubUser = (user) => {
    setSubUserState(user);
    if (user) saveSession(user);
    else clearSession();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Mock OTP ──────────────────────────────────────────────────────────────
  const MOCK_OTP = '1234'; // match the existing app's demo OTP

  const sendOTP = async (phone) => {
    console.log(`[SubDB] Demo OTP for ${phone}: ${MOCK_OTP}`);
    return { success: true };
  };

  const verifyOTP = (phone, otp) => {
    // Accept 1234 (matching existing app) OR any 4-digit code for demo
    return otp === MOCK_OTP || otp.length === 4;
  };

  // ─── Login / Register — with robust fallback ───────────────────────────────
  const loginOrRegister = async (phone) => {
    // Always try Supabase first, but NEVER fail — always fall back gracefully
    if (isSupabaseConfigured) {
      try {
        const { data: existing, error: fetchErr } = await supabase
          .from('subdb_users')
          .select('*')
          .eq('phone', phone)
          .maybeSingle();

        if (fetchErr) {
          // Table might not exist yet — use local session
          console.warn('[SubDB] subdb_users query failed:', fetchErr.message, '— using local mode');
          return _localLogin(phone);
        }

        if (existing) {
          const userWithFlag = { ...existing, is_new: false };
          setSubUser(userWithFlag);
          return { user: userWithFlag, isNew: false };
        }

        // New user — create record
        const { data: created, error: insertErr } = await supabase
          .from('subdb_users')
          .insert([{ phone }])
          .select()
          .single();

        if (insertErr) {
          console.warn('[SubDB] Insert failed:', insertErr.message, '— using local mode');
          return _localLogin(phone, true);
        }

        const newUser = { ...created, is_new: true };
        setSubUser(newUser);
        return { user: newUser, isNew: true };

      } catch (err) {
        console.warn('[SubDB] Supabase error:', err.message, '— using local mode');
        return _localLogin(phone, true);
      }
    }

    return _localLogin(phone);
  };

  // Local-only session (Supabase unavailable or table missing)
  const _localLogin = (phone, forceNew = false) => {
    const existing = loadSession();
    const isNew = forceNew || !existing?.name;
    const user = existing?.phone === phone
      ? { ...existing, is_new: isNew }
      : { id: `local-${Date.now()}`, phone, name: null, emp_id: null, is_new: true };
    setSubUser(user);
    return { user, isNew: !user.name };
  };

  // ─── Save EMP profile ─────────────────────────────────────────────────────
  const saveProfile = async (profileData) => {
    const updatedUser = { ...subUser, ...profileData, is_new: false };

    if (isSupabaseConfigured && subUser?.id && !subUser.id.startsWith('local-')) {
      try {
        const { data, error } = await supabase
          .from('subdb_users')
          .update({ ...profileData, updated_at: new Date().toISOString() })
          .eq('id', subUser.id)
          .select()
          .single();
        if (!error && data) {
          setSubUser({ ...data, is_new: false });
          return data;
        }
      } catch (err) {
        console.warn('[SubDB] Profile save to DB failed:', err.message);
      }
    }

    // Local fallback
    setSubUser(updatedUser);
    return updatedUser;
  };

  // ─── Load retailers ───────────────────────────────────────────────────────
  const loadRetailers = async () => {
    const demoRetailers = [
      { id: 'r1', shop: 'Kumar Sweet House', name: 'Ramesh Kumar', loc: 'Khetgaon, MP' },
      { id: 'r2', shop: 'Patel Gift Store', name: 'Sunita Patel', loc: 'Dewas, MP' },
      { id: 'r3', shop: 'Sharma Confectionery', name: 'Mohan Sharma', loc: 'Ratlam, MP' },
      { id: 'r4', shop: 'Verma Premium Gifts', name: 'Anil Verma', loc: 'Sehore, MP' },
      { id: 'r5', shop: 'Singh Luxury Sweets', name: 'Kavita Singh', loc: 'Mandsaur, MP' },
    ];

    if (!isSupabaseConfigured) { setRetailers(demoRetailers); return; }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, shop, loc')
        .eq('role', 'retailer')
        .order('shop');
      if (data && data.length > 0) setRetailers(data);
      else setRetailers(demoRetailers);
    } catch {
      setRetailers(demoRetailers);
    }
  };

  // ─── Load invoices ─────────────────────────────────────────────────────────
  const loadInvoices = async () => {
    if (!subUser?.id) return;

    if (!isSupabaseConfigured || subUser.id.startsWith('local-')) {
      // Load from localStorage
      try {
        const stored = localStorage.getItem('subdb_invoices');
        if (stored) setInvoices(JSON.parse(stored));
      } catch { }
      return;
    }

    try {
      const { data } = await supabase
        .from('subdb_invoices')
        .select('*')
        .eq('submitted_by', subUser.id)
        .order('created_at', { ascending: false });
      if (data) setInvoices(data);
    } catch (err) {
      console.warn('[SubDB] Invoice load failed:', err.message);
    }
  };

  // ─── Submit invoice ────────────────────────────────────────────────────────
  const submitInvoice = async (invoiceData) => {
    setLoading(true);
    try {
      const payload = {
        submitted_by: subUser?.id?.startsWith('local-') ? null : subUser?.id,
        retailer_name: invoiceData.retailer_name,
        retailer_id: invoiceData.retailer_id || null,
        wholesaler_name: invoiceData.wholesaler_name,
        purchase_date: invoiceData.purchase_date,
        invoice_number: invoiceData.invoice_number,
        products: invoiceData.products,
        total_amount: invoiceData.total_amount,
        raw_ocr_text: invoiceData.raw_ocr_text || null,
        scan_confidence: invoiceData.confidence || null,
        status: 'submitted'
      };

      let saved = { ...payload, id: `inv-${Date.now()}`, created_at: new Date().toISOString() };

      if (isSupabaseConfigured && !subUser?.id?.startsWith('local-')) {
        try {
          const { data, error } = await supabase
            .from('subdb_invoices')
            .insert([payload])
            .select()
            .single();
          if (!error && data) saved = data;
        } catch (err) {
          console.warn('[SubDB] Invoice insert failed:', err.message);
        }
      }

      // Always update local store
      const updatedInvoices = [saved, ...invoices];
      setInvoices(updatedInvoices);
      try { localStorage.setItem('subdb_invoices', JSON.stringify(updatedInvoices)); } catch { }

      // Update retailer monthly targets
      if (invoiceData.retailer_id && invoiceData.products?.length > 0) {
        await updateMonthlyTargets(invoiceData.retailer_id, invoiceData.products);
      }

      showToast('✅ Invoice submitted!', 'success');
      return saved;
    } catch (err) {
      showToast('❌ Submit failed: ' + err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ─── Update retailer monthly targets ─────────────────────────────────────
  const updateMonthlyTargets = async (retailerId, products) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data: targets } = await supabase
        .from('retailer_monthly_targets')
        .select('*')
        .eq('user_id', retailerId)
        .neq('status', 'claimed');

      if (!targets || targets.length === 0) return;

      const FERRERO_KW = ['ferrero', 'rocher', 'raffaello', 'rondnoir', 'golden gallery', 'hazelnut'];
      const ferreroProds = products.filter(p =>
        FERRERO_KW.some(kw => (p.name || '').toLowerCase().includes(kw))
      );
      const totalQty = ferreroProds.reduce((s, p) => s + (Number(p.qty) || 0), 0);
      const totalAmt = products.reduce((s, p) => s + (Number(p.total) || Number(p.price) * Number(p.qty) || 0), 0);

      for (const target of targets) {
        const titleL = (target.title || '').toLowerCase();
        let increment = 0;
        if (titleL.includes('restock') || titleL.includes('carton') || titleL.includes('stock') || titleL.includes('box') || titleL.includes('sales')) {
          increment = totalQty;
        } else if (titleL.includes('commission') || titleL.includes('earning') || target.unit === '₹') {
          increment = Math.round(totalAmt * 0.05);
        }
        if (increment <= 0) continue;

        const newVal = Math.min(Number(target.target_value), Number(target.current_value) + increment);
        const newStatus = newVal >= Number(target.target_value) ? 'completed' : 'in_progress';

        await supabase
          .from('retailer_monthly_targets')
          .update({ current_value: newVal, status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', target.id);
      }
    } catch (err) {
      console.warn('[SubDB] Monthly target update failed:', err.message);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setSubUser(null);
    setInvoices([]);
    clearSession();
  };

  useEffect(() => {
    if (subUser?.id) {
      loadRetailers();
      loadInvoices();
    }
  }, [subUser?.id]);

  return (
    <SubDBContext.Provider value={{
      subUser, invoices, retailers, loading, toast,
      sendOTP, verifyOTP, loginOrRegister, saveProfile, logout,
      submitInvoice, loadInvoices, showToast
    }}>
      {children}
    </SubDBContext.Provider>
  );
};
