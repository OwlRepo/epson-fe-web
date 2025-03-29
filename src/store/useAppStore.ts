import { createStore } from "./store";

interface AppState {
  count: number;
  theme: "light" | "dark";
}

interface AppActions {
  increment: () => void;
  decrement: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const initialState: AppState & AppActions = {
  count: 0,
  theme: "light",
  increment: () => {},
  decrement: () => {},
  setTheme: () => {},
};

export const useAppStore = createStore<AppState & AppActions>(
  "app-store",
  initialState,
  {
    persist: true,
    devtools: true,
  }
);

// Update the store with actual implementations
useAppStore.setState((state) => ({
  ...state,
  increment: () => useAppStore.setState({ count: state.count + 1 }),
  decrement: () => useAppStore.setState({ count: state.count - 1 }),
  setTheme: (theme) => useAppStore.setState({ theme }),
}));
