import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAppContext } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const CAT_CONFIG = {
  rocher:     {label:'Ferrero Rocher',     emoji:'🍫'},
  gallery:    {label:'Golden Gallery',    emoji:'🌟'},
  raffaello:  {label:'Raffaello',         emoji:'🥥'},
  rondnoir:   {label:'Rondnoir',          emoji:'🍪'},
  hazelnut:   {label:'Hazelnut Special',  emoji:'🌰'},
  assortment: {label:'Assortments',       emoji:'🎁'},
};

export const ShopSetup = () => {
  const navigate = useNavigate();
  const { user, updateProfile, initializeAIStore } = useAppContext();
  
  const [shopName, setShopName] = useState(user.shop || '');
  const [ownerName, setOwnerName] = useState(user.name || '');
  const [gst, setGst] = useState('');
  const [category, setCategory] = useState(user.cat || 'rocher');
  const [locState, setLocState] = useState({ name: user.loc, coords: '', status: user.loc ? 'detected' : 'idle' });
  const [categoriesConfig, setCategoriesConfig] = useState(CAT_CONFIG);

  useEffect(() => {
    const fetchDBCategories = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('business_categories')
          .select('*');
        
        if (error) throw error;
        if (data && data.length > 0) {
          const config = {};
          data.forEach(item => {
            config[item.code] = { label: item.label, emoji: item.emoji };
          });
          setCategoriesConfig(config);
        }
      } catch (err) {
        console.warn('Using local category fallbacks:', err.message);
      }
    };
    fetchDBCategories();
  }, []);

  const fetchLoc = () => {
    setLocState({ name: '', coords: '', status: 'loading' });
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocState({ 
            name: 'Khetgaon, Madhya Pradesh', 
            coords: `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
            status: 'detected'
          });
          showToast('📍 Location detected!');
        },
        err => {
          setLocState({ name: 'Khetgaon, Madhya Pradesh', coords: '23.4587° N, 76.9318° E', status: 'detected' });
        },
        {timeout:5000}
      );
    } else {
      setLocState({ name: 'Khetgaon, Madhya Pradesh', coords: '23.4587° N, 76.9318° E', status: 'detected' });
    }
  };

  const handleNext = async () => {
    if (!shopName) { showToast('⚠️ Enter shop name'); return; }
    if (!ownerName) { showToast('⚠️ Enter owner name'); return; }
    
    // Seed initial inventory in background based on category
    const catLabel = categoriesConfig[category]?.label;
    initializeAIStore(category, catLabel);
    
    try {
      showToast('⏳ Saving registration...');
      await updateProfile({ 
        shop: shopName, 
        name: ownerName, 
        cat: category, 
        loc: locState.name || 'India', 
        role: 'retailer' 
      });
      showToast('✅ Saved!');
    } catch(e) {
      console.error(e);
    }
    
    navigate('/setup/distributor-link');
  };


  return (
    <div className="screen active">
      <div className="ghead" style={{ padding: '.875rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏪</span>
            <div><h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Shop Setup</h2><p style={{ fontSize: '.65rem', color: 'var(--t2)' }}>Step 1 of 4</p></div>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div className="odot act"></div><div className="odot todo"></div><div className="odot todo"></div><div className="odot todo"></div>
          </div>
        </div>
      </div>
      
      <div className="scroller" style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '1.4rem', lineHeight: 1.5 }}>Let's set up your digital storefront to find the right distributors and calculate your earning tiers.</p>
        
        <div className="au d1" style={{ display: 'grid', gap: '1.2rem', marginBottom: '1.5rem' }}>
          <Input label="Shop Name / Trade Name" placeholder="e.g. Ramesh Gift Corner" value={shopName} onChange={e=>setShopName(e.target.value)} />
          <Input label="Owner Name" placeholder="e.g. Ramesh Kumar" value={ownerName} onChange={e=>setOwnerName(e.target.value)} />
          <Input label="GST Number (Optional)" placeholder="e.g. 23XXXXX0000X1Z5" value={gst} onChange={e=>setGst(e.target.value)} style={{textTransform:'uppercase'}} />
        </div>

        <div className="au d2" style={{ marginBottom: '1.5rem' }}>
          <label className="ilabel">Business Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
            {Object.entries(categoriesConfig).map(([key, val]) => (
              <div 
                key={key} 
                className={`selopt ${category === key ? 'sel' : ''}`}
                onClick={() => setCategory(key)}
              >
                <div style={{ width: '2rem', height: '2rem', background: 'var(--bg3)', borderRadius: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{val.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '.78rem', fontWeight: 700, lineHeight: 1.2 }}>{val.label}</p>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: category === key ? 'var(--g4)' : 'var(--t3)' }}>
                  {category === key ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="au d3" style={{ marginBottom: '2rem' }}>
          <label className="ilabel">Shop Location</label>
          <div 
            onClick={locState.status === 'idle' ? fetchLoc : undefined}
            style={{ 
              background: locState.status==='idle' ? 'rgba(212,165,116,.04)' : locState.status==='loading' ? 'var(--bg2)' : 'rgba(212,165,116,.07)', 
              border: '2px dashed', 
              borderColor: locState.status==='idle' ? 'rgba(212,165,116,.22)' : locState.status==='loading' ? 'var(--bdr2)' : 'rgba(212,165,116,.38)',
              borderRadius: 'var(--r8)', padding: '1.1rem', textAlign: 'center', cursor: locState.status==='idle' ? 'pointer' : 'default', transition: 'all .25s' 
            }}
          >
            {locState.status === 'idle' && (
              <>
                <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--bg3)', borderRadius: '50%', margin: '0 auto .6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined fi" style={{ color: 'var(--g4)' }}>my_location</span></div>
                <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--g4)', marginBottom: '.2rem' }}>Detect My Location</p>
                <p style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Tap to auto-detect via GPS</p>
              </>
            )}
            {locState.status === 'loading' && (
              <>
                <div style={{ margin: '0 auto .6rem', display: 'flex', justifyContent: 'center' }}><span className="material-symbols-outlined aspin" style={{ color: 'var(--t2)', fontSize: '1.5rem' }}>sync</span></div>
                <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)' }}>Detecting...</p>
              </>
            )}
            {locState.status === 'detected' && (
              <>
                <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(212,165,116,.1)', borderRadius: '50%', margin: '0 auto .6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined fi" style={{ color: 'var(--g4)' }}>location_on</span></div>
                <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--g4)', marginBottom: '.2rem' }}>Location Detected ✓</p>
                <p style={{ fontSize: '.68rem', color: 'var(--t2)' }}>{locState.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setLocState({name:'',coords:'',status:'idle'}) }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '.7rem', marginTop: '.5rem', cursor: 'pointer' }}>Clear</button>
              </>
            )}
          </div>
          {locState.status !== 'detected' && (
            <div style={{ marginTop: '.8rem' }}>
              <Input placeholder="Or enter manual address (e.g. Indore, MP)" value={locState.name || ''} onChange={e => setLocState(prev => ({...prev, name: e.target.value}))} />
            </div>
          )}
        </div>

        <div className="au d4" style={{ paddingBottom: '1.5rem' }}>
          <Button onClick={handleNext}>Continue to Distributors <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span></Button>
        </div>
      </div>
    </div>
  );
};
