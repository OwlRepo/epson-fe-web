import { Image, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface CapturePhotoProps {
  onCapture?: (photo: string) => void;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const startCamera = async () => {
    try {
      setIsActivating(true);
      const devices = await navigator.mediaDevices.enumerateDevices();
      const camera = devices.find(
        (d) => d.kind === "videoinput" && d.label !== "Fake"
      );
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: camera?.deviceId },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
    } finally {
      setIsActivating(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/jpeg");
      setPhoto(photoData);
      if (onCapture) {
        const base64 = photoData.split(",")[1];
        onCapture(base64);
      }
    }
  };

  const handleClick = () => {
    if (isCameraActive) {
      photo ? setPhoto(null) : takePhoto();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md self-start">
      <p className="font-bold flex gap-2 text-[#1a2b4b]">Capture Photo</p>
      <p className="text-sm text-slate-500">Snap a visitor's photo</p>

      <div
        className={`flex justify-center items-center rounded-sm my-2 relative ${
          isCameraActive ? "" : "border-dashed border-2 border-[#0F416D]"
        } aspect-square`}
      >
        {!isCameraActive && <Image className="text-[#0F416D] absolute" />}
        {photo && (
          <img
            src={photo}
            alt="Captured"
            className="w-full h-full absolute object-cover rounded-2xl"
          />
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover max-w-[500px] rounded-2xl"
        />
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Button
        className={`w-full h-[54px] ${
          !isActivating && isCameraActive && !photo
            ? "bg-green-500 hover:bg-green-400"
            : ""
        }`}
        onClick={handleClick}
      >
        {isActivating && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
        {isActivating
          ? "Activating..."
          : photo
            ? "Capture Again"
            : isCameraActive
              ? "Capture"
              : "Activate Webcam"}
      </Button>
    </div>
  );
};

export default CapturePhoto;
