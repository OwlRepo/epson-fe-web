import { useSocket, type LiveData } from './useSocket';
export interface EntryExitPointsData {
    room: string;
    dataType: 'summary' | 'live';
}

export const useEntryExitPointsData = ({ room, dataType }: EntryExitPointsData) => {
    return useSocket<LiveData>({
        room: room,
        dataType: dataType
    });
};
