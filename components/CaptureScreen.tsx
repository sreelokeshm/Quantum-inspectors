
import React, { useRef, useState, useCallback } from 'react';

interface CaptureScreenProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
        {isCameraActive ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-blue-400/30 pointer-events-none m-8 rounded-lg flex items-center justify-center">
                <div className="text-blue-400/50 text-xs font-mono">ALIGN METAL PIECE HERE</div>
            </div>
            <button 
              onClick={captureImage}
              disabled={isProcessing}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-lg"
            >
               <div className="w-12 h-12 bg-white rounded-full"></div>
            </button>
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </>
        ) : (
          <div className="text-center p-8 flex flex-col items-center">
            <i className="fas fa-microchip text-6xl text-slate-600 mb-6"></i>
            <h3 className="text-xl font-semibold mb-2">Visual Inspection Ready</h3>
            <p className="text-slate-400 text-sm mb-8">Align the forged metal piece clearly in the frame.</p>
            <div className="flex gap-4">
                <button 
                  onClick={startCamera}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <i className="fas fa-camera"></i> Use Camera
                </button>
                <label className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2">
                  <i className="fas fa-upload"></i> Upload
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CaptureScreen;
