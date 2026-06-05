import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

export const WalletAdd = () => {
    const navigate = useNavigate();
    const { setWalletBalance, addTransaction, walletBalance } = useAppContext();
    const [amount, setAmount] = useState('');

    const handleAdd = () => {
        const val = Number(amount);
        if (val > 0) {
            setWalletBalance(prev => prev + val);
            addTransaction({
                type: 'purchase',
                label: 'Added to Wallet',
                sub: 'Bank Transfer',
                date: 'Just now',
                amt: '+₹' + val.toFixed(2),
                clr: '#d4a574',
                icon: 'account_balance_wallet'
            });
            showToast(`✅ Added ₹${val.toLocaleString('en-IN')} to wallet.`);
            navigate('/wallet');
        } else {
            showToast('⚠️ Please enter a valid amount.');
        }
    };

    return (
        <div className="screen active" style={{ background: 'var(--bg1)' }}>
            <Header title="Add Funds" backTo="/wallet" />
            <div className="scroller" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '4rem', height: '4rem', background: 'rgba(212,165,116,.1)', border: '1px solid rgba(212,165,116,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--g4)' }}>account_balance_wallet</span>
                    </div>
                    <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '.2rem' }}>Current Balance</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>

                <div className="au d1" style={{ background: 'var(--bg2)', padding: '1.25rem', borderRadius: 'var(--r12)', border: '1px solid var(--bdr)' }}>
                    <p style={{ fontSize: '.75rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.8rem' }}>Enter Amount (₹)</p>
                    <input 
                        type="number" 
                        className="ifield" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{ fontSize: '1.8rem', padding: '1rem', fontFamily: 'var(--fm)', fontWeight: 800, textAlign: 'center' }} 
                        autoFocus
                    />
                    
                    <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem', justifyContent: 'center' }}>
                        {[500, 1000, 5000].map(val => (
                            <button key={val} onClick={() => setAmount(val.toString())} className="btn-ghost" style={{ padding: '.5rem 1rem', borderRadius: '9999px', fontSize: '.8rem', flex: 1 }}>
                                +₹{val}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <Button onClick={handleAdd} disabled={!amount || Number(amount) <= 0}>
                        Securely Add Funds
                    </Button>
                </div>
            </div>
        </div>
    );
};
