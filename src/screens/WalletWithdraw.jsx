import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

export const WalletWithdraw = () => {
    const navigate = useNavigate();
    const { setWalletBalance, addTransaction, walletBalance } = useAppContext();
    const [amount, setAmount] = useState('');

    const handleWithdraw = () => {
        const val = Number(amount);
        if (val > 0) {
            if (val > walletBalance) {
                showToast('⚠️ Insufficient wallet balance for this withdrawal.');
                return;
            }
            setWalletBalance(prev => prev - val);
            addTransaction({
                type: 'withdraw',
                label: 'Withdrawal to Bank',
                sub: 'Instant Transfer',
                date: 'Just now',
                amt: '-₹' + val.toFixed(2),
                clr: '#ef4444',
                icon: 'send_money'
            });
            showToast(`✅ Withdrawn ₹${val.toLocaleString('en-IN')} to bank.`);
            navigate('/wallet');
        } else {
            showToast('⚠️ Please enter a valid amount.');
        }
    };

    return (
        <div className="screen active" style={{ background: 'var(--bg1)' }}>
            <Header title="Withdraw Funds" backTo="/wallet" />
            <div className="scroller" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '4rem', height: '4rem', background: 'rgba(160,210,255,.08)', border: '1px solid rgba(160,210,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--td)' }}>account_balance</span>
                    </div>
                    <p style={{ fontSize: '.85rem', color: 'var(--t2)', marginBottom: '.2rem' }}>Available to Withdraw</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>

                <div className="au d1" style={{ background: 'var(--bg2)', padding: '1.25rem', borderRadius: 'var(--r12)', border: '1px solid var(--bdr)' }}>
                    <p style={{ fontSize: '.75rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.8rem' }}>Withdraw Amount (₹)</p>
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
                        <button onClick={() => setAmount((walletBalance * 0.25).toFixed(0))} className="btn-ghost" style={{ padding: '.5rem 1rem', borderRadius: '9999px', fontSize: '.8rem', flex: 1 }}>
                            25%
                        </button>
                        <button onClick={() => setAmount((walletBalance * 0.50).toFixed(0))} className="btn-ghost" style={{ padding: '.5rem 1rem', borderRadius: '9999px', fontSize: '.8rem', flex: 1 }}>
                            50%
                        </button>
                        <button onClick={() => setAmount(walletBalance.toString())} className="btn-ghost" style={{ padding: '.5rem 1rem', borderRadius: '9999px', fontSize: '.8rem', flex: 1 }}>
                            Max
                        </button>
                    </div>
                </div>

                <div className="au d2" style={{ background: 'rgba(255,208,96,.06)', border: '1px solid rgba(255,208,96,.18)', borderRadius: 'var(--r8)', padding: '1rem', marginTop: '1rem', display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--o4)', fontSize: '1.2rem' }}>info</span>
                    <p style={{ fontSize: '.75rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                        Withdrawals are processed instantly via IMPS to your default connected Bank Account ending in **4982**.
                    </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <Button onClick={handleWithdraw} disabled={!amount || Number(amount) <= 0 || Number(amount) > walletBalance}>
                        Confirm Withdrawal
                    </Button>
                </div>
            </div>
        </div>
    );
};
