import React from 'react';

interface AttendanceCountCardProps {
    icon: React.ReactNode;
    count: number;
    subtitle: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

const AttendanceCountCard: React.FC<AttendanceCountCardProps> = ({
    icon,
    count,
    subtitle,
    variant = 'info',
    className,
}) => {
    const variantStyles = {
        info: 'bg-blue-100 text-blue-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
    };

    const cardStyle = `flex space-x-3 w-full rounded-lg p-4 ${variantStyles[variant]} ${className}`;

    return (
        <div className={cardStyle}>
            <div className="text-[22px]">{icon}</div>
            <div className='flex flex-col'>
                <div className="text-[30px]/[35px] mb-1 font-bold">{count}</div>
                <div className="text-[16px] text-muted-foreground">{subtitle}</div>
            </div>
        </div>
    );
};

export default AttendanceCountCard;