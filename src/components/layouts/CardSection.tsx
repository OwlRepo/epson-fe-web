import type React from "react"
import { Card } from "../ui/card";

interface CardSectionProps {
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    children?: React.ReactNode;
}

export default function CardSection({ children, headerLeft, headerRight }: CardSectionProps) {

    return (
        <Card className="flex flex-col gap-4 p-5">
            <div className="flex justify-between items-center">
                {headerLeft}
                {headerRight}
            </div>
            {children}
        </Card>
    )
}