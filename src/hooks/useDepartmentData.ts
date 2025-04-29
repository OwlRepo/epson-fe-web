import { useState, useEffect } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { useSocket, type SummaryData } from './useSocket';

// Extract the valid route paths from TanStack Router type
type ValidRoutePaths = Parameters<typeof useSearch>[0]['from'];

interface UseDepartmentDataOptions {
    useSearchFrom?: ValidRoutePaths;
}

export const useDepartmentData = (options?: UseDepartmentDataOptions) => {
    // Cast to ValidRoutePaths to ensure type safety
    const defaultPath = '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/' as ValidRoutePaths;
    const searchPath = options?.useSearchFrom || defaultPath;

    const search = useParams({ from: searchPath }) as { divisionId?: string };
    const [roomName, setRoomName] = useState(search.divisionId || '');

    // Update roomName when URL param changes
    useEffect(() => {
        if (search.divisionId) {
            setRoomName(search.divisionId);
        }
    }, [search.divisionId]);

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
