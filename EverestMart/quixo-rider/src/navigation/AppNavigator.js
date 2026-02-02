import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRiderAuth } from '../context/RiderAuthContext';

// Screens
import RiderLoginScreen from '../screens/RiderLoginScreen';
import RiderDashboardScreen from '../screens/RiderDashboardScreen';
import AvailableOrdersScreen from '../screens/AvailableOrdersScreen';
import ActiveDeliveryScreen from '../screens/ActiveDeliveryScreen';
import EarningsScreen from '../screens/EarningsScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={RiderLoginScreen} />
        </Stack.Navigator>
    );
}

function MainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={RiderDashboardScreen} />
            <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen} />
            <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen} />
            <Stack.Screen name="Earnings" component={EarningsScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useRiderAuth();

    if (isLoading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
