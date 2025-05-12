import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    path: string;
    isActive?: boolean;
}

export interface BreadcrumbsProps {
    className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
    // Get current location information
    const { location } = useRouterState();

    // Get the pathname segments without empty strings
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Format breadcrumb segments
    const breadcrumbs = pathSegments.map((segment, index) => {
        // Build the path up to this segment
        const path = '/' + pathSegments.slice(0, index + 1).join('/');

        // Format the label
        const formattedLabel = segment
            .split("_").join(" ")
            .replace(/-/g, " ")
            .replace(/%20/g, " ")
            .split("%2").join(" ");

        return {
            label: formattedLabel,
            path,
            isActive: index === pathSegments.length - 1,
        };
    });

    if (breadcrumbs.length <= 0) return null;

    return (
        <div className={cn("flex items-center gap-2 text-gray-500", className)}>
            {breadcrumbs.map((segment, index) => (
                <React.Fragment key={segment.path}>
                    <Link
                        to={segment.path}
                        className={cn(
                            "text-sm font-normal capitalize hover:text-gray-700 hover:cursor-pointer",
                            segment.isActive && "font-medium text-gray-700"
                        )}
                    >
                        {segment.label}
                    </Link>
                    {index < breadcrumbs.length - 1 && (
                        <span className="text-xs text-gray-400">
                            <ChevronRight className="w-3 h-3" />
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
