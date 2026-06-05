import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

export const ManualAddModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    cat: 'General',
    unit: 'pcs',
    qty: '',
    buy: '',
    sell: '',
    code: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.qty || !form.sell) return;
    
    onAdd({
      ...form,
      qty: Number(form.qty),
      buy: Number(form.buy || 0),
      sell: Number(form.sell),
      earn: Number((form.sell - (form.buy || form.sell*0.9)) * 0.1).toFixed(2), // dummy earning logic
      icon: 'inventory_2',
      clr: '#78f275'
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      animation: 'fadein .2s both'
    }}>
      <div style={{ 
        background: 'var(--bg1)', 
        width: '100%', 
        borderRadius: '1.5rem 1.5rem 0 0', 
        padding: '1.5rem 1.25rem 2rem',
        animation: 'slideUpIn .3s ease-out both'
      }}>
        <div style={{ width: '36px', height: '4px', background: 'var(--bg4)', borderRadius: '9999px', margin: '0 auto 1.25rem' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add Product Manually</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            placeholder="Product Name (e.g. Urea 46%)" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '.75rem' }}>
            <Input 
              placeholder="Category" 
              value={form.cat} 
              onChange={e => setForm({...form, cat: e.target.value})} 
            />
            <Input 
              placeholder="Unit (kg/pcs)" 
              value={form.unit} 
              onChange={e => setForm({...form, unit: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem' }}>
            <div>
               <label style={{ fontSize: '.65rem', color: 'var(--t3)', marginLeft: '.4rem', marginBottom: '.3rem', display: 'block' }}>Stock Qty</label>
               <Input 
                 type="number" 
                 placeholder="0" 
                 value={form.qty} 
                 onChange={e => setForm({...form, qty: e.target.value})} 
                 required 
               />
            </div>
            <div>
               <label style={{ fontSize: '.65rem', color: 'var(--t3)', marginLeft: '.4rem', marginBottom: '.3rem', display: 'block' }}>Buy Price ₹</label>
               <Input 
                 type="number" 
                 placeholder="0" 
                 value={form.buy} 
                 onChange={e => setForm({...form, buy: e.target.value})} 
               />
            </div>
            <div>
               <label style={{ fontSize: '.65rem', color: 'var(--t3)', marginLeft: '.4rem', marginBottom: '.3rem', display: 'block' }}>Sell Price ₹</label>
               <Input 
                 type="number" 
                 placeholder="0" 
                 value={form.sell} 
                 onChange={e => setForm({...form, sell: e.target.value})} 
                 required 
               />
            </div>
          </div>

          <Input 
            placeholder="Product Code / SKU (Optional)" 
            value={form.code} 
            onChange={e => setForm({...form, code: e.target.value})} 
          />

          <Button type="submit" style={{ marginTop: '1rem' }}>
            Add to Stock Ledger
          </Button>
        </form>
      </div>
    </div>
  );
};
