import { Button } from "../ui/button";

interface SyncTimeInputProps {
  icon?: React.ReactNode;
  time: string;
  onEdit?: () => void;
}

const SyncTimeInput = ({
  icon = undefined,
  time,
  onEdit,
}: SyncTimeInputProps) => {
  return (
    <div className="bg-neutral-100 rounded-xl p-2 flex justify-between items-center mt-4">
      <p className="flex ml-2 gap-2 text-neutral-600">
        {icon}
        {time}
      </p>
      <Button onClick={onEdit}>Edit</Button>
    </div>
  );
};

export default SyncTimeInput;
