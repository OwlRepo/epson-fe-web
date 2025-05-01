import { getApiBaseUrl } from '@/utils/env';
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for our data
export interface SummaryData {
    name: string;
    in: string; // Total Count
    out: string; // Total Count
}

export interface LiveData {
    employee_id: string;
    full_name: string;
    department: string;
    division: string;
    section: string;
    tag_id: string;
    in: string;
    out: string;
}

type DataType = 'summary' | 'live';

interface UseSocketProps {
    room: string;
    dataType: DataType;
}

const SOCKET_URL = getApiBaseUrl()

export const useSocket = <T extends SummaryData | LiveData>({ room, dataType }: UseSocketProps) => {
    const [data, setData] = useState<T[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Connect to socket and join room
    useEffect(() => {
        if (!room) {
            setError('Room name is required');
            setIsLoading(false);
            return;
        }

        let socketInstance: Socket;

        try {
            socketInstance = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });
        } catch (err) {
            setError(`Failed to initialize socket: ${err instanceof Error ? err.message : String(err)}`);
            setIsLoading(false);
            return;
        }

        // Set loading state
        setIsLoading(true);

        socketInstance.on('connect', () => {
            setIsConnected(true);
            setError(null);

            // Join the specified room
            socketInstance.emit('join', room);
            console.log(`Joined room: ${room}`);
        });

        socketInstance.on('connect_error', (err) => {
            setIsConnected(false);
            setError(`Connection error: ${err.message}`);
            setIsLoading(false);
            console.error('Socket connection error:', err);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        // Listen for preload data when joining room
        socketInstance.on('preload', (preloadData) => {
            console.log('Preload data received:', preloadData);
            if (Array.isArray(preloadData)) {
                setData(preloadData as T[]);
            } else {
                console.error('Expected array for preload data but got:', typeof preloadData);
                setData([]);
            }
            setIsLoading(false);
        });

        // Listen for updates
        socketInstance.on('data', (newData) => {
            console.log('New data received:', newData);

            if (dataType === 'summary') {
                // For summary data, update the matching item in array
                setData((prevData) => {
                    // Check if the item exists
                    const exists = prevData.some(
                        (item) => (item as SummaryData).name === (newData as SummaryData).name
                    );

                    if (exists) {
                        // Update existing item
                        return prevData.map((item) => {
                            if ((item as SummaryData).name === (newData as SummaryData).name) {
                                return { ...item, ...newData };
                            }
                            return item;
                        });
                    } else {
                        // Add new item
                        return [...prevData, newData as T];
                    }
                });
            } else if (dataType === 'live') {
                // For live data, add to array or update if employee_id already exists
                setData((prevData) => {
                    const employeeExists = prevData.some(
                        (item) => (item as LiveData).employee_id === (newData as LiveData).employee_id
                    );

                    if (employeeExists) {
                        return prevData.map((item) =>
                            (item as LiveData).employee_id === (newData as LiveData).employee_id
                                ? { ...item, ...newData }
                                : item
                        );
                    } else {
                        return [...prevData, newData as T];
                    }
                });
            }
        });

        setSocket(socketInstance);

        // Clean up function
        return () => {
            socketInstance.off('connect');
            socketInstance.off('disconnect');
            socketInstance.off('connect_error');
            socketInstance.off('preload');
            socketInstance.off('data');
            socketInstance.disconnect();
            console.log(`Left room: ${room}`);
        };
    }, [room, dataType]);

    // Function to manually leave current room and join a new one
    const joinRoom = useCallback((newRoom: string) => {
        if (!socket) return;

        setIsLoading(true);
        socket.emit('room', newRoom);
        console.log(`Joined new room: ${newRoom}`);
        // Reset data when changing rooms
        setData([]);
    }, [socket]);

    // Clear all data
    const clearData = useCallback(() => {
        setData([]);
    }, []);

    return {
        data,
        isConnected,
        error,
        isLoading,
        joinRoom,
        clearData,
    };
};
