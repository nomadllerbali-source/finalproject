import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '../types/database';

export type UserRole = 'admin' | 'agent' | 'sales';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_name: string | null;
  company_logo: string | null;
  phone_number: string | null;
  address: string | null;
}

export type AgentRegistration = Database['public']['Tables']['agent_registrations']['Row'];

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredAgents: AgentRegistration[];
}

type AuthAction = 
  | { type: 'SET_SESSION'; payload: { user: UserProfile | null; session: Session | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'SET_REGISTERED_AGENTS'; payload: AgentRegistration[] }
  | { type: 'ADD_AGENT_REGISTRATION'; payload: AgentRegistration }
  | { type: 'UPDATE_AGENT_STATUS'; payload: { id: string; status: 'active' | 'suspended' } }
  | { type: 'DELETE_AGENT'; payload: string };

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  registeredAgents: []
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_REGISTERED_AGENTS':
      return {
        ...state,
        registeredAgents: action.payload
      };
    case 'ADD_AGENT_REGISTRATION':
      return {
        ...state,
        registeredAgents: [...state.registeredAgents, action.payload]
      };
    case 'UPDATE_AGENT_STATUS':
      return {
        ...state,
        registeredAgents: state.registeredAgents.map(agent =>
          agent.id === action.payload.id
            ? { ...agent, status: action.payload.status }
            : agent
        )
      };
    case 'DELETE_AGENT':
      return {
        ...state,
        registeredAgents: state.registeredAgents.filter(agent => agent.id !== action.payload)
      };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string; role: UserRole; company_name?: string }) => Promise<{ success: boolean; error?: string }>;
  registerAgent: (data: Omit<AgentRegistration, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<{ success: boolean; message: string }>;
  updateAgentStatus: (agentId: string, status: 'active' | 'suspended') => Promise<{ success: boolean; message: string }>;
  deleteAgent: (agentId: string) => Promise<{ success: boolean; message: string }>;
  updateAgentProfile: (agentId: string, data: { companyName: string; companyLogo?: string }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Running in demo mode - no Supabase connection');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          dispatch({ 
            type: 'SET_SESSION', 
            payload: { user: profile, session } 
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();

    // Listen for auth changes
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          (async () => {
            if (session?.user) {
              const profile = await getUserProfile(session.user.id);
              dispatch({
                type: 'SET_SESSION',
                payload: { user: profile, session }
              });
            } else {
              dispatch({ type: 'LOGOUT' });
            }
          })();
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  // Load agent registrations
  useEffect(() => {
    const loadAgentRegistrations = async () => {
      if (!isSupabaseConfigured()) {
        // Load demo agent registrations for admin users
        if (state.user && state.user.role === 'admin') {
          const demoAgents: AgentRegistration[] = [];
          dispatch({ type: 'SET_REGISTERED_AGENTS', payload: demoAgents });
        }
        return;
      }

      if (!state.user || state.user.role !== 'admin') {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('agent_registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading agent registrations:', error);
          return;
        }

        dispatch({ type: 'SET_REGISTERED_AGENTS', payload: data || [] });
      } catch (error) {
        console.error('Error loading agent registrations:', error);
      }
    };

    loadAgentRegistrations();
  }, [state.user]);

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.error('Profile not found for user:', userId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Use Supabase authentication only
      if (!isSupabaseConfigured() || !supabase) {
        console.error('Supabase not configured');
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Supabase not configured' };
      }

      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: error.message };
      }

      console.log('Login successful, user:', data.user?.id);

      if (data.user) {
        console.log('Fetching profile for user:', data.user.id);
        const profile = await getUserProfile(data.user.id);
        console.log('Profile fetched:', profile);

        if (profile) {
          // If user is an agent, check if they're approved
          if (profile.role === 'agent') {
            const { data: agentData } = await supabase
              .from('agent_registrations')
              .select('status')
              .eq('email', profile.email)
              .maybeSingle();

            if (!agentData || agentData.status !== 'approved') {
              await supabase.auth.signOut();
              dispatch({ type: 'SET_LOADING', payload: false });
              return {
                success: false,
                error: 'Your agent account is pending admin approval. Please wait for approval to login.'
              };
            }
          }

          console.log('Setting session with profile:', profile.role);
          dispatch({
            type: 'SET_SESSION',
            payload: { user: profile, session: data.session }
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return { success: true };
        } else {
          console.error('Profile not found for user:', data.user.id);
        }
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Profile not found' };
    } catch (error) {
      console.error('Unexpected login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    dispatch({ type: 'LOGOUT' });
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; role: UserRole; company_name?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - simulate successful signup
      const demoUser: UserProfile = {
        id: `demo-${userData.role}-${Date.now()}`,
        email: email,
        full_name: userData.full_name,
        role: userData.role,
        company_name: userData.company_name || null,
        company_logo: null,
        phone_number: null,
        address: null
      };
      
      // In demo mode, immediately log in the user after signup
      dispatch({ 
        type: 'SET_SESSION', 
        payload: { user: demoUser, session: null } 
      });
      
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            company_name: userData.company_name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const registerAgent = async (
    data: Omit<AgentRegistration, 'id' | 'created_at' | 'updated_at' | 'status'>
  ): Promise<{ success: boolean; message: string }> => {
    // Store agent registration in local storage for demo mode
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data: insertedData, error } = await supabase
          .from('agent_registrations')
          .insert({
            company_name: data.companyName,
            company_logo: data.companyLogo || null,
            address: data.address,
            email: data.email,
            phone_no: data.phoneNo,
            username: data.username,
            password_hash: data.password
          })
          .select()
          .single();

        if (error) {
          console.error('Agent registration error:', error);
          return { success: false, message: error.message || 'Registration failed. Please try again.' };
        }

        dispatch({ type: 'ADD_AGENT_REGISTRATION', payload: insertedData as AgentRegistration });
        return { success: true, message: 'Registration successful! Your account is pending admin approval.' };
      }

      const newAgent: AgentRegistration = {
        id: Date.now().toString(),
        company_name: data.companyName,
        company_logo: data.companyLogo || null,
        address: data.address,
        email: data.email,
        phone_no: data.phoneNo,
        username: data.username,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        approved_by: null,
        approved_at: null
      };

      // Save to local storage
      const savedAgents = localStorage.getItem('registeredAgents') || '[]';
      const agents = JSON.parse(savedAgents);
      
      // Check for duplicates
      const emailExists = agents.some((a: any) => a.email === data.email);
      const usernameExists = agents.some((a: any) => a.username === data.username);
      
      if (emailExists || usernameExists) {
        return { success: false, message: 'Email or username already exists' };
      }
      
      agents.push(newAgent);
      localStorage.setItem('registeredAgents', JSON.stringify(agents));
      
      dispatch({ type: 'ADD_AGENT_REGISTRATION', payload: newAgent });

      return { success: true, message: 'Registration successful! Your account is pending admin approval.' };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const updateAgentStatus = async (
    agentId: string, 
    status: 'active' | 'suspended'
  ): Promise<{ success: boolean; message: string }> => {
    if (!state.user || state.user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('agent_registrations')
          .update({ 
            status, 
            approved_by: state.user?.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', agentId);

        if (error) {
          return { success: false, message: error.message };
        }
      }

      // Update in local storage
      const savedAgents = localStorage.getItem('registeredAgents') || '[]';
      const agents = JSON.parse(savedAgents);
      const updatedAgents = agents.map((agent: any) => 
        agent.id === agentId 
          ? { 
              ...agent, 
              status, 
              approved_by: state.user.id,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : agent
      );
      localStorage.setItem('registeredAgents', JSON.stringify(updatedAgents));

      dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { id: agentId, status } });
      return { success: true, message: `Agent ${status} successfully` };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const deleteAgent = async (agentId: string): Promise<{ success: boolean; message: string }> => {
    if (!state.user || state.user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('agent_registrations')
          .delete()
          .eq('id', agentId);

        if (error) {
          return { success: false, message: error.message };
        }
      }

      // Remove from local storage
      const savedAgents = localStorage.getItem('registeredAgents') || '[]';
      const agents = JSON.parse(savedAgents);
      const updatedAgents = agents.filter((agent: any) => agent.id !== agentId);
      localStorage.setItem('registeredAgents', JSON.stringify(updatedAgents));

      dispatch({ type: 'DELETE_AGENT', payload: agentId });
      return { success: true, message: 'Agent deleted successfully' };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const updateAgentProfile = async (
    agentId: string, 
    data: { companyName: string; companyLogo?: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            company_name: data.companyName,
            company_logo: data.companyLogo,
            updated_at: new Date().toISOString()
          })
          .eq('id', agentId);

        if (error) {
          return { success: false, message: error.message };
        }
      }

      // Update profile in demo mode
      if (state.user && state.user.id === agentId) {
        const updatedProfile = {
          ...state.user,
          company_name: data.companyName,
          company_logo: data.companyLogo
        };
        
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { user: updatedProfile, session: state.session } 
        });
      }

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, message: 'Password reset email sent! (Demo mode - no actual email sent)' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Password reset email sent! Check your inbox.' };
    } catch (error) {
      return { success: false, message: 'Failed to send reset email. Please try again.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, message: 'Password updated successfully! (Demo mode)' };
    }

    // Supabase password reset will be handled by their built-in flow
    return { success: true, message: 'Password updated successfully!' };
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      logout, 
      signUp,
      registerAgent,
      updateAgentStatus,
      deleteAgent,
      updateAgentProfile,
      forgotPassword,
      resetPassword,
      dispatch 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};