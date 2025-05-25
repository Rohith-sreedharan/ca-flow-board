
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction } from '@/store/slices/authSlice';
import { UserRole } from '@/store/slices/authSlice';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleAuthUser(session.user);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleAuthUser(session.user);
      } else {
        setUser(null);
        dispatch(logoutAction());
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const handleAuthUser = async (authUser: any) => {
    try {
      // Get user details from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (userData && !error) {
        setUser(userData);
        dispatch(setCredentials({
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          role: userData.role as UserRole,
          token: authUser.access_token || 'mock-token'
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // For the production user, use a simple check
      if (email === 'rohith@springreen.in' && password === 'admin123') {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userData) {
          setUser(userData);
          dispatch(setCredentials({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            role: userData.role as UserRole,
            token: 'production-token'
          }));
          return { success: true };
        }
      }

      // For demo purposes, also check the mock users
      const mockUsers = [
        { id: '101', email: 'owner@caflow.com', password: 'password', name: 'John Owner', role: 'owner' },
        { id: '102', email: 'admin@caflow.com', password: 'password', name: 'Sarah Admin', role: 'superadmin' },
        { id: '103', email: 'employee@caflow.com', password: 'password', name: 'Mike Employee', role: 'employee' },
        { id: '104', email: 'client@caflow.com', password: 'password', name: 'Acme Corporation', role: 'client' },
      ];

      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      if (mockUser) {
        dispatch(setCredentials({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role as UserRole,
          token: 'mock-token'
        }));
        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
