import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { showToast } from '../components/ui/Toast';
import { useAppContext } from '../context/AppContext';
import { Chip } from '../components/ui/Chip';

export const BuyFromDist = () => {
  const navigate = useNavigate();
  const { user, placeB2BOrder, distOrders, linkedDists } = useAppContext();
  
  const distOptions = linkedDists && linkedDists.length > 0 
    ? linkedDists 
    : [
        { id: 'dist_1', name: 'Gupta Ferrero Rocher Wholesaler' },
        { id: 'dist_2', name: 'MP Premium Sweets & Chocolates' },
        { id: 'dist_3', name: 'Khetgaon Confectioners Ltd' },
      ];

  const [selectedDistId, setSelectedDistId] = useState(distOptions[0]?.id || 'dist_1');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  
  const myOrders = distOrders.filter(o => o.retailer === (user.shop || user.name));

  const [productsState, setProductsState] = useState([
    { id: 1, name: 'Ferrero Rocher 48 pieces', sku: 'FR-48', unit: 'Box', price: 300, category: 'Rocher' },
    { id: 2, name: 'Ferrero Rocher 16 pieces', sku: 'FR-16', unit: 'Box', price: 110, category: 'Rocher' },
    { id: 3, name: 'Ferrero Rocher 8 pieces', sku: 'FR-8', unit: 'Pack', price: 60, category: 'Rocher' },
    { id: 4, name: 'Ferrero Rocher Single', sku: 'FR-1', unit: 'Piece', price: 15, category: 'Rocher' },
    { id: 5, name: 'Golden Gallery 42 pieces', sku: 'GG-42', unit: 'Box', price: 250, category: 'Golden Gallery' },
    { id: 6, name: 'Golden Gallery 18 pieces', sku: 'GG-18', unit: 'Box', price: 120, category: 'Golden Gallery' },
    { id: 7, name: 'Raffaello 42 pieces', sku: 'RAF-42', unit: 'Box', price: 280, category: 'Raffaello' },
    { id: 8, name: 'Raffaello 20 pieces', sku: 'RAF-20', unit: 'Box', price: 145, category: 'Raffaello' },
    { id: 9, name: 'Rondnoir 42 pieces', sku: 'RND-42', unit: 'Box', price: 280, category: 'Rondnoir' },
    { id: 10, name: 'Rondnoir 20 pieces', sku: 'RND-20', unit: 'Box', price: 145, category: 'Rondnoir' },
    { id: 11, name: 'Hazelnut Specialty Box', sku: 'HNT-BOX', unit: 'Box', price: 320, category: 'Hazelnut' },
    { id: 12, name: 'Hazelnut Truffle Pieces', sku: 'HNT-TRU', unit: 'Pack', price: 80, category: 'Hazelnut' },
    { id: 13, name: 'Premium Assortment Box', sku: 'PREM-BOX', unit: 'Box', price: 400, category: 'Assortment' },
    { id: 14, name: 'Holiday Gift Set', sku: 'GIFT-SET', unit: 'Box', price: 500, category: 'Gift Set' }
  ]);

  useEffect(() => {
    const fetchDBProducts = async () => {
      const { supabase, isSupabaseConfigured } = await import('../services/supabase');
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('ferrero_products')
          .select('*')
          .eq('is_active', true);
        if (error) throw error;
        if (data && data.length > 0) {
          setProductsState(data.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            unit: p.unit || 'Box',
            price: Number(p.cost_price || 0),
            category: p.category
          })));
        }
      } catch (err) {
        console.error('Failed to load DB Ferrero products:', err);
      }
    };
    fetchDBProducts();
  }, []);

  const allProducts = productsState;

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  
  const catalog = allProducts.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`🛒 Added ${product.name} to cart`);
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      showToast('⚠️ Cart is empty!');
      return;
    }
    
    const selectedDistName = distOptions.find(d => d.id === selectedDistId)?.name || 'Gupta Ferrero Rocher Wholesaler';
    
    placeB2BOrder({
      retailer: user.shop || user.name,
      distributorName: selectedDistName,
      items: cart.reduce((sum, item) => sum + item.qty, 0),
      total: total,
      cartItems: cart.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price }))
    });
    
    setCart([]);
    showToast('✅ Order Placed Successfully!');
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="screen active">
      <Header title="Order from Distributor" backTo="/home" />
      
      <div className="scroller" style={{ padding: '1rem', paddingBottom: '6rem' }}>
        
        {/* Distributor Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: 'var(--t2)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Select Distributor
          </label>
          <select 
            value={selectedDistId}
            onChange={(e) => setSelectedDistId(e.target.value)}
            style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', padding: '1rem', color: 'var(--t1)', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
          >
            {distOptions.map(dist => (
              <option key={dist.id} value={dist.id}>{dist.name}</option>
            ))}
          </select>
        </div>

        {/* Product Category Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: 'var(--t2)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Filter Products
          </label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: 'var(--r8)', padding: '1rem', color: 'var(--t1)', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '.8rem', marginBottom: '2rem' }}>
          {catalog.map(product => (
            <div key={product.id} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '.95rem' }}>{product.name}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{product.unit} · ₹{product.price}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                style={{ background: 'rgba(212,165,116,.1)', border: '1px solid rgba(212,165,116,.3)', color: 'var(--g4)', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="au" style={{ background: 'var(--bg2)', border: '1px dashed var(--g4)', borderRadius: 'var(--r12)', padding: '1rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--g4)' }}>Purchase Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.8rem' }}>
                <span>{item.qty}x {item.name}</span>
                <span style={{ fontWeight: 800 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--bdr2)', marginTop: '.8rem', paddingTop: '.8rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Payable</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {myOrders.length > 0 && (
          <div className="au d2" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>My Order History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              {myOrders.map(order => (
                <div key={order.id} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)', padding: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '.95rem' }}>{order.id}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{order.items} items</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--g4)' }}>₹{order.total.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{order.time}</p>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--bdr2)' }}>
                      {order.status === 'pending' ? (
                        <Chip variant="o">Pending Approval</Chip>
                      ) : order.status === 'rejected' ? (
                        <span style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--e4)', border: '1px solid rgba(255,107,107,0.3)', padding: '.2rem .6rem', borderRadius: '1rem', fontSize: '.75rem', fontWeight: 700 }}>Rejected</span>
                      ) : order.status === 'approved' ? (
                        <Chip variant="o">Approved (To Deliver)</Chip>
                      ) : (
                        <Chip variant="g">Fulfilled</Chip>
                      )}
                      
                      {order.status === 'pending' && <p style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Waiting for distributor...</p>}
                      {order.status === 'approved' && (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '.7rem', color: 'var(--t2)', marginBottom: '.2rem' }}>Delivery OTP</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--g4)' }}>{order.otp}</p>
                        </div>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', borderTop: '1px solid var(--bdr)', background: 'var(--bg1)', zIndex: 10 }}>
        <Button onClick={placeOrder} className="btn-gold" style={{ opacity: cart.length === 0 ? 0.5 : 1 }}>
          Place Order · ₹{total.toLocaleString('en-IN')}
        </Button>
      </div>
    </div>
  );
};
