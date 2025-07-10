import { Plus, X } from "lucide-react";
import { accessClassMap } from "../dialogs/accessClassMap";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type ModuleSelectionProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const ModuleSelection = ({ value, onChange }: ModuleSelectionProps) => {
  const toggleAccess = (access: string) => {
    if (value.includes(access)) {
      onChange(value.filter((item) => item !== access)); // remove
    } else {
      onChange([...value, access]); // add
    }
  };

  return (
    <div className="mt-2 gap-1 flex flex-wrap">
      {Object.keys(accessClassMap).map((access) => {
        const hasAccess = value.includes(access);
        return (
          <Badge
            key={access}
            className={cn(
              "bg-slate-400 text-white rounded-full ml-1 cursor-pointer",
              hasAccess &&
                accessClassMap[access as keyof typeof accessClassMap],
              hasAccess &&
                `hover:${accessClassMap[access as keyof typeof accessClassMap]}`
            )}
          >
            {access}
            {hasAccess ? (
              <X
                size={12}
                className="ml-1"
                onClick={() => toggleAccess(access)}
              />
            ) : (
              <Plus
                size={12}
                className="ml-1"
                onClick={() => toggleAccess(access)}
              />
            )}
          </Badge>
        );
      })}
    </div>
  );
};

export default ModuleSelection;
