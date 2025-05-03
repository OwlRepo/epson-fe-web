import type React from "react"
import { Card } from "../ui/card";
import type { ClassNameValue } from "tailwind-merge";

interface CardSectionProps {
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    children?: React.ReactNode;
    contentWrapperClassName?: ClassNameValue;
}

export default function CardSection({ children, headerLeft, headerRight, contentWrapperClassName }: CardSectionProps) {

    return (
        <Card className="flex flex-col gap-4 p-5">
            <div className="flex justify-between items-center">
                {headerLeft}
                {headerRight}
            </div>
            <div className={`max-h-[75vh] overflow-y-auto custom-scrollbar relative ${contentWrapperClassName}`}>
                {children}
            </div>
        </Card>
    )
}