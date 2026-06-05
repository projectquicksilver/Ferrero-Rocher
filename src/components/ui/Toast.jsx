import React, { useEffect, useState } from 'react';

// A simple global toast event system
export const showToast = (message) => {
  const event = new CustomEvent('show-toast', { detail: { message } });
  window.dispatchEvent(event);
};

export const Toast = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    const handleToast = (e) => {
      setToastMsg(e.detail.message);
      setShow(false);
      // Wait for reflow
      setTimeout(() => {
        setShow(true);
      }, 10);
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        setShow(false);
      }, 2600);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div id="toast" className={show ? 'show' : ''}>
      {toastMsg}
    </div>
  );
};
