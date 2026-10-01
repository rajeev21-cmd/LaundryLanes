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
      // getUserMedia only works in a "secure context" — HTTPS, or
      // http://localhost specifically — on every modern mobile browser
      // (Chrome on Android, Safari on iOS alike). Opening this app via a
      // LAN IP (e.g. http://192.168.1.5:3000, how a phone reaches a dev
      // server on another machine) is plain HTTP on a non-localhost host,
      // so the API is simply unavailable there — not a bug to fix in this
      // component, and no permission prompt will ever appear. Check this
      // first so the message says so plainly instead of looking like a
      // generic permission denial.
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        if (!cancelled) {
          setError(
            "Camera needs HTTPS — this page is loaded over plain HTTP (e.g. a LAN IP), which browsers always block camera access on. Type the id instead, or open this app's HTTPS URL."
          );
        }
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setError('This browser has no camera API available — type the id instead.');
        return;
      }
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
      } catch (err) {
        if (cancelled) return;
        if (err?.name === 'NotAllowedError') {
          setError('Camera permission was denied — allow camera access for this site in your browser settings, or type the id instead.');
        } else if (err?.name === 'NotFoundError') {
          setError('No camera found on this device — type the id instead.');
        } else {
          setError('Camera access denied or unavailable — type the id instead.');
        }
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
