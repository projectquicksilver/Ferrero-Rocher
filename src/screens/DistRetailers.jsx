import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { Input } from '../components/ui/Input';

export const DistRetailers = () => {
  const navigate = useNavigate();
  const { myRetailers, setMyRetailers } = useAppContext();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newRet, setNewRet] = useState({ name: '', owner: '', mobile: '', district: '', village: '', pincode: '' });

  const filtered = myRetailers.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const getTierColor = (tier) => {
    switch(tier.toLowerCase()) {
      case 'gold': return 'var(--o4)'; 
      case 'diamond': return '#a0d2ff'; 
      case 'silver': return '#d1d1d1'; 
      case 'bronze': return '#cd7f32'; 
      default: return 'var(--t3)';
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newRet.name) return;
    setMyRetailers(prev => [{
      id: `RET-00${prev.length + 1}`,
      name: newRet.name,
      owner: newRet.owner,
      mobile: newRet.mobile,
      location: `${newRet.village ? newRet.village + ', ' : ''}${newRet.district} ${newRet.pincode}`,
      ltv: 0,
      tier: 'Bronze',
      lastOrder: 'Just Added'
    }, ...prev]);
    setShowAdd(false);
    setNewRet({ name: '', owner: '', mobile: '', district: '', village: '', pincode: '' });
  };

  return (
    <div className="screen active">
      <Header 
        title="My Retailers" 
        backTo="/distributor-home" 
        subtitle={`${myRetailers.length} Active Clients`} 
        rightContent={
          <button onClick={() => setShowAdd(true)} style={{ background: 'transparent', border: 'none', color: 'var(--g4)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>person_add</span>
          </button>
        }
      />
      
      <div className="scroller" style={{ padding: '1rem' }}>
        <Input 
          wrapperClass="au d1 margin-bottom-1" 
          placeholder="Search retailers..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<span className="material-symbols-outlined" style={{ color: 'var(--t3)', alignSelf: 'center', marginLeft: '.5rem', fontSize: '1.1rem' }}>search</span>}
          style={{ paddingLeft: '0', border: 'none', background: 'transparent' }}
          wrapperStyle={{ background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', display: 'flex', marginBottom: '1.5rem' }}
        />

        {showAdd && (
          <form onSubmit={handleAdd} className="au" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', marginBottom: '1.5rem' }}>
             <p style={{ fontWeight: 800, marginBottom: '1rem' }}>Add New Retailer</p>
             
             <Input 
               placeholder="Retailer Shop Name" 
               value={newRet.name} 
               onChange={e => setNewRet({...newRet, name: e.target.value})} 
               wrapperStyle={{ background: 'var(--bg3)', border: 'none', marginBottom: '.8rem' }}
               required
               autoFocus
             />
             <Input 
               placeholder="Owner / Person Name" 
               value={newRet.owner} 
               onChange={e => setNewRet({...newRet, owner: e.target.value})} 
               wrapperStyle={{ background: 'var(--bg3)', border: 'none', marginBottom: '.8rem' }}
               required
             />
             <Input 
               type="tel"
               placeholder="Mobile Number" 
               maxLength={10}
               value={newRet.mobile} 
               onChange={e => setNewRet({...newRet, mobile: e.target.value})} 
               wrapperStyle={{ background: 'var(--bg3)', border: 'none', marginBottom: '.8rem' }}
               required
             />
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '.8rem' }}>
               <Input 
                 placeholder="District" 
                 value={newRet.district} 
                 onChange={e => setNewRet({...newRet, district: e.target.value})} 
                 wrapperStyle={{ background: 'var(--bg3)', border: 'none' }}
                 required
               />
               <Input 
                 placeholder="Village/City" 
                 value={newRet.village} 
                 onChange={e => setNewRet({...newRet, village: e.target.value})} 
                 wrapperStyle={{ background: 'var(--bg3)', border: 'none' }}
                 required
               />
             </div>
             <Input 
               placeholder="Pincode" 
               type="number"
               value={newRet.pincode} 
               onChange={e => setNewRet({...newRet, pincode: e.target.value})} 
               wrapperStyle={{ background: 'var(--bg3)', border: 'none', marginBottom: '1.2rem' }}
               required
             />
             
             <div style={{ display: 'flex', gap: '.8rem' }}>
               <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--t2)', padding: '.6rem', borderRadius: 'var(--r8)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
               <button type="submit" style={{ flex: 1, background: 'var(--g4)', border: 'none', color: '#000', padding: '.6rem', borderRadius: 'var(--r8)', fontWeight: 800, cursor: 'pointer' }}>Save Retailer</button>
             </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.85rem', padding: '2rem 0' }}>No retailers found.</p>
          ) : (
            filtered.map((retailer, i) => (
              <div key={retailer.id} className="au" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--bg3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: getTierColor(retailer.tier), fontSize: '1.4rem' }}>storefront</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.3rem' }}>
                    <p style={{ fontWeight: 800, fontSize: '.95rem' }}>{retailer.name}</p>
                    <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#000', background: getTierColor(retailer.tier), padding: '.15rem .4rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {retailer.tier}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>ID: {retailer.id}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Last order: {retailer.lastOrder}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
