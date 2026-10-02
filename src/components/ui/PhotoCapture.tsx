'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, RefreshCw, ShieldCheck, SwitchCamera, Trash2, Upload, User } from 'lucide-react';

interface PhotoCaptureProps {
  /** The stored image as a data URL. */
  value?: string;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  hint?: string;
  /** Longest edge of the stored image, in pixels. */
  maxDimension?: number;
  /** Passport photos are framed in a portrait box; children can be square. */
  shape?: 'passport' | 'square';
  required?: boolean;
  /** Shown under the preview, e.g. "Passport photograph". */
  caption?: string;
  /** Disables the whole field while a form is submitting. */
  disabled?: boolean;
}

/** Draws the source onto a canvas, cropped to a square and scaled down. */
async function toCompressedDataUrl(
  source: HTMLVideoElement | HTMLImageElement,
  maxDimension: number,
  mimeType = 'image/jpeg',
  mirror = false
): Promise<string> {
  const sourceWidth =
    source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const sourceHeight =
    source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('The picture could not be read. Please try again.');
  }

  // Centre-crop to a square so passport photos are never squashed.
  const side = Math.min(sourceWidth, sourceHeight);
  const cropX = (sourceWidth - side) / 2;
  const cropY = (sourceHeight - side) / 2;
  const output = Math.min(side, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = output;
  canvas.height = output;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The picture could not be processed on this device.');

  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, output, output);

  if (mirror) {
    // Match the mirrored preview the applicant sees while framing the shot.
    context.translate(output, 0);
    context.scale(-1, 1);
  }

  context.drawImage(source, cropX, cropY, side, side, 0, 0, output, output);

  return canvas.toDataURL(mimeType, 0.82);
}

export function PhotoCapture({
  value,
  onChange,
  label = 'Passport photograph',
  hint = 'Look straight at the camera with a plain background. A square crop is saved automatically.',
  maxDimension = 480,
  shape = 'passport',
  required = false,
  caption,
  disabled = false,
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function openCamera() {
    setCameraError(null);
    setBusy(true);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'This browser cannot open the camera. Please upload a passport picture from your device instead.'
      );
      setBusy(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode('camera');
      // Give the <video> element a tick to attach before playing.
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      }, 60);
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      setCameraError(
        name === 'NotAllowedError'
          ? 'Camera access was declined. Allow it in the browser, or upload a picture from your device.'
          : 'The camera could not be opened on this device. Please upload a picture instead.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function switchCamera() {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    stopCamera();
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      }, 60);
    } catch {
      setCameraError('The other camera is not available on this device.');
    } finally {
      setBusy(false);
    }
  }

  function captureFromCamera() {
    if (!videoRef.current) return;
    try {
      void toCompressedDataUrl(videoRef.current, maxDimension, 'image/jpeg', true)
        .then((result) => {
          onChange(result);
          stopCamera();
          setMode('idle');
        })
        .catch(() => setCameraError('The picture could not be captured. Please try again.'));
    } catch {
      setCameraError('The picture could not be captured. Please try again.');
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please choose an image file (JPG, PNG or WEBP).');
      return;
    }

    setBusy(true);
    setCameraError(null);
    try {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('bad-image'));
        image.src = objectUrl;
      });
      const dataUrl = await toCompressedDataUrl(image, maxDimension, 'image/jpeg');
      URL.revokeObjectURL(objectUrl);
      onChange(dataUrl);
    } catch {
      setCameraError('That file could not be read. Please choose another picture.');
    } finally {
      setBusy(false);
    }
  }

  const frame = shape === 'passport' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-800">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 rounded-full bg-teresa-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-teresa-green-700">
            <ShieldCheck className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Live camera                                                      */}
      {/* ---------------------------------------------------------------- */}
      {mode === 'camera' ? (
        <div className="overflow-hidden rounded-2xl border-2 border-teresa-green-700 bg-teresa-green-950/95 p-3 shadow-lift animate-pop-in">
          <div className={`relative ${frame} overflow-hidden rounded-xl bg-black`}>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="h-full w-full -scale-x-100 object-cover"
            />
            {/* Passport framing guide */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[70%] w-[62%] rounded-[46%_46%_40%_40%] border-2 border-dashed border-teresa-gold-300/80" />
            </div>
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-teresa-gold-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              Live
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={captureFromCamera}
              className="inline-flex items-center gap-2 rounded-xl bg-teresa-gold-400 px-5 py-2.5 text-sm font-bold text-teresa-green-950 transition hover:bg-teresa-gold-300 magnetic-btn shine"
            >
              <Camera className="h-4 w-4" />
              Capture photo
            </button>
            <button
              type="button"
              onClick={switchCamera}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <SwitchCamera className="h-4 w-4" />
              Flip
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode('idle');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-emerald-100/70">
            Fit the head and shoulders inside the dotted frame, then capture.
          </p>
        </div>
      ) : value ? (
        /* ---------------------------------------------------------------- */
        /* Captured preview                                                 */
        /* ---------------------------------------------------------------- */
        <div className="flex flex-col gap-4 rounded-2xl border border-teresa-green-200 bg-gradient-to-br from-teresa-green-50/70 to-white p-4 sm:flex-row sm:items-center animate-pop-in">
          <div
            className={`relative mx-auto w-32 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-md sm:mx-0 ${frame}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={caption || label} className="h-full w-full object-cover" />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-teresa-green-900">
              {caption || 'Photograph attached'}
            </p>
            <p className="text-xs text-slate-500">
              Saved with this record and shown on the staff list, report cards and the register.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={openCamera}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teresa-green-800 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teresa-green-900 disabled:opacity-60 magnetic-btn"
              >
                <Camera className="h-3.5 w-3.5" />
                {busy ? 'Opening…' : 'Retake'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------------------- */
        /* Empty state: camera or upload                                    */
        /* ---------------------------------------------------------------- */
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-5 transition hover:border-teresa-green-500 hover:bg-teresa-green-50/40">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400`}
            >
              <User className="h-9 w-9" />
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800">No photograph yet</p>
              <p className="text-xs leading-relaxed text-slate-500">{hint}</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={openCamera}
                disabled={disabled || busy}
                className="inline-flex items-center gap-2 rounded-xl bg-teresa-green-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teresa-green-900 disabled:opacity-60 magnetic-btn shine"
              >
                <Camera className="h-4 w-4" />
                {busy ? 'Opening camera…' : 'Take photo'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-teresa-green-600 hover:text-teresa-green-800 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {cameraError && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 animate-fade-in">
          <ImagePlus className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {cameraError}
        </p>
      )}

      {!value && !cameraError && (
        <p className="text-[11px] text-slate-400">
          Pictures are stored with the school record and never leave the school&apos;s own system.
        </p>
      )}
    </div>
  );
}
