import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { riderAPI } from '../services/api';

const RiderAuthContext = createContext({});

export const RiderAuthProvider = ({ children }) => {
    const [rider, setRider] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('riderToken');
            const storedRider = await AsyncStorage.getItem('rider');

            if (storedToken && storedRider) {
                setToken(storedToken);
                setRider(JSON.parse(storedRider));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Load auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await riderAPI.login({ email, password });
            const { token: newToken, rider: riderData } = response.data;

            await AsyncStorage.setItem('riderToken', newToken);
            await AsyncStorage.setItem('rider', JSON.stringify(riderData));

            setToken(newToken);
            setRider(riderData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('riderToken');
            await AsyncStorage.removeItem('rider');
            setToken(null);
            setRider(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateRider = async (updates) => {
        try {
            const updatedRider = { ...rider, ...updates };
            await AsyncStorage.setItem('rider', JSON.stringify(updatedRider));
            setRider(updatedRider);
        } catch (error) {
            console.error('Update rider error:', error);
        }
    };

    return (
        <RiderAuthContext.Provider
            value={{
                rider,
                token,
                isLoading,
                isAuthenticated,
                login,
                logout,
                updateRider,
            }}
        >
            {children}
        </RiderAuthContext.Provider>
    );
};

export const useRiderAuth = () => {
    const context = useContext(RiderAuthContext);
    if (!context) {
        throw new Error('useRiderAuth must be used within RiderAuthProvider');
    }
    return context;
};
