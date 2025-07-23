import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./avatar";

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + ".";
}

interface UserProfileProps {
  userName: string;
  userInitials: string;
  userRole: string;
  onLogout: () => void;
  maxNameLength?: number;
  className?: string;
}

export default function UserProfile({
  userName,
  userInitials,
  userRole,
  onLogout,
  maxNameLength = 12,
  className = "",
}: UserProfileProps) {
  const truncatedName = truncateText(userName, maxNameLength);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex h-auto items-center gap-3 rounded-lg px-3 py-2 hover:bg-transparent shadow-none ${className}`}
        >
          <Avatar>
            <AvatarFallback className="bg-primary text-white font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="font-medium" title={userName}>
              {truncatedName}
            </div>
            <div className="text-sm text-gray-500">{userRole}</div>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-1 w-[180px] rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <DropdownMenuItem
          onClick={onLogout}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#FF4D4D] focus:bg-gray-50 focus:text-[#FF4D4D]"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
