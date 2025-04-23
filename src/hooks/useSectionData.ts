import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useSocket, type SummaryData } from './useSocket';

// Extract the valid route paths from TanStack Router type
type ValidRoutePaths = Parameters<typeof useSearch>[0]['from'];

interface UseSectionDataOptions {
    useSearchFrom?: ValidRoutePaths;
}

export const useSectionData = (options?: UseSectionDataOptions) => {
    // Cast to ValidRoutePaths to ensure type safety
    const defaultPath = '/_authenticated/attendance-monitoring/dashboard/departments' as ValidRoutePaths;
    const searchPath = options?.useSearchFrom || defaultPath;

    // Now TypeScript knows searchPath is a valid route path
    const search = useSearch({ from: searchPath }) as { departmentId?: string };
    const [roomName, setRoomName] = useState(search.departmentId || '');

    // Update roomName when URL param changes
    useEffect(() => {
        if (search.departmentId) {
            setRoomName(search.departmentId);
        }
    }, [search.departmentId]);

    const result = useSocket<SummaryData>({
        room: roomName,
        dataType: 'summary'
    });

    // Wrap the joinRoom function to update local state
    const joinRoom = (newRoom: string) => {
        setRoomName(newRoom);
        result.joinRoom(newRoom);
    };

    return {
        ...result,
        joinRoom,
    };
};
