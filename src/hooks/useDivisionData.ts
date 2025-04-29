import { useSocket, type SummaryData } from './useSocket';

export const useDivisionData = () => {
    return useSocket<SummaryData>({
        room: 'Division',
        dataType: 'summary'
    });
};
