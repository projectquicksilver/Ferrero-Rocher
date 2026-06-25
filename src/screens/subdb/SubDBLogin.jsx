import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSubDB } from './SubDBContext';
import { OtpInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SubDBLogin = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, loginOrRegister, showToast } = useSubDB();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  // Redirect as soon as we know the destination (avoids navigate+setTimeout race)
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      showToast('⚠️ Enter a valid 10-digit number', 'error');
      return;
    }
    await sendOTP(phone);
    setStep('otp');
    showToast('📱 OTP sent! Demo: 1234', 'info');
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      showToast('⚠️ Enter the 4-digit OTP', 'error');
      return;
    }

    if (!verifyOTP(phone, otp)) {
      showToast('❌ Wrong OTP. Use: 1234', 'error');
      setOtp('');
      return;
    }

    setLoading(true);
    try {
      showToast('⏳ Logging in...', 'info');
      const { user } = await loginOrRegister(phone);
      showToast('✅ Verified!', 'success');
      // Use state-driven redirect — avoids navigate+setTimeout race condition
      setRedirectTo(!user.name ? '/subdb_platform/profile' : '/subdb_platform/dashboard');
    } catch (err) {
      console.error('[SubDB] login error:', err);
      showToast('❌ Login failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" id="s-subdb-login">
      {/* Background gradient matching app theme */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(212,165,116,.15), transparent), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(196,30,58,.08), transparent)',
        pointerEvents: 'none'
      }} />

      <div className="scroller" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Header Icon Block */}
        <div style={{
          paddingTop: '3.5rem', paddingBottom: '1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}>
          {/* Sub-DB Icon */}
          <div style={{
            width: '5rem', height: '5rem',
            background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
            borderRadius: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(212,165,116,0.35)',
            marginBottom: '1.25rem'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#fff' }}>
              receipt_long
            </span>
          </div>

          <h1 style={{
            fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-.03em',
            color: 'var(--t1)', margin: '0 0 .4rem'
          }}>
            Sub-<span style={{ color: '#d4a574' }}>DB</span>
          </h1>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>
            Field Invoice Platform
          </p>
        </div>

        {/* Form Card */}
        <div className="au login-panel">

          {step === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.4rem' }}>
                Sign In as EMP
              </p>
              <p style={{ fontSize: '.85rem', color: 'var(--t3)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Enter your mobile number to access the invoice platform
              </p>

              {/* Phone input */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '.6rem', marginBottom: '1.5rem' }}>
                <div style={{
                  background: 'var(--inp)', border: '1.5px solid var(--bdr2)',
                  borderRadius: 'var(--r8)', padding: '0 1rem',
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  fontWeight: 800, fontSize: '1rem', color: 'var(--t2)'
                }}>
                  🇮🇳 <span style={{ fontSize: '.9rem' }}>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  style={{
                    flex: 1, background: 'var(--inp)', border: '1.5px solid var(--bdr2)',
                    borderRadius: 'var(--r8)', padding: '1rem', fontSize: '1.05rem',
                    fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--fm)', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Button
                  onClick={handleSendOTP}
                  style={{ padding: '1rem', fontSize: '1rem', borderRadius: 'var(--r12)', width: '100%' }}
                >
                  Get OTP <span className="material-symbols-outlined fi">arrow_right_alt</span>
                </Button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <button
                onClick={() => { setStep('phone'); setOtp(''); }}
                style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '.3rem', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontFamily: 'var(--fm)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span> Back
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '3.5rem', height: '3.5rem', background: 'rgba(212,165,116,.1)',
                  border: '1px solid rgba(212,165,116,.3)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                  <span className="material-symbols-outlined fi" style={{ color: 'var(--g4)', fontSize: '1.8rem' }}>phonelink_ring</span>
                </div>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.35rem' }}>Verify OTP</p>
                <p style={{ fontSize: '.82rem', color: 'var(--t3)' }}>
                  Sent to <strong style={{ color: 'var(--g4)' }}>+91 {phone}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <OtpInput length={4} value={otp} onChange={setOtp} />
              </div>

              <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--t3)', marginBottom: '2rem' }}>
                Demo OTP: <strong style={{ color: 'var(--g4)', fontSize: '.9rem' }}>1234</strong>
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 4}
                  style={{ padding: '1rem', fontSize: '1rem', borderRadius: 'var(--r12)', width: '100%' }}
                >
                  {loading ? 'Verifying...' : <>Verify & Continue <span className="material-symbols-outlined fi">verified</span></>}
                </Button>
                <button
                  onClick={() => { setOtp(''); handleSendOTP(); }}
                  style={{
                    background: 'rgba(255,255,255,.05)', border: '1px solid var(--bdr2)',
                    color: 'var(--t2)', fontSize: '.85rem', cursor: 'pointer',
                    width: '100%', textAlign: 'center', fontWeight: 700,
                    padding: '.9rem', borderRadius: 'var(--r12)', fontFamily: 'var(--fm)'
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer badge */}
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '.7rem', color: 'var(--t3)', opacity: 0.5, margin: 0 }}>
            🔒 Powered by Counter OS · Field Invoice Management
          </p>
        </div>

      </div>
    </div>
  );
};
