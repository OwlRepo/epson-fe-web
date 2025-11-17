import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface ContactCardProps {
  name: string;
  position: string;
  contactNumber: string;
  picture?: string | null;
  className?: string;
}

export function ContactCard({
  name,
  position,
  contactNumber,
  picture,
  className,
}: ContactCardProps) {
  return (
    <Card
      className={cn(
        "p-4 hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <CardContent className="p-0 space-y-3">
        {/* Picture placeholder */}
        <div className="w-40 h-40 mx-auto bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
          {picture ? (
            <img
              src={picture}
              alt={name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-xs">Picture</span>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-1">
          <div>
            <span className="text-xs font-medium text-gray-600">NAME:</span>
            <p className="text-sm text-gray-900 mt-0.5">{name || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600">POSITION:</span>
            <p className="text-sm text-gray-900 mt-0.5">{position || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600">
              CONTACT NUMBER:
            </span>
            <p className="text-sm text-gray-900 mt-0.5">
              {contactNumber || "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
