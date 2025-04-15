import dayjs from 'dayjs'
import { useState, useEffect } from 'react';

interface CardHeaderLeftProps {
    title?: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
}

export default function CardHeaderLeft({ title, subtitle }: CardHeaderLeftProps) {
    const [currentTime, setCurrentTime] = useState(dayjs().format("dddd, MMM D, YYYY, hh:mm:ss A"));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(dayjs().format("dddd, MMM D, YYYY, hh:mm:ss A"));
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col gap-1">
            {typeof title === "string" || !title ? <b className="text-[20px] text-primary">{title ? title : "Overview"}</b> : title}
            {typeof subtitle === "string" || !subtitle ? <p className="text-sm text-muted-foreground">{subtitle ? subtitle : `As of ${currentTime} (GMT +8)`}</p> : subtitle}
        </div>
    )
}