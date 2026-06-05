import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAppContext } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

// Instant fallback retailers - shown immediately
const getFallbackRetailers = () => {
  return [
    {id: 1, name:'Kumar Sweet House',city:'Khetgaon',products:['Ferrero Rocher','Raffaello'],rating:4.7,distance:12,emoji:'🏪'},
    {id: 2, name:'Patel Gift Store',city:'Dewas',products:['Golden Gallery','Rondnoir'],rating:4.3,distance:28,emoji:'🏪'},
    {id: 3, name:'Sharma Confectionery',city:'Ratlam',products:['Rocher 16pc','Hazelnut Box'],rating:4.5,distance:5,emoji:'🏪'},
    {id: 4, name:'Verma Premium Gifts',city:'Sehore',products:['Premium Assortment','Gift Set'],rating:4.6,distance:18,emoji:'🏪'},
    {id: 5, name:'Singh Luxury Sweets',city:'Mandsaur',products:['Ferrero Rocher','Raffaello'],rating:4.4,distance:22,emoji:'🏪'}
  ];
};

export const DistLinkRetailers = () => {
  const navigate = useNavigate();
  const { user, linkedDists, saveConnectionLink, setLinkedDists } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [retailers, setRetailers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadRetailers = async () => {
      const fallbacks = getFallbackRetailers();
      
      if (!isSupabaseConfigured || !supabase) {
        setRetailers(fallbacks);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'retailer');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapped = data.map(r => ({
            id: r.id,
            name: r.shop || r.name,
            city: r.loc || 'Khetgaon',
            products: [r.cat || 'Ferrero Rocher'],
            rating: 4.6,
            distance: 8,
            emoji: '🏪'
          }));
          
          const merged = [...mapped];
          fallbacks.forEach(f => {
            if (!merged.some(m => m.name.toLowerCase() === f.name.toLowerCase())) {
              merged.push(f);
            }
          });
          setRetailers(merged);
        } else {
          setRetailers(fallbacks);
        }
      } catch (err) {
        console.error('Failed to load DB retailers:', err);
        setRetailers(fallbacks);
      } finally {
        setLoading(false);
      }
    };

    loadRetailers();
  }, [user.cat]);

  const toggleLink = async (retailer) => {
    if (isSupabaseConfigured && supabase) {
      await saveConnectionLink(retailer);
      const isLinked = linkedDists.some(d => d.id === retailer.id);
      showToast(isLinked ? 'Unlinked' : `✅ ${retailer.name} linked!`);
    } else {
      const isLinked = linkedDists.some(d => d.id === retailer.id);
      if (isLinked) {
        setLinkedDists(prev => prev.filter(d => d.id !== retailer.id));
        showToast('Unlinked');
      } else {
        setLinkedDists(prev => [...prev, retailer]);
        showToast(`✅ ${retailer.name} linked!`);
      }
    }
  };

  const filtered = retailers.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="screen active">
      <div className="ghead" style={{ padding: '.875rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🤝</span>
            <div><h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Link Retailers</h2><p style={{ fontSize: '.65rem', color: 'var(--t2)' }}>Step 2 of 4</p></div>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div className="odot done"></div><div className="odot act"></div><div className="odot todo"></div><div className="odot todo"></div>
          </div>
        </div>
      </div>
      
      <div className="scroller" style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '1.4rem', lineHeight: 1.5 }}>Connect with local retailers to start receiving their purchase orders directly through CounterOS.</p>
        
        {loading && (
          <div className="au" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'rgba(212,165,116,.06)', border: '1px solid rgba(212,165,116,.2)', borderRadius: 'var(--r8)', padding: '.875rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined aspin" style={{ color: 'var(--g4)', fontSize: '1.2rem' }}>auto_awesome</span>
            </div>
            <div>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--g4)' }}>CounterOS AI</p>
              <p style={{ fontSize: '.68rem', color: 'var(--t2)' }}>Finding nearby retailers in {user.loc}...</p>
            </div>
          </div>
        )}

        <Input 
          wrapperClass="au d1 margin-bottom-1" 
          placeholder="Search retailer name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<span className="material-symbols-outlined" style={{ color: 'var(--t3)', alignSelf: 'center', marginLeft: '.5rem', fontSize: '1.1rem' }}>search</span>}
          style={{ paddingLeft: '0', border: 'none', background: 'transparent' }}
          wrapperStyle={{ background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', display: 'flex' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--t3)' }}>
              <p style={{ fontSize: '.85rem' }}>No retailers found</p>
            </div>
          ) : (
            filtered.map((r, i) => {
              const isLinked = linkedDists.some(x => x.id === r.id);
              return (
                <div key={r.id} className={`dres ${isLinked ? 'linked' : ''} au`} style={{ animationDelay: `${i * 0.06}s` }} onClick={() => toggleLink(r)}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--r8)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{r.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>📍 {r.city}</span>
                      <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>· {r.distance}km</span>
                      <span style={{ fontSize: '.68rem', color: 'var(--o4)' }}>⭐ {r.rating}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '.28rem', marginTop: '.25rem', flexWrap: 'wrap' }}>
                      {r.products.map(p => <span key={p} style={{ fontSize: '.6rem', padding: '.1rem .4rem', background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: '9999px', color: 'var(--t2)' }}>{p}</span>)}
                    </div>
                  </div>
                  <button style={{ background: isLinked ? 'rgba(212,165,116,.14)' : 'var(--bg3)', border: `1px solid ${isLinked ? 'rgba(212,165,116,.28)' : 'var(--bdr2)'}`, borderRadius: 'var(--r6)', padding: '.38rem .7rem', cursor: 'pointer', color: isLinked ? 'var(--g4)' : 'var(--t2)', fontSize: '.72rem', fontWeight: 700, fontFamily: 'var(--fd)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '.22rem', transition: 'all .18s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.8rem' }}>{isLinked ? 'check' : 'add'}</span>{isLinked ? 'Linked' : 'Link'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="au" style={{ animationDelay: '0.4s', paddingBottom: '1.5rem' }}>
          <Button onClick={() => navigate('/setup/payout')}>Continue to Payout Setup <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span></Button>
        </div>
      </div>
    </div>
  );
};
