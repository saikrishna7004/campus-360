import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export type UserRole = 'student' | 'admin' | 'canteen';
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
}

const zustandStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return await SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await SecureStore.deleteItemAsync(name);
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
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);

export default useAuthStore;
