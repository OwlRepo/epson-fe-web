import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/check-in-visitor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
      <div className="bg-white p-4 rounded-lg shadow-md self-start">
        <p className="font-bold flex gap-2 text-[#1a2b4b]">Capture Photo</p>
        <p className="text-sm text-slate-500">Snap a visitor's photo</p>
        <div className="flex justify-center items-center rounded-sm border-dashed h-44 border-[#0F416D] border-2 my-2">
          <Image className="text-[#0F416D]" />
        </div>
        <Button className="w-full">Activate Webcam</Button>
      </div>

      <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
        <p className="font-bold flex gap-2 text-[#1a2b4b]">Basic Information</p>
        <p className="text-sm text-slate-500">
          Registration and Check-in Details
        </p>

        {/* form */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="grid gap-2">
            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                type="text"
                id="fullName"
                placeholder="Enter your Employee ID"
                className="h-[44px]"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="contactInformation"
                className="text-sm font-medium text-gray-700"
              >
                Contact Information
              </label>
              <Input
                type="text"
                id="contactInformation"
                placeholder="Enter your Employee ID"
                className="h-[44px]"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="company"
                className="text-sm font-medium text-gray-700"
              >
                Company/Organization
              </label>
              <Input
                type="text"
                id="company"
                placeholder="Enter your Employee ID"
                className="h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-rows-3 gap-2">
            <div className="space-y-1">
              <label
                htmlFor="contactInformation"
                className="text-sm font-medium text-gray-700"
              >
                Host Person
              </label>
              <Input
                type="text"
                id="contactInformation"
                placeholder="Enter your Employee ID"
                className="h-[44px]"
              />
            </div>

            <div className="space-y-1 row-span-2">
              <label
                htmlFor="purpose"
                className="text-sm font-medium text-gray-700"
              >
                Purpose
              </label>
              <Textarea id="purpose" placeholder="value" className="flex-1" />
            </div>
          </div>

          {/* divider */}
        </div>
        <div className="border-t w-full my-2  border-[#1a2b4b]"></div>

        {/* rfid section */}
        <div>
          <p className="font-bold flex gap-2 text-[#1a2b4b]">
            Assign RFID Card
          </p>
          <p className="text-sm text-slate-500">
            Link an RFID card as a visitor pass.
          </p>
        </div>
      </div>
    </div>
  );
}
