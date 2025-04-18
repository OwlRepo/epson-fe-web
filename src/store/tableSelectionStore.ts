import { create } from 'zustand';

interface SelectedRowsState {
    selectedRows: Record<string, Record<string, any>>;
    selectRow: (tableId: string, rowId: string, row: any) => void;
    deselectRow: (tableId: string, rowId: string) => void;
    clearSelection: (tableId: string) => void;
    selectAll: (tableId: string, rows: Record<string, any>) => void;
    getSelectedRows: (tableId: string) => Record<string, any>;
    isSelected: (tableId: string, rowId: string) => boolean;
    getSelectedCount: (tableId: string) => number;
}

const useTableSelectionStore = create<SelectedRowsState>((set, get) => ({
    selectedRows: {},

    selectRow: (tableId, rowId, row) =>
        set((state) => ({
            selectedRows: {
                ...state.selectedRows,
                [tableId]: {
                    ...(state.selectedRows[tableId] || {}),
                    [rowId]: row
                }
            }
        })),

    deselectRow: (tableId, rowId) =>
        set((state) => {
            const tableRows = { ...(state.selectedRows[tableId] || {}) };
            delete tableRows[rowId];

            return {
                selectedRows: {
                    ...state.selectedRows,
                    [tableId]: tableRows
                }
            };
        }),

    clearSelection: (tableId) =>
        set((state) => ({
            selectedRows: {
                ...state.selectedRows,
                [tableId]: {}
            }
        })),

    selectAll: (tableId, rows) =>
        set((state) => ({
            selectedRows: {
                ...state.selectedRows,
                [tableId]: rows
            }
        })),

    getSelectedRows: (tableId) => {
        const state = get();
        return state.selectedRows[tableId] || {};
    },

    isSelected: (tableId, rowId) => {
        const state = get();
        return !!(state.selectedRows[tableId] && state.selectedRows[tableId][rowId]);
    },

    getSelectedCount: (tableId) => {
        const state = get();
        return Object.keys(state.selectedRows[tableId] || {}).length;
    }
}));

export default useTableSelectionStore;