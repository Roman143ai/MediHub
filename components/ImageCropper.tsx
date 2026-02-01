
import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
  image: string;
  aspectRatio?: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation: number = 0): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bWidth, height: bHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bWidth;
  canvas.height = bHeight;

  ctx.translate(bWidth / 2, bHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.9);
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ image, aspectRatio = 1, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteCallback = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedAreaPixels(pixelCrop);
  }, []);

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      setIsProcessing(true);
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
        onCropComplete(croppedImage);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const rotate = (deg: number) => {
    let newRotation = (rotation + deg) % 360;
    if (newRotation < 0) newRotation += 360;
    setRotation(newRotation);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex justify-between items-center p-6 text-white">
        <div>
          <h2 className="text-xl font-black tracking-tight">ছবি এডিট করুন</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adjust and Save</p>
        </div>
        <button onClick={onCancel} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Main Cropper Box */}
      <div className="relative w-full max-w-4xl flex-grow bg-slate-900 overflow-hidden md:rounded-[2rem] border border-white/10 shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid #3b82f6' }
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-black text-xs uppercase tracking-widest">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-4xl p-6 md:p-10 space-y-6 md:space-y-8">
        {/* Adjustment Sliders & Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex justify-between text-white/50 text-[10px] font-black uppercase tracking-widest">
              <span>Zoom</span>
              <span className="text-blue-400">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={() => rotate(-90)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span className="text-[8px] font-black uppercase">-90°</span>
            </button>
            <button onClick={() => rotate(90)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              <span className="text-[8px] font-black uppercase">+90°</span>
            </button>
            <button onClick={() => { setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); }} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span className="text-[8px] font-black uppercase">Reset</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            বাতিল
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="flex-[2] py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            সেভ করুন (Save Image)
          </button>
        </div>
      </div>
    </div>
  );
};
