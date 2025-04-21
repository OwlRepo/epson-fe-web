import { Button } from "../ui/button";
import { Input } from "../ui/input";

const RFIDSection = ({ register }: { register: any }) => (
  <div>
    <p className="font-bold flex gap-2 text-[#1a2b4b]">Assign RFID Card</p>
    <p className="text-sm text-slate-500">
      Link an RFID card as a visitor pass.
    </p>
    <div className="space-y-1">
      <label htmlFor="rfid" className="text-sm font-normal text-gray-700">
        RFID Card
      </label>
      <div className="flex gap-4">
        <Input
          disabled
          type="text"
          id="rfid"
          placeholder="value"
          className="h-[44px] disabled:bg-slate-200"
          {...register("rfid")}
        />
        <Button className="h-[44px]">Activate RFID Reader</Button>
      </div>
    </div>
  </div>
);

export default RFIDSection;
