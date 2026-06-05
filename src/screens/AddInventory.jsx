import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Scanner } from '../components/ui/Scanner';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../components/ui/Toast';
import { Intelligence } from '../services/intelligence';
import { ErrorLogger } from '../services/errorLogger';
import { AIDropdown } from '../components/ui/AIDropdown';

const CAT_LABELS = { rocher: 'Ferrero Rocher', gallery: 'Golden Gallery', raffaello: 'Raffaello', rondnoir: 'Rondnoir', hazelnut: 'Hazelnut Specialties', assortment: 'Premium Assortments' };

export const AddInventory = () => {
  const navigate = useNavigate();
  const { addInventoryItem, user, inventory } = useAppContext();
  const [tab, setTab] = useState('manual'); // scan, invoice, manual

  // Invoice States
  const [status, setStatus] = useState('idle');
  const [procSteps, setProcSteps] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const fileInputRef = useRef(null);
  const stepsList = ['Reading distributor details...', 'Scanning product list...', 'Extracting quantities & prices...', 'Calculating purchase cashback...', 'Finalising inventory data...'];

  // AI Suggestions
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], units: [] });
  const [loadingSug, setLoadingSug] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [userCategory, setUserCategory] = useState(user.cat || 'rocher'); // Fallback to rocher

  // Manual States
  const [form, setForm] = useState({
    name: '',
    cat: '',
    unit: '',
    qty: '',
    buy: '',
    sell: '',
    mfg: '2024-06',
    exp: '2027-05',
    code: ''
  });

  // Initialize userCategory with user.cat on component mount
  useEffect(() => {
    if (!userCategory && user.cat) {
      console.log(`📁 Initializing userCategory from user.cat: ${user.cat} → ${CAT_LABELS[user.cat]}`);
      setUserCategory(user.cat);
    }
  }, []);

  // Monitor user.cat changes from context - MUST run first to set userCategory
  useEffect(() => {
    if (user.cat && user.cat !== userCategory) {
      console.log(`📁 User category updated: ${user.cat} → ${CAT_LABELS[user.cat]}`);
      setUserCategory(user.cat);
    }
  }, [user.cat]);

  // Fetch suggestions whenever tab or user category changes
  useEffect(() => {
    if (tab === 'manual' && userCategory) {
      console.log(`📊 Tab 'manual' active, fetching suggestions for: ${userCategory}`);
      fetchSuggestions();
    }
  }, [tab, userCategory]);

  const fetchSuggestions = useCallback(async () => {
    if (!userCategory) {
      console.warn('⚠️ No userCategory set, using fallback');
      setSuggestions({
        products: Intelligence.getFallbackProducts('rocher'),
        categories: Intelligence.getFallbackCategories('rocher'),
        units: Intelligence.getFallbackUnits('rocher')
      });
      return;
    }

    try {
      setLoadingSug(true);
      const bizLabel = CAT_LABELS[userCategory] || CAT_LABELS['rocher'];
      console.log(`🔄 Fetching suggestions for: ${bizLabel} (category: ${userCategory})`);
      
      const res = await Intelligence.getFormSuggestions(bizLabel);
      if (res && res.products && res.products.length > 0) {
        console.log(`✅ Got ${res.products.length} suggestions: ${res.products.slice(0, 3).join(', ')}...`);
        setSuggestions(res);
      } else {
        throw new Error('Empty suggestions received');
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error.message);
      console.log(`📦 Using fallback products for ${userCategory}`);
      
      // Set fallback suggestions for the category
      const fallbackProds = Intelligence.getFallbackProducts(userCategory);
      const fallbackCats = Intelligence.getFallbackCategories(userCategory);
      const fallbackUnits = Intelligence.getFallbackUnits(userCategory);
      
      console.log(`📦 Fallback products: ${fallbackProds.slice(0, 3).join(', ')}...`);
      
      setSuggestions({
        products: fallbackProds,
        categories: fallbackCats,
        units: fallbackUnits
      });
      
      ErrorLogger.logError(error, { context: 'fetchSuggestions', category: userCategory, fallbackUsed: true });
    } finally {
      setLoadingSug(false);
    }
  }, [userCategory]);

  const handleProductSelect = useCallback(async (name) => {
    try {
      setForm(prev => ({ ...prev, name }));
      setLoadingDefaults(true);
      const bizLabel = CAT_LABELS[userCategory] || CAT_LABELS['rocher'];
      console.log(`⚙️ Getting defaults for: ${name} in ${bizLabel}`);
      
      const res = await Intelligence.getProductDefaults(name, bizLabel);
      if (res) {
        setForm(prev => ({ ...prev, cat: res.category, unit: res.unit }));
        console.log(`✅ Defaults: category=${res.category}, unit=${res.unit}`);
      }
    } catch (error) {
      ErrorLogger.logError(error, { context: 'handleProductSelect', productName: name });
      console.error('❌ Error getting product defaults:', error);
    } finally {
      setLoadingDefaults(false);
    }
  }, [userCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.qty || !form.sell) return;
    
    addInventoryItem({
      ...form,
      qty: Number(form.qty),
      buy: Number(form.buy || 0),
      sell: Number(form.sell),
      earn: Number((form.sell - (form.buy || form.sell*0.9)) * 0.1).toFixed(2),
      icon: 'inventory_2',
      clr: '#78f275',
      businessCat: user.cat || 'rocher'
    });
    
    showToast(`✅ ${form.name} added to inventory`);
    navigate('/inventory');
  };

  // Invoice Handlers
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const b64 = ev.target.result.split(',')[1];
      const mime = f.type || 'image/jpeg';
      await runParse(b64, mime, f.name);
    };
    reader.readAsDataURL(f);
  };

  const runParse = async (b64, mime, fname) => {
    showProcessing();
    const data = await Intelligence.readInvoice(b64, mime);
    if (data && data.products) showResults(data, fname);
    else showDemoResults(fname);
  };

  const showProcessing = () => {
    setStatus('processing');
    setProcSteps([]);
    let i = 0;
    const procTimer = setInterval(() => {
      if (i >= stepsList.length) { clearInterval(procTimer); return; }
      setProcSteps(prev => [...prev, stepsList[i]]);
      i++;
    }, 620);
  };

  const showResults = (data, fname) => {
    setStatus('results');
    setParsedData(data);
    setParsedProducts(data.products || []);
  };

  const showDemoResults = (fname) => {
    const slice = inventory.slice(0, 4);
    if (slice.length === 0) {
       slice.push({ name: 'Ferrero Rocher 48 pieces', cat: 'Rocher', unit: 'Box', buy: 300 });
       slice.push({ name: 'Golden Gallery 42 pieces', cat: 'Golden Gallery', unit: 'Box', buy: 250 });
       slice.push({ name: 'Raffaello 42 pieces', cat: 'Raffaello', unit: 'Box', buy: 280 });
       slice.push({ name: 'Rondnoir 42 pieces', cat: 'Rondnoir', unit: 'Box', buy: 280 });
    }
    const demoProds = slice.map(item => ({
        name: item.name + ' (Restock)',
        category: item.cat || 'General',
        quantity: Math.floor(Math.random() * 40) + 10,
        unit: item.unit,
        unit_price: item.buy,
        total_price: item.buy * 20,
        added: false
    }));
    showResults({
      distributor_name: `${user.name.split(' ')[0]}'s Supplier`, 
      invoice_number: `INV-${Date.now().toString().slice(-4)}`, 
      invoice_date: 'Today', 
      total_value: demoProds.reduce((s,p)=>s+p.total_price,0),
      products: demoProds
    }, fname);
  };

  const addParsedItem = (idx) => {
    const p = parsedProducts[idx];
    if (p.added) return;
    addInventoryItem({
      name: p.name,
      cat: p.category || 'Other',
      unit: p.unit,
      qty: p.quantity,
      buy: p.unit_price,
      sell: +(p.unit_price * 1.12).toFixed(0),
      icon: 'inventory_2',
      clr: '#8a9e8a',
      earn: +(p.unit_price * 0.01).toFixed(2),
      businessCat: user.cat || 'rocher'
    });
    const next = [...parsedProducts];
    next[idx].added = true;
    setParsedProducts(next);
  };

  return (
    <AppLayout>
      <div className="screen active" style={{ background: '#0a0a0a' }}>
        <Header 
          title="Add Inventory" 
          subtitle="Add products manually" 
          backTo="/inventory"
          rightContent={<span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Help?</span>}
        />

        <div className="scroller" style={{ padding: '1.25rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#111', borderRadius: '12px', padding: '.25rem', marginBottom: '1.5rem' }}>
            {['scan', 'invoice', 'manual'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '.6rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: tab === t ? 'var(--bg3)' : 'transparent',
                  color: tab === t ? 'var(--g4)' : 'var(--t3)',
                  fontSize: '.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.4rem',
                  cursor: 'pointer',
                  transition: 'all .2s'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                  {t === 'scan' ? 'qr_code_scanner' : t === 'invoice' ? 'receipt_long' : 'edit_note'}
                </span>
                <span style={{ textTransform: 'capitalize' }}>{t}</span>
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '.8rem', marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '1.2rem' }}>info</span>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Manually added products won't earn scan rewards. Use barcode scan to maximize earnings.
            </p>
          </div>

          {tab === 'scan' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a2a', position: 'relative' }}>
                   <Scanner onScan={(code) => {
                      const p = inventory.find(x => x.code === code);
                      if (p) {
                         setForm({ ...form, name: p.name, cat: p.cat, unit: p.unit, buy: p.buy, sell: p.sell, code: p.code });
                         setTab('manual');
                         showToast(`✅ Found: ${p.name}`);
                       } else {
                          setForm({ ...form, code: code, name: 'Ferrero Rocher 16 pieces', cat: user.cat || 'Rocher', unit: 'Box', qty: 10, buy: 110, sell: 165 });
                          setTab('manual');
                          showToast(`ℹ️ Code ${code} detected. Details pre-filled.`);
                       }
                   }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem', alignItems: 'center' }}>
                   <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.75rem' }}>Point camera at product barcode to pre-fill details</p>
                   <button 
                     onClick={() => {
                         const fakeCode = '890' + Math.floor(100000000 + Math.random() * 900000000);
                         setForm({ ...form, code: fakeCode, name: 'Golden Gallery 42 pieces', cat: user.cat || 'Golden Gallery', unit: 'Box', qty: 50, buy: 250, sell: 375 });
                         setTab('manual');
                         showToast(`✅ Demo Barcode Scanned!`);
                     }}
                     style={{ background: 'var(--g4)', color: '#000', border: 'none', padding: '.6rem 1.2rem', borderRadius: 'var(--r8)', fontSize: '.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                     <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>document_scanner</span>
                     Simulate Scan for Demo
                   </button>
                </div>
             </div>
          )}

          {tab === 'manual' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AIDropdown 
                label="Product Name"
                placeholder="Search common products..."
                value={form.name}
                options={suggestions.products}
                loading={loadingSug}
                onChange={handleProductSelect}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <AIDropdown 
                  label="Category"
                  placeholder="e.g. Tablets"
                  value={form.cat}
                  options={suggestions.categories}
                  loading={loadingSug || loadingDefaults}
                  onChange={val => setForm({...form, cat: val})}
                />
                <AIDropdown 
                  label="Unit"
                  placeholder="e.g. Strip"
                  value={form.unit}
                  options={suggestions.units}
                  loading={loadingSug || loadingDefaults}
                  onChange={val => setForm({...form, unit: val})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>Quantity</label>
                  <Input 
                    type="number"
                    value={form.qty} 
                    onChange={e => setForm({...form, qty: e.target.value})}
                    wrapperStyle={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>Purchase Price (₹)</label>
                  <Input 
                    type="number"
                    value={form.buy} 
                    onChange={e => setForm({...form, buy: e.target.value})}
                    wrapperStyle={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>Selling Price (₹)</label>
                <Input 
                  type="number"
                  value={form.sell} 
                  onChange={e => setForm({...form, sell: e.target.value})}
                  wrapperStyle={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>Mfg. Date</label>
                  <Input 
                    value={form.mfg} 
                    onChange={e => setForm({...form, mfg: e.target.value})}
                    wrapperStyle={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>Exp. Date</label>
                  <Input 
                    value={form.exp} 
                    onChange={e => setForm({...form, exp: e.target.value})}
                    wrapperStyle={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <Button type="submit" className="btn-gold" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--g4)', color: '#000', fontWeight: 800, borderRadius: '12px' }}>
                <span className="material-symbols-outlined">add_box</span> Add to Inventory
              </Button>
            </form>
          )}

          {tab === 'invoice' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {status === 'idle' && (
                  <>
                    <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed #2a2a2a', borderRadius: '16px', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: '#111', cursor: 'pointer' }}>
                       <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--g4)' }}>cloud_upload</span>
                       <p style={{ fontWeight: 700 }}>Click to upload Invoice PDF</p>
                    </div>
                    <button onClick={() => showDemoResults('Demo.pdf')} style={{ background: 'none', border: '1px dashed #2a2a2a', borderRadius: '12px', padding: '1rem', color: 'var(--t3)', fontSize: '.8rem' }}>
                       Try with Demo generated invoice
                    </button>
                  </>
                )}
                
                {status === 'processing' && (
                   <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <span className="material-symbols-outlined aspin" style={{ fontSize: '3rem', color: 'var(--g4)', marginBottom: '1rem' }}>sync</span>
                      <p style={{ fontWeight: 700 }}>Processing Invoice...</p>
                   </div>
                )}

                {status === 'results' && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1rem', border: '1px solid #2a2a2a' }}>
                         <p style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Distributor</p>
                         <p style={{ fontSize: '.9rem', fontWeight: 800 }}>{parsedData.distributor_name}</p>
                      </div>
                      {parsedProducts.map((p, i) => (
                         <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '1rem', border: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <p style={{ fontSize: '.85rem', fontWeight: 700 }}>{p.name}</p>
                               <p style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Qty: {p.quantity} · Price: ₹{p.unit_price}</p>
                            </div>
                            <button onClick={() => addParsedItem(i)} disabled={p.added} style={{ background: p.added ? 'transparent' : 'var(--g4)', color: p.added ? 'var(--g4)' : '#000', border: p.added ? '1px solid var(--g4)' : 'none', padding: '.4rem .8rem', borderRadius: '8px', fontSize: '.75rem', fontWeight: 800 }}>
                               {p.added ? 'Added' : 'Add'}
                            </button>
                         </div>
                      ))}
                      <Button onClick={() => navigate('/inventory')} style={{ marginTop: '1rem' }}>Done</Button>
                   </div>
                )}
             </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>
    </AppLayout>
  );
};
