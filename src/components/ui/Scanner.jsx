import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const Scanner = ({ onScan, onClose, style = {} }) => {
  const [active, setActive] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      onScan(decodedText);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
      .then(() => setActive(true))
      .catch((err) => console.error("Error starting scanner:", err));

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(err => console.error(err));
      }
    };
  }, [onScan]);

  return (
    <div style={{ ...styles.container, ...style }}>
      <div id="reader" style={styles.reader}></div>
      
      {/* Scanning Overlay */}
      <div style={styles.overlay}>
        <div style={styles.frame}>
          <div style={{ ...styles.corner, top: 0, left: 0, borderLeft: '4px solid var(--g4)', borderTop: '4px solid var(--g4)' }}></div>
          <div style={{ ...styles.corner, top: 0, right: 0, borderRight: '4px solid var(--g4)', borderTop: '4px solid var(--g4)' }}></div>
          <div style={{ ...styles.corner, bottom: 0, left: 0, borderLeft: '4px solid var(--g4)', borderBottom: '4px solid var(--g4)' }}></div>
          <div style={{ ...styles.corner, bottom: 0, right: 0, borderRight: '4px solid var(--g4)', borderBottom: '4px solid var(--g4)' }}></div>
          
          <div className="scan-line" style={styles.scanLine}></div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .scan-line {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '300px',
    background: '#000',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    border: '1px solid var(--bdr)'
  },
  reader: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  frame: {
    width: '250px',
    height: '250px',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: '30px',
    height: '30px',
  },
  scanLine: {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: '2px',
    background: 'var(--g4)',
    boxShadow: '0 0 15px var(--g4)',
    zIndex: 10
  }
};
