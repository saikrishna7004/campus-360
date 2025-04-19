import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Platform } from 'react-native';

export type UserRole = 'student' | 'admin' | 'vendor';
export type VendorType = 'food' | 'stationery' | 'other';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    type?: VendorType;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    getAuthHeader: () => { Authorization: string } | {};
    loadUser: (authHeader: Record<string, string>) => Promise<void>;
    refreshToken: () => Promise<boolean>;
    verifyToken: () => Promise<void>;
}

const zustandStorage = {
    getItem: async (name: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(name);
        } else {
            return await SecureStore.getItemAsync(name);
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(name, value);
        } else {
            await SecureStore.setItemAsync(name, value);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(name);
        } else {
            await SecureStore.deleteItemAsync(name);
        }
    },
};

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null,
            
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
                        email,
                        password
                    });
                    
                    const { user, token } = response.data;
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    
                    return true;
                } catch (error) {
                    set({ 
                        error: 'Invalid email or password', 
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        token: null
                    });
                    
                    return false;
                }
            },
            
            register: async (name, email, password) => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
                        name,
                        email,
                        password
                    });
                    
                    const { user, token } = response.data;
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    
                    return true;
                } catch (error) {
                    set({ 
                        error: 'Registration failed', 
                        isLoading: false 
                    });
                    
                    return false;
                }
            },
            
            logout: () => {
                set({ 
                    user: null, 
                    token: null,
                    isAuthenticated: false 
                });
            },
            
            getAuthHeader: () => {
                const { token } = get();
                return token ? { Authorization: `Bearer ${token}` } : {};
            },

            loadUser: async (authHeader) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/auth/user`, {
                        headers: authHeader,
                    });
                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Failed to load user',
                    });
                }
            },

            verifyToken: async () => {
                const { token } = get();
                if (!token) return;
                
                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/verify_token`, { token });
                    const { user, newToken } = response.data;
                    set({ user, token: newToken, isAuthenticated: true, error: null });
                } catch (error) {
                    set({ 
                        user: null, 
                        token: null, 
                        isAuthenticated: false,
                        error: 'Session expired. Please login again.'
                    });
                }
            },

            refreshToken: async () => {
                const { token } = get();
                if (!token) return false;

                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/verify_token`, { token });
                    const { user, newToken } = response.data;
                    set({ user, token: newToken, isAuthenticated: true });
                    return true;
                } catch (error) {
                    set({ user: null, token: null, isAuthenticated: false });
                    return false;
                }
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);

export default useAuthStore;
