import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAppContext } from '../../context/AppContext';
import { Intelligence } from '../../services/intelligence';
import { ErrorLogger } from '../../services/errorLogger';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

// Instant fallback distributors - shown immediately
const getFallbackDistributors = (category) => {
  const categoryMap = {
    rocher: [
      {id: 1, name:'Gupta Ferrero Rocher Wholesaler',city:'Indore',products:['Rocher Classic','Rocher Box'],rating:4.8,distance:12,emoji:'🍫'},
      {id: 2, name:'MP Premium Sweets & Chocolates',city:'Bhopal',products:['Ferrero Rocher','Assorted'],rating:4.5,distance:28,emoji:'👑'},
      {id: 3, name:'Khetgaon Confectioners Ltd',city:'Khetgaon',products:['Rocher 16pc','Rocher 8pc'],rating:4.6,distance:5,emoji:'📦'},
    ],
    gallery: [
      {id: 1, name:'Golden Gallery Wholesale',city:'Indore',products:['Golden Collection','GG-42'],rating:4.7,distance:10,emoji:'🌟'},
      {id: 2, name:'Madhya Pradesh Gift Emporium',city:'Khetgaon',products:['GG-18','GG-42'],rating:4.5,distance:4,emoji:'🎁'},
      {id: 3, name:'Central India Confectionery',city:'Bhopal',products:['Golden Gallery'],rating:4.6,distance:26,emoji:'📦'},
    ],
    raffaello: [
      {id: 1, name:'Raffaello Coconut Sweets',city:'Indore',products:['Raffaello 42pc','RAF-20'],rating:4.7,distance:11,emoji:'🥥'},
      {id: 2, name:'Coconut Specialty Distributors',city:'Khetgaon',products:['Raffaello','Coconut Wafer'],rating:4.4,distance:6,emoji:'📦'},
      {id: 3, name:'Royal Cocoa Supplies',city:'Ujjain',products:['Raffaello 42pc'],rating:4.6,distance:34,emoji:'👑'},
    ],
    rondnoir: [
      {id: 1, name:'Rondnoir Dark Chocolate Dist.',city:'Indore',products:['Rondnoir 42pc','RND-20'],rating:4.7,distance:9,emoji:'🍪'},
      {id: 2, name:'Dark Truffle Distributors',city:'Khetgaon',products:['Rondnoir','Dark Wafer'],rating:4.5,distance:5,emoji:'🟤'},
      {id: 3, name:'Elite Cocoa Suppliers',city:'Ujjain',products:['Rondnoir 42pc'],rating:4.6,distance:31,emoji:'🖤'},
    ],
    hazelnut: [
      {id: 1, name:'Hazelnut Truffle Wholesalers',city:'Indore',products:['Specialty Box','HNT-BOX'],rating:4.8,distance:7,emoji:'🌰'},
      {id: 2, name:'Premium Hazelnut Supplies',city:'Khetgaon',products:['Hazelnut Truffle','HNT-TRU'],rating:4.6,distance:4,emoji:'📦'},
      {id: 3, name:'Global Specialty Foods',city:'Bhopal',products:['Hazelnut Box'],rating:4.5,distance:25,emoji:'🏢'},
    ],
    assortment: [
      {id: 1, name:'Holiday Gift Box Distributors',city:'Indore',products:['Premium Assortment','GIFT-SET'],rating:4.8,distance:8,emoji:'🎁'},
      {id: 2, name:'Elite Gift Distributors',city:'Khetgaon',products:['Holiday Gift Set','PREM-BOX'],rating:4.6,distance:4,emoji:'💝'},
      {id: 3, name:'Central Sweets & Gift Co',city:'Bhopal',products:['Assortment Boxes'],rating:4.5,distance:25,emoji:'🏢'},
    ]
  };

  return categoryMap[category] || categoryMap.rocher;
};

