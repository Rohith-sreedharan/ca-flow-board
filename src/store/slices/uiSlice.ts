
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type BoardViewType = 'kanban' | 'list';
export type ThemeMode = 'light' | 'dark';

interface UIState {
  sidebarCollapsed: boolean;
  boardView: BoardViewType;
  theme: ThemeMode;
  notificationsUnread: number;
  activeFilters: {
    status?: string[];
    priority?: string[];
    category?: string[];
    assignedTo?: string[];
    dueDate?: string;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  boardView: 'kanban',
  theme: 'light',
  notificationsUnread: 3,
  activeFilters: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setBoardView: (state, action: PayloadAction<BoardViewType>) => {
      state.boardView = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    setActiveFilters: (
      state,
      action: PayloadAction<Partial<UIState['activeFilters']>>
    ) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    setNotificationsRead: (state) => {
      state.notificationsUnread = 0;
    },
    incrementUnreadNotifications: (state, action: PayloadAction<number>) => {
      state.notificationsUnread += action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setBoardView,
  setTheme,
  setActiveFilters,
  clearFilters,
  setNotificationsRead,
  incrementUnreadNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
