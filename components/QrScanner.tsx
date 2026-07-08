"use client";

import { useEffect, useRef, useState } from "react";

// Minimal ambient shape for the native BarcodeDetector API (not yet in TS libs).
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

const DEFAULT_FORMATS = ["qr_code", "ean_13", "ean_8", "code_128", "upc_a", "upc_e"];

/**
 * Camera QR / barcode scanner built on the browser-native BarcodeDetector +
 * getUserMedia. No third-party dependency. Supported on Chrome/Android (the
 * field phones); on unsupported browsers it shows a clear fallback message so
 * staff can use the USB scanner or type the code instead.
 *
 * Calls onScan(code) once with the first decoded value, then stops the camera.
 */
export default function QrScanner({
  onScan,
  onClose,
  formats = DEFAULT_FORMATS,
}: {
  onScan: (code: string) => void;
  onClose: () => void;
  formats?: string[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  // Keep the latest onScan without making it an effect dependency, so the
  // camera starts exactly once on mount and isn't torn down on every render.
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const formatsRef = useRef(formats);

  useEffect(() => {
    const Ctor = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Ctor) {
      setError(
        "This browser can't scan with the camera. Use the USB barcode scanner, or type the code. (Camera scanning works in Chrome on Android.)",
      );
      return;
    }

    let stream: MediaStream | null = null;
    let raf = 0;
    const detector = new Ctor({ formats: formatsRef.current });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        tick();
      } catch {
        setError("Couldn't open the camera. Check camera permissions for this site.");
      }
    }

    async function tick() {
      const video = videoRef.current;
      if (!video || scannedRef.current) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0 && codes[0].rawValue) {
          scannedRef.current = true;
          onScanRef.current(codes[0].rawValue);
          return;
        }
      } catch {
        // transient decode errors are normal between frames — keep going
      }
      raf = requestAnimationFrame(tick);
    }

    start();
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // Start the camera once on mount; latest onScan is read via a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-ink/90 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-paper p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-serif text-xl text-meadow">Scan a code</p>
          <button onClick={onClose} className="text-sm text-stone hover:text-cider" aria-label="Close scanner">
            Close
          </button>
        </div>

        {error ? (
          <p className="text-ink-soft text-sm leading-relaxed">{error}</p>
        ) : (
          <>
            <div className="relative aspect-square bg-ink overflow-hidden">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-8 border-2 border-wheat/80 rounded-lg pointer-events-none" />
            </div>
            <p className="text-xs text-stone mt-3 text-center">Point the camera at a QR or barcode.</p>
          </>
        )}
      </div>
    </div>
  );
}
