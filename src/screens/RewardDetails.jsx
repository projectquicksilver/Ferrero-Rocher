import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Header } from '../components/layout/Header';
import { showToast } from '../components/ui/Toast';

export const RewardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rewardsCatalog, pointCredits, redeemReward, kycDoc, submitKYC, user } = useAppContext();
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the selected reward in the catalog
  const reward = rewardsCatalog.find(r => r.id.toString() === id.toString());

  // Form states for KYC
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [retailerName, setRetailerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [idProofName, setIdProofName] = useState('');
  const [taxDeclApproved, setTaxDeclApproved] = useState(false);

  // Initialize form states when kycDoc or user changes
  useEffect(() => {
    if (kycDoc) {
      setPanNumber(kycDoc.pan_number || '');
      setGstNumber(kycDoc.gst_number || '');
      setRetailerName(kycDoc.retailer_name || user?.name || '');
      setMobileNumber(kycDoc.mobile_number || user?.phone || '');
      setAddress(kycDoc.address || user?.loc || '');
      setIdProofName(kycDoc.id_proof_url ? 'kyc_proof_uploaded.pdf' : '');
    } else if (user?.pan_number) {
      setPanNumber(user.pan_number || '');
      setGstNumber(user.gst_number || '');
      setRetailerName(user?.name || '');
      setMobileNumber(user?.phone || '');
      setAddress(user?.loc || '');
      setIdProofName('profile_onboarded_kyc.pdf');
      setTaxDeclApproved(true);
    } else {
      setRetailerName(user?.name || '');
      setMobileNumber(user?.phone || '');
      setAddress(user?.loc || '');
    }
  }, [kycDoc, user]);

  if (!reward) {
    return (
      <div className="screen active" style={{ background: 'var(--bg0)' }}>
        <Header title="Reward Details" backTo="/rewards" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', padding: '2rem' }}>
          <p style={{ color: 'var(--t3)', marginBottom: '1.5rem' }}>Reward not found in store.</p>
          <button onClick={() => navigate('/rewards')} className="btn btn-ghost" style={{ width: 'auto' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const is194r = reward.is_194r_applicable === true || 
                 String(reward.is_194r_applicable).toLowerCase() === 'yes' ||
                 (Number(reward.reward_value) >= 20000);

  const tdsPercent = is194r ? Number(reward.tds_percentage || 10) : 0;
  const tdsAmt = is194r ? Number(reward.tds_amount || (reward.reward_value * tdsPercent / 100)) : 0;
  const netBenefitVal = is194r ? (reward.reward_value - tdsAmt) : reward.reward_value;

  const userHasEnoughPoints = pointCredits >= reward.points_required;
  const remainingPoints = Math.max(0, pointCredits - reward.points_required);

  const handleOpenCalculator = () => {
    if (!userHasEnoughPoints) {
      showToast('❌ Insufficient points balance for this reward', 'error');
      return;
    }
    setShowCalculator(true);
  };

  const handleConfirmRedeem = async () => {
    if (isSubmitting) return;

    // Validation for 194R KYC
    let kycPayload = null;
    if (is194r) {
      const hasPreExistingKyc = (kycDoc && kycDoc.pan_number) || user?.pan_number;
      if (!hasPreExistingKyc) {
        if (!panNumber || panNumber.trim().length !== 10) {
          showToast('⚠️ Please enter a valid 10-character PAN number', 'error');
          return;
        }
        if (!retailerName || retailerName.trim() === '') {
          showToast('⚠️ Please enter your Retailer Name', 'error');
          return;
        }
        if (!mobileNumber || mobileNumber.trim() === '') {
          showToast('⚠️ Please enter your Mobile Number', 'error');
          return;
        }
        if (!address || address.trim() === '') {
          showToast('⚠️ Please enter your Shop Address', 'error');
          return;
        }
        if (!idProofName) {
          showToast('⚠️ Please upload a simulated Identity Proof', 'error');
          return;
        }
        if (!taxDeclApproved) {
          showToast('⚠️ Please check the tax declaration box', 'error');
          return;
        }

        kycPayload = {
          pan_number: panNumber.toUpperCase(),
          gst_number: gstNumber ? gstNumber.toUpperCase() : null,
          retailer_name: retailerName,
          mobile_number: mobileNumber,
          address: address,
          id_proof_url: idProofName
        };
      } else if (!kycDoc && user?.pan_number) {
        kycPayload = {
          pan_number: user.pan_number.toUpperCase(),
          gst_number: user.gst_number ? user.gst_number.toUpperCase() : null,
          retailer_name: user.name,
          mobile_number: user.phone,
          address: user.loc || 'Khetgaon, MP',
          id_proof_url: 'profile_onboarded_kyc.pdf'
        };
      }
    }

    setIsSubmitting(true);
    
    try {
      const result = await redeemReward(reward, kycPayload);
      if (result) {
        // Redirect to success screen with parameters
        navigate('/rewards/success', { 
          state: { 
            rewardName: reward.title,
            pointsUsed: reward.points_required,
            remainingPoints: result.remainingPoints,
            voucherCode: result.voucherCode,
            redemptionId: result.id,
            rewardType: reward.reward_type,
            cashbackAmount: result.cashbackAmount,
            is194r: is194r,
            complianceStatus: result.complianceStatus
          } 
        });
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Redemption failed. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setShowCalculator(false);
    }
  };

  const handleSimulateUpload = () => {
    setIdProofName('pan_card_doc.pdf');
    showToast('📎 Simulated file upload success!');
  };

  return (
    <div className="screen active" style={{ background: 'var(--bg0)' }}>
      <Header title="Reward Details" backTo="/rewards" />

      <div className="scroller" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>
        
        {/* REWARD HERO PANEL */}
        <div className="au d1" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r16)', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ 
            width: '4.5rem', height: '4.5rem', 
            background: 'rgba(212,165,116,0.12)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', margin: '0 auto 1.25rem' 
          }}>
            {reward.category === 'cashback' ? '💳' : reward.category === 'gift_card' ? '🎁' : reward.category === 'travel' ? '✈️' : reward.category === 'electronics' ? '📱' : '🎟️'}
          </div>
          <span style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--g4)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.4rem' }}>
            {reward.partner_name || reward.category}
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0 0 .5rem 0', lineHeight: 1.3 }}>
            {reward.title}
          </h2>
          <p style={{ fontSize: '.85rem', color: 'var(--t3)', lineHeight: 1.5, margin: 0 }}>
            {reward.description}
          </p>

          {is194r && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(212,165,116,0.12)', border: '1px solid #d4a574', padding: '.3rem .6rem', borderRadius: '8px', marginTop: '1rem', fontSize: '.75rem', color: 'var(--g4)', fontWeight: 800 }}>
              <span>📋 Section 194R Regulated</span>
            </div>
          )}
        </div>

        {/* DETAILS SPEC LIST */}
        <div className="au d2" style={{ display: 'flex', flexDirection: 'column', gap: '.65rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Reward Type</span>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--t1)', textTransform: 'capitalize' }}>{reward.reward_type}</span>
          </div>
          {is194r && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Est. Market Value</span>
              <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--t1)' }}>₹{Number(reward.reward_value).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Validity</span>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--t1)' }}>{reward.validity_days} days after claim</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 'var(--r12)' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Points Cost</span>
            <span style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--g4)' }}>{reward.points_required.toLocaleString('en-IN')} pts</span>
          </div>
        </div>

        {/* TERMS & USAGE SECTION */}
        <div className="au d3" style={{ background: 'rgba(212,165,116,0.03)', border: '1px solid var(--bdr)', borderRadius: 'var(--r16)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--g4)', marginBottom: '.6rem' }}>📜 Terms & Conditions</h3>
          <p style={{ fontSize: '.78rem', color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>
            {is194r 
              ? 'This reward is governed under Section 194R of the Indian Income Tax Act. Release is subject to PAN KYC approval. Points are deducted upon redemption but code/delivery is held until tax compliance verification is completed.'
              : reward.terms_conditions || 'This reward is non-transferable and can only be used inside the CounterOS retailer system. Once redeemed, points cannot be refunded or rolled back.'}
          </p>
          
          <h3 style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--g4)', marginTop: '1.25rem', marginBottom: '.6rem' }}>💡 How to Use</h3>
          <p style={{ fontSize: '.78rem', color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>
            {is194r
              ? '1. Confirm redemption and pay points. 2. Submit PAN & shop details. 3. Admin verifies details (takes up to 24 hrs). 4. Reward code releases in your My Rewards Vault.'
              : reward.reward_type === 'cashback' 
              ? 'Click Redeem. The cashback value will be instantly credited to your wallet balance. You can check the transaction in the wallet history.' 
              : reward.reward_type === 'partner' 
              ? 'Click Redeem. Copy the Amazon/Flipkart voucher code and paste it on the partner merchant site during purchase, or click "Use Now" to redeem directly.' 
              : 'Click Redeem. Use the generated coupon code during distributor restock checkout for discounts.'}
          </p>
        </div>

      </div>

      {/* FIXED FOOT PANEL WITH CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', background: 'var(--bg1)', borderTop: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div>
          <p style={{ fontSize: '.65rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700 }}>Your Points</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--t1)' }}>{pointCredits.toLocaleString('en-IN')} pts</p>
        </div>

        {userHasEnoughPoints ? (
          <button
            onClick={handleOpenCalculator}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '1rem 2.2rem', background: 'linear-gradient(135deg, #d4a574, #c41e3a)' }}
          >
            Redeem Now
          </button>
        ) : (
          <button
            disabled
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '1rem 2.2rem', opacity: 0.5, cursor: 'not-allowed' }}
          >
            Need {(reward.points_required - pointCredits).toLocaleString('en-IN')} more pts
          </button>
        )}
      </div>

      {/* CALCULATOR / CONFIRMATION MODAL BOTTOM SHEET */}
      {showCalculator && (
        <div className="buddy-panel" onClick={() => !isSubmitting && setShowCalculator(false)}>
          <div className="buddy-content" onClick={e => e.stopPropagation()} style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem 1.25rem', background: '#1d120d', borderTop: '2.5px solid var(--g4)', borderRadius: '20px 20px 0 0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--g4)' }}>
                {is194r ? '📋 Section 194R Compliance Flow' : '🧾 Real-Time Calculator'}
              </h3>
              <button disabled={isSubmitting} onClick={() => setShowCalculator(false)} style={{ background: 'transparent', border: 'none', color: 'var(--t3)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Calculations layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem', marginBottom: '1.5rem', background: 'var(--bg3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--bdr)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
                <span style={{ color: 'var(--t3)' }}>Current Points</span>
                <span style={{ fontWeight: 700 }}>{pointCredits.toLocaleString('en-IN')} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', color: '#ef4444' }}>
                <span>Reward Cost</span>
                <span style={{ fontWeight: 800 }}>- {reward.points_required.toLocaleString('en-IN')} pts</span>
              </div>
              <div style={{ height: '1px', background: 'var(--bdr2)', margin: '.2rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900 }}>
                <span style={{ color: 'var(--g4)' }}>Remaining Balance</span>
                <span style={{ color: 'var(--g4)', fontFamily: 'var(--fd)' }}>{remainingPoints.toLocaleString('en-IN')} pts</span>
              </div>
            </div>

            {/* Section 194R Tax compliance card */}
            {is194r && (
              <div style={{ background: 'rgba(212,165,116,0.05)', border: '1px solid rgba(212,165,116,0.3)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--g4)', fontWeight: 800, fontSize: '.9rem', marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>⚖️ TDS Deductible (Section 194R)</span>
                </h4>
                <p style={{ fontSize: '.75rem', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Tax is deducted at source (TDS @ 10%) on benefits or perquisites provided to retailers/channel partners exceeding ₹20,000.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.8rem', background: 'rgba(0,0,0,0.2)', padding: '.8rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--t3)' }}>Est. Reward Value</span>
                    <strong style={{ color: '#fff' }}>₹{Number(reward.reward_value).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                    <span>TDS (10% Applicable)</span>
                    <strong>₹{tdsAmt.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ height: '1px', background: 'var(--bdr2)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78f275', fontWeight: 800 }}>
                    <span>Net Benefit Value</span>
                    <span>₹{netBenefitVal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Form Collection if 194R & No approved KYC in context */}
            {is194r && (
              <div style={{ marginBottom: '1.5rem' }}>
                {(kycDoc && kycDoc.pan_number) || user?.pan_number ? (
                  <div style={{ background: 'rgba(120,242,117,.06)', border: '1px solid #78f275', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#78f275', fontSize: '2rem' }}>verified_user</span>
                    <div>
                      <h4 style={{ fontSize: '.85rem', fontWeight: 800, color: '#fff', margin: 0 }}>KYC Profile Linked</h4>
                      <p style={{ fontSize: '.75rem', color: 'var(--t3)', margin: '.1rem 0 0 0' }}>
                        PAN: <strong style={{ color: 'var(--g4)' }}>{kycDoc?.pan_number || user.pan_number}</strong> ({kycDoc?.retailer_name || user.name})
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--bdr)', borderRadius: '16px', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '.9rem', marginBottom: '1rem' }}>📝 KYC Verification Form</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      <div>
                        <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>PAN Number *</label>
                        <input 
                          type="text" 
                          maxLength="10"
                          placeholder="ABCDE1234F"
                          value={panNumber}
                          onChange={e => setPanNumber(e.target.value.toUpperCase())}
                          style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '8px', padding: '.65rem .8rem', color: '#fff', fontSize: '.85rem', outline: 'none', textTransform: 'uppercase' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>GST Number (Optional)</label>
                        <input 
                          type="text" 
                          maxLength="15"
                          placeholder="22ABCDE1234F1Z5"
                          value={gstNumber}
                          onChange={e => setGstNumber(e.target.value.toUpperCase())}
                          style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '8px', padding: '.65rem .8rem', color: '#fff', fontSize: '.85rem', outline: 'none', textTransform: 'uppercase' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>Retailer Name *</label>
                        <input 
                          type="text" 
                          placeholder="Ramesh Kumar"
                          value={retailerName}
                          onChange={e => setRetailerName(e.target.value)}
                          style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '8px', padding: '.65rem .8rem', color: '#fff', fontSize: '.85rem', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '.85rem' }}>
                        <div>
                          <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>Mobile Number *</label>
                          <input 
                            type="tel" 
                            placeholder="9900000001"
                            value={mobileNumber}
                            onChange={e => setMobileNumber(e.target.value)}
                            style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '8px', padding: '.65rem .8rem', color: '#fff', fontSize: '.85rem', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>Shop Address *</label>
                        <textarea 
                          placeholder="Shop No. 12, Main Market, Khetgaon, MP"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          rows="2"
                          style={{ width: '100%', background: 'var(--inp)', border: '1.5px solid var(--bdr2)', borderRadius: '8px', padding: '.65rem .8rem', color: '#fff', fontSize: '.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                      {/* Identity Proof Upload Simulation */}
                      <div>
                        <label style={{ fontSize: '.7rem', color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '.3rem' }}>Identity Proof (PAN Card / Aadhaar) *</label>
                        <div 
                          onClick={handleSimulateUpload}
                          style={{ border: '1.5px dashed var(--bdr)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}
                        >
                          <span className="material-symbols-outlined" style={{ color: 'var(--g4)', fontSize: '1.8rem' }}>
                            {idProofName ? 'file_present' : 'cloud_upload'}
                          </span>
                          <span style={{ fontSize: '.75rem', fontWeight: 700, color: idProofName ? '#78f275' : 'var(--t2)' }}>
                            {idProofName ? idProofName : 'Click to Upload Identity Proof'}
                          </span>
                          <span style={{ fontSize: '.62rem', color: 'var(--t3)' }}>PDF, JPG, PNG (Max 5MB)</span>
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <label style={{ display: 'flex', gap: '.5rem', alignItems: 'start', cursor: 'pointer', userSelect: 'none', marginTop: '.4rem' }}>
                        <input 
                          type="checkbox" 
                          checked={taxDeclApproved} 
                          onChange={e => setTaxDeclApproved(e.target.checked)}
                          style={{ marginTop: '.15rem', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '.72rem', color: 'var(--t2)', lineHeight: 1.4 }}>
                          I hereby declare that the details provided are correct and I authorize the deduction of points and TDS filing as per Income Tax Section 194R.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Actions */}
            <div style={{ display: 'flex', gap: '.8rem', marginTop: '1rem' }}>
              <button
                onClick={() => setShowCalculator(false)}
                disabled={isSubmitting}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ flex: 2, background: 'linear-gradient(135deg, #d4a574, #c41e3a)' }}
              >
                {isSubmitting 
                  ? 'Confirming...' 
                  : is194r && !(kycDoc && kycDoc.pan_number)
                  ? 'Submit KYC & Redeem'
                  : 'Confirm Redemption'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
