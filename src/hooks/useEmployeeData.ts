import { useState, useEffect } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { useSocket, type LiveData } from './useSocket';

// Extract the valid route paths from TanStack Router type
type ValidRoutePaths = Parameters<typeof useSearch>[0]['from'];

interface UseEmployeeDataOptions {
    useSearchFrom?: ValidRoutePaths;
}

export const useEmployeeData = (options?: UseEmployeeDataOptions) => {
    // Cast to ValidRoutePaths to ensure type safety
    const defaultPath = '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/' as ValidRoutePaths;
    const searchPath = options?.useSearchFrom || defaultPath;

    const search = useParams({ from: searchPath }) as {
        divisionId?: string;
        departmentId?: string;
        sectionId?: string
    };

    // Construct room name from URL params
    const urlDerivedRoom = (() => {
        if (search.divisionId && search.departmentId && search.sectionId) {
            return `${search.divisionId}${search.departmentId}${search.sectionId}`;
        }
        return '';
    })();

    const [roomName, setRoomName] = useState(urlDerivedRoom);

    // Update roomName when URL params change
    useEffect(() => {
        if (urlDerivedRoom) {
            setRoomName(urlDerivedRoom);
        }
    }, [urlDerivedRoom]);

    const result = useSocket<LiveData>({
        room: roomName,
        dataType: 'live'
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
