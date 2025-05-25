
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'owner' | 'superadmin' | 'employee' | 'client';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  role: null,
  isAuthenticated: false,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        email: string;
        role: UserRole;
        token: string;
      }>
    ) => {
      const { id, name, email, role, token } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.role = role;
      state.token = token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
