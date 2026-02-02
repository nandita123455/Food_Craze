import { StatusBar } from 'expo-status-bar';
import { RiderAuthProvider } from './src/context/RiderAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <RiderAuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </RiderAuthProvider>
  );
}
