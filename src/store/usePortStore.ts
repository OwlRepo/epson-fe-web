import { create } from "zustand";

interface PortStore {
  port: Navigator | null;
  setPort: (port: Navigator) => void;
}

const usePortStore = create<PortStore>((set) => ({
  port: null,
  setPort: (port) => set({ port }),
}));

export default usePortStore;