export const Distributor = () => {
  const navigate = useNavigate();
  const { user, linkedDists, saveConnectionLink, setLinkedDists } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [dists, setDists] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadDistributors = async () => {
      const fallbacks = getFallbackDistributors(user.cat);
      
      if (!isSupabaseConfigured || !supabase) {
        setDists(fallbacks);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'distributor');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            name: d.shop || d.name,
            city: d.loc || 'Indore',
            products: [d.cat || 'Wholesale'],
            rating: 4.8,
            distance: 5,
            emoji: '🏭'
          }));
          
          const merged = [...mapped];
          fallbacks.forEach(f => {
            if (!merged.some(m => m.name.toLowerCase() === f.name.toLowerCase())) {
              merged.push(f);
            }
          });
          setDists(merged);
        } else {
          setDists(fallbacks);
        }
      } catch (err) {
        console.error('Failed to load DB distributors:', err);
        setDists(fallbacks);
      } finally {
        setLoading(false);
      }
    };

    loadDistributors();
  }, [user.cat]);

  const toggleLink = async (dist) => {
    if (isSupabaseConfigured && supabase) {
      await saveConnectionLink(dist);
      const isLinked = linkedDists.some(d => d.id === dist.id);
      showToast(isLinked ? 'Unlinked' : `✅ ${dist.name} linked!`);
    } else {
      const isLinked = linkedDists.some(d => d.id === dist.id);
      if (isLinked) {
        setLinkedDists(prev => prev.filter(d => d.id !== dist.id));
        showToast('Unlinked');
      } else {
        setLinkedDists(prev => [...prev, dist]);
        showToast(`✅ ${dist.name} linked!`);
      }
    }
  };

  const filtered = dists.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="screen active">
      <div className="ghead" style={{ padding: '.875rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🤝</span>
            <div><h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Link Distributors</h2><p style={{ fontSize: '.65rem', color: 'var(--t2)' }}>Step 2 of 4</p></div>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div className="odot done"></div><div className="odot act"></div><div className="odot todo"></div><div className="odot todo"></div>
          </div>
        </div>
      </div>
      
      <div className="scroller" style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '1.4rem', lineHeight: 1.5 }}>Connect with your wholesale suppliers to unlock <strong style={{ color: 'var(--t1)' }}>Purchase Cashback</strong> on every invoice you upload.</p>
        
        {loading && (
          <div className="au" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'rgba(212,165,116,.06)', border: '1px solid rgba(212,165,116,.2)', borderRadius: 'var(--r8)', padding: '.875rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined aspin" style={{ color: 'var(--g4)', fontSize: '1.2rem' }}>auto_awesome</span>
            </div>
            <div>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--g4)' }}>CounterOS AI</p>
              <p style={{ fontSize: '.68rem', color: 'var(--t2)' }}>Finding nearby distributors in {user.loc}...</p>
            </div>
          </div>
        )}

        <Input 
          wrapperClass="au d1 margin-bottom-1" 
          placeholder="Search distributor name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<span className="material-symbols-outlined" style={{ color: 'var(--t3)', alignSelf: 'center', marginLeft: '.5rem', fontSize: '1.1rem' }}>search</span>}
          style={{ paddingLeft: '0', border: 'none', background: 'transparent' }}
          wrapperStyle={{ background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', display: 'flex' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--t3)' }}>
              <p style={{ fontSize: '.85rem' }}>No distributors found</p>
            </div>
          ) : (
            filtered.map((d, i) => {
              const isLinked = linkedDists.some(x => x.id === d.id);
              return (
                <div key={d.id} className={`dres ${isLinked ? 'linked' : ''} au`} style={{ animationDelay: `${i * 0.06}s` }} onClick={() => toggleLink(d)}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--r8)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{d.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>📍 {d.city}</span>
                      <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>· {d.distance}km</span>
                      <span style={{ fontSize: '.68rem', color: 'var(--o4)' }}>⭐ {d.rating}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '.28rem', marginTop: '.25rem', flexWrap: 'wrap' }}>
                      {d.products.map(p => <span key={p} style={{ fontSize: '.6rem', padding: '.1rem .4rem', background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: '9999px', color: 'var(--t2)' }}>{p}</span>)}
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
