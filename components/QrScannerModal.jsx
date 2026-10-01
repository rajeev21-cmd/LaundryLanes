'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// Real camera-based QR scanning (not simulated, unlike bag/garment "scan"
// buttons elsewhere in this app) — getUserMedia for the camera feed, jsQR
// decoding sampled video frames via an offscreen canvas. Every call site
// also accepts manual ID entry, so this is always an alternative, never the
// only path — camera access can fail or be denied, and this component just
// surfaces that rather than blocking the flow.
export default function QrScannerModal({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError('');

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          onScan(code.data);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        if (!cancelled) setError('Camera access denied or unavailable — type the id instead.');
      }
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>📷 Scan QR Code</h3>
        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <div className="qr-scanner-frame">
            <video ref={videoRef} muted playsInline />
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
