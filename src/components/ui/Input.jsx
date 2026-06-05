import React from 'react';

export const Input = React.memo(({ label, className = '', wrapperClass = '', suffix, prefix, ...props }) => {
  return (
    <div className={wrapperClass}>
      {label && <label className="ilabel">{label}</label>}
      <div style={{ position: 'relative', display: 'flex', gap: prefix ? '.5rem' : '0' }}>
        {prefix}
        <input className={`ifield ${className}`} {...props} />
        {suffix && (
          <div style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export const OtpInput = React.memo(({ length = 4, onChange, value = '' }) => {
  const handleChange = (e, index) => {
    const val = e.target.value;
    const newVal = value.split('');
    newVal[index] = val;
    onChange(newVal.join(''));
    
    if (val && index < length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
      {Array(length).fill(0).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          className={`otp-box ${value[i] ? 'filled' : ''}`}
          type="text"
          maxLength={1}
          inputMode="numeric"
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
        />
      ))}
    </div>
  );
});

OtpInput.displayName = 'OtpInput';
