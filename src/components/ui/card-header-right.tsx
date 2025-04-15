import React from 'react';

interface CardHeaderRightProps {
    title?: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
}

export default function CardHeaderRight({ title, subtitle }: CardHeaderRightProps) {

    return (
        <div className="flex flex-col items-end gap-1">
            {typeof title === 'string' || !title ? <b className="text-[20px] text-primary">{title ? title : "Total Logs"}</b> : title}
            {typeof subtitle === 'string' || subtitle ? <p className='text-muted-foreground text-sm'>{subtitle}</p> : <div className='flex flex-row space-x-10'>
                <div className='flex flex-row space-x-2'>
                    <p>Clocked In:</p>
                    <b className="text-positive">0</b>
                </div>
                <div className='flex flex-row space-x-2'>
                    <p>Clocked Out:</p>
                    <b className="text-negative">0</b>
                </div>
            </div>}
        </div>
    )
}