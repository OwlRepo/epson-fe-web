import { Image, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { toast } from "sonner";

interface CapturePhotoProps {
  onCapture?: (photo: string) => void;
  value?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ onCapture, value }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const { errorStyle, successStyle } = useToastStyleTheme();

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
      toast.error("Oops! Couldn’t find any camera", {
        description: "Please make sure your device is connected and try again.",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    } finally {
      setIsActivating(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const scale = 0.5;
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth * scale;
      canvas.height = videoRef.current.videoHeight * scale;
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/jpeg");

      if (onCapture) {
        const base64 = photoData.split(",")[1];
        onCapture(base64);
        setIsCameraActive(false);
        toast.success("Captured Successfully", {
          description: "Visitor photo has been captured successfully.",
          style: successStyle,
        });
      }
    }
  };

  const handleClick = () => {
    if (isCameraActive) {
      takePhoto();
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
          isCameraActive || value
            ? ""
            : "border-dashed border-2 border-[#0F416D]"
        } aspect-square`}
      >
        {!isCameraActive && <Image className="text-[#0F416D] absolute" />}

        {value && !isCameraActive && (
          <img
            src={`data:image/jpeg;base64,${value}`}
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
          !isActivating && isCameraActive
            ? "bg-green-500 hover:bg-green-400"
            : ""
        }`}
        onClick={handleClick}
      >
        {isActivating && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
        {isActivating
          ? "Activating..."
          : value && !isCameraActive
            ? "Capture Again"
            : isCameraActive
              ? "Capture"
              : "Activate Webcam"}
      </Button>
    </div>
  );
};

export default CapturePhoto;
