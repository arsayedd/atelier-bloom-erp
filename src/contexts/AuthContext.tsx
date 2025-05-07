
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer fetching profile data to prevent deadlocks
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          email: user?.email || '',
          full_name: data.full_name,
          phone: data.phone,
          role: data.role
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`خطأ في تسجيل الدخول: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    setLoading(true);
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;
      
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`خطأ في إنشاء الحساب: ${error.message}`);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast.info('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
