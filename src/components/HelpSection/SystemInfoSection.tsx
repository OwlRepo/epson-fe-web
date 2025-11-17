import { Card, CardContent } from "@/components/ui/card";
import { helpData } from "@/constants/helpData";
import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";

export function SystemInfoSection() {
  const { successStyle } = useToastStyleTheme();
  return (
    <Card className="h-fit">
      <CardContent className="p-6 flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            VERIFYI VERSION
          </h3>
          <p className="text-base text-gray-900">{helpData.verifyiVersion}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            ADDRESS
          </h3>
          <p className="text-xs text-gray-900 max-w-xs">
            {helpData.elidAddress || "-"}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            EMAIL
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-base text-gray-900">
              {helpData.elidEmailAddress || "-"}
            </p>
            {helpData.elidEmailAddress && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(helpData.elidEmailAddress);
                  toast.success("", {
                    description: "Email address copied to clipboard.",
                    style: successStyle,
                  });
                }}
                aria-label="Copy email address"
                title="Copy email address"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            CONTACT NUMBER
          </h3>
          <p className="text-base text-gray-900">
            {helpData.elidOfficeContactNumber || "-"}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            WEBSITE
          </h3>
          <p className="text-base text-gray-900">
            <a
              className="text-blue-500 hover:text-blue-700"
              href="https://elid.com.ph/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ELID Website
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
