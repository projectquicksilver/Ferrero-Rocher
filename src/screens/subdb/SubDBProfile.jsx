import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSubDB } from './SubDBContext';
import { Button } from '../../components/ui/Button';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
  'Chandigarh','Andaman & Nicobar Islands'
];

export const SubDBProfile = () => {
  const navigate = useNavigate();
  const { subUser, saveProfile, showToast } = useSubDB();

  const [form, setForm] = useState({
    emp_id: subUser?.emp_id || '',
    name: subUser?.name || '',
    state: subUser?.state || '',
    district: subUser?.district || ''
  });
  const [locLoading, setLocLoading] = useState(false);
  const [locGranted, setLocGranted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getLocation = () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          setForm(p => ({
            ...p,
            state: addr.state || p.state,
            district: addr.county || addr.city_district || addr.city || p.district,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
          setLocGranted(true);
          showToast('📍 Location detected!', 'success');
        } catch {
          setLocGranted(true);
          showToast('📍 Location saved (fill state/district manually)', 'info');
        } finally {
          setLocLoading(false);
        }
      },
      () => { setLocLoading(false); showToast('Location access denied', 'error'); },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!form.emp_id.trim()) { showToast('EMP-ID is required', 'error'); return; }
    if (!form.name.trim()) { showToast('Full name is required', 'error'); return; }
    if (!form.state) { showToast('Please select your State', 'error'); return; }
    if (!form.district.trim()) { showToast('District / City is required', 'error'); return; }

    setSaving(true);
    try {
      await saveProfile(form);
      showToast('✅ Profile saved!', 'success');
      setRedirectTo('/subdb_platform/dashboard');
    } catch (err) {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--inp)', border: '1.5px solid var(--bdr2)',
    borderRadius: 'var(--r8)', padding: '1rem',
    fontSize: '.95rem', fontWeight: 600,
    color: 'var(--t1)', fontFamily: 'var(--fm)', outline: 'none'
  };

  const labelStyle = {
    fontSize: '.78rem', fontWeight: 700, color: 'var(--t3)',
    display: 'block', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.04em'
  };

  return (
    <div className="screen active" id="s-subdb-profile">
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 45% at 50% -5%, rgba(212,165,116,.12), transparent)',
        pointerEvents: 'none'
      }} />

      <div className="scroller" style={{ position: 'relative' }}>

        {/* Header */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem',
            background: 'linear-gradient(135deg, #d4a574, #c41e3a)',
            borderRadius: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', color: '#fff' }}>badge</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--t1)', margin: 0 }}>EMP Profile Setup</h2>
            <p style={{ fontSize: '.7rem', color: 'var(--t3)', margin: 0 }}>Complete your profile to continue</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
          {['OTP ✓', 'Profile', 'Dashboard'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{
                padding: '.2rem .7rem', borderRadius: '9999px', fontSize: '.68rem', fontWeight: 800,
                background: i === 0 ? 'rgba(212,165,116,.15)' : i === 1 ? 'linear-gradient(135deg, #d4a574, #c41e3a)' : 'var(--bg3)',
                color: i === 0 ? '#d4a574' : i === 1 ? '#fff' : 'var(--t3)',
                border: i === 0 ? '1px solid rgba(212,165,116,.3)' : 'none'
              }}>{s}</div>
              {i < 2 && <div style={{ flex: 1, height: '1px', background: 'var(--bdr)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '0 1.25rem 2rem' }}>

          {/* EMP ID */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>EMP-ID <span style={{ color: '#c41e3a' }}>*</span></label>
            <input
              style={inputStyle}
              placeholder="e.g. EMP-1042"
              value={form.emp_id}
              onChange={e => set('emp_id', e.target.value.toUpperCase())}
            />
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Full Name <span style={{ color: '#c41e3a' }}>*</span></label>
            <input
              style={inputStyle}
              placeholder="Your full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Location row */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
              <label style={{ ...labelStyle, margin: 0 }}>Location <span style={{ color: '#c41e3a' }}>*</span></label>
              <button
                onClick={getLocation}
                disabled={locLoading}
                style={{
                  background: locGranted ? 'rgba(16,185,129,0.1)' : 'rgba(212,165,116,0.1)',
                  border: `1px solid ${locGranted ? 'rgba(16,185,129,0.3)' : 'rgba(212,165,116,0.3)'}`,
                  color: locGranted ? '#10b981' : '#d4a574',
                  borderRadius: '9999px', padding: '.3rem .75rem',
                  fontSize: '.72rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--fm)', display: 'flex', alignItems: 'center', gap: '.3rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>
                  {locGranted ? 'check_circle' : 'my_location'}
                </span>
                {locLoading ? 'Detecting...' : locGranted ? 'Location Set' : 'Use GPS'}
              </button>
            </div>

            {/* State dropdown */}
            <select
              value={form.state}
              onChange={e => set('state', e.target.value)}
              style={{ ...inputStyle, marginBottom: '.75rem', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* District */}
            <input
              style={inputStyle}
              placeholder="District / City"
              value={form.district}
              onChange={e => set('district', e.target.value)}
            />
          </div>

          {/* Phone (read-only) */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Mobile Number</label>
            <input
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
              value={`+91 ${subUser?.phone || ''}`}
              readOnly
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            style={{ padding: '1rem', fontSize: '1rem', borderRadius: 'var(--r12)', width: '100%' }}
          >
            {saving ? 'Saving...' : <>Save & Go to Dashboard <span className="material-symbols-outlined fi">arrow_right_alt</span></>}
          </Button>
        </div>

      </div>
    </div>
  );
};
