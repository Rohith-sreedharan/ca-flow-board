
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'owner' | 'superadmin' | 'employee' | 'client';
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with error handling
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const newProfile = {
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
                  role: session.user.email === 'rohith@springreen.in' ? 'owner' : 'employee',
                };
                
                const { data: insertedProfile, error: insertError } = await (supabase as any)
                  .from('profiles')
                  .insert([newProfile])
                  .select()
                  .single();
                
                if (insertError) {
                  console.error('Error creating profile:', insertError);
                  setProfile(newProfile as UserProfile);
                } else {
                  setProfile(insertedProfile);
                }
              } else if (error) {
                console.error('Error fetching profile:', error);
                // Create a fallback profile
                setProfile({
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || null,
                  role: session.user.email === 'rohith@springreen.in' ? 'owner' : 'employee',
                  created_at: new Date().toISOString(),
                });
              } else {
                setProfile(profileData);
              }
            } catch (err) {
              console.error('Profile fetch error:', err);
              // Create a fallback profile
              setProfile({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || null,
                role: session.user.email === 'rohith@springreen.in' ? 'owner' : 'employee',
                created_at: new Date().toISOString(),
              });
            }
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    role: profile?.role || null,
  };
}
