import { Plus, X } from "lucide-react";
import { accessClassMap } from "../dialogs/accessClassMap";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type ModuleSelectionProps = {
  value: string[];
  onChange: (value: string[]) => void;
  availableModules?: string[];
  disabled?: boolean;
};

const ModuleSelection = ({
  value,
  onChange,
  availableModules,
  disabled = false,
}: ModuleSelectionProps) => {
  const toggleAccess = (access: string) => {
    if (disabled) return;

    if (value.includes(access)) {
      onChange(value.filter((item) => item !== access)); // remove
    } else {
      onChange([...value, access]); // add
    }
  };

  // Get modules to display - use availableModules if provided, otherwise all modules
  const modulesToDisplay = availableModules ?? Object.keys(accessClassMap);

  return (
    <div className="mt-2 gap-1 flex flex-wrap">
      {modulesToDisplay.map((access) => {
        const hasAccess = value.includes(access);
        return (
          <Badge
            key={access}
            className={cn(
              "bg-slate-400 text-white rounded-full ml-1",
              !disabled && "cursor-pointer",
              disabled && "cursor-not-allowed opacity-75",
              hasAccess &&
                accessClassMap[access as keyof typeof accessClassMap],
              hasAccess &&
                !disabled &&
                `hover:${accessClassMap[access as keyof typeof accessClassMap]}`,
            )}
          >
            {access}
            {!disabled &&
              (hasAccess ? (
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
              ))}
          </Badge>
        );
      })}
    </div>
  );
};

export default ModuleSelection;
