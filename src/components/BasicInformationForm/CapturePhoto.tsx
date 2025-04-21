import { Image } from "lucide-react";
import { Button } from "../ui/button";

const CapturePhoto = () => (
  <div className="bg-white p-4 rounded-lg shadow-md self-start">
    <p className="font-bold flex gap-2 text-[#1a2b4b]">Capture Photo</p>
    <p className="text-sm text-slate-500">Snap a visitor's photo</p>
    <div className="flex justify-center items-center rounded-sm border-dashed h-44 border-[#0F416D] border-2 my-2">
      <Image className="text-[#0F416D]" />
    </div>
    <Button className="w-full">Activate Webcam</Button>
  </div>
);

export default CapturePhoto;
