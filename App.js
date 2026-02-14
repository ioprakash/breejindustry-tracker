import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { JCBFormScreen } from './src/screens/JCBFormScreen';
import { TipperFormScreen } from './src/screens/TipperFormScreen';
import { DieselEntryScreen } from './src/screens/DieselEntryScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ExpenseFormScreen } from './src/screens/ExpenseFormScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { theme } from './src/styles/theme';
import { UpdateModal } from './src/components/UpdateModal';
import { checkForUpdates } from './src/services/updateHandler';
import { getData } from './src/services/storage';

const API_URL = 'https://script.google.com/macros/s/AKfycbxubMOm8TjBOzgOzhazJ2-heLKddQpVI9-kK6Tea1zZlRQlIeI1h0Z8VDXUZarh5sOe-Q/exec';

const Stack = createNativeStackNavigator();

export default function App() {
  const [updateVisible, setUpdateVisible] = React.useState(false);
  const [updateData, setUpdateData] = React.useState(null);

  React.useEffect(() => {
    const checkUpdate = async () => {
      try {
        // Don't show update on login screen to prevent crash
        const role = await getData('@user_role');
        if (!role) return;

        const result = await checkForUpdates(API_URL);
        if (result.updateAvailable) {
          setUpdateData(result);
          setUpdateVisible(true);
        }
      } catch (err) {
        console.log('Update check failed quietly:', err);
      }
    };

    // Slight delay to ensure app is ready
    setTimeout(checkUpdate, 2000);
  }, []);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0f172a"
        translucent={false}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.card,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="JCBForm"
            component={JCBFormScreen}
            options={{ title: 'JCB Entry' }}
          />
          <Stack.Screen
            name="TipperForm"
            component={TipperFormScreen}
            options={{ title: 'Tipper Entry' }}
          />
          <Stack.Screen
            name="DieselEntry"
            component={DieselEntryScreen}
            options={{ title: 'Diesel Entry' }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Operations Dashboard' }}
          />
          <Stack.Screen
            name="ExpenseForm"
            component={ExpenseFormScreen}
            options={{ title: 'Daily Expense' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <UpdateModal
        visible={updateVisible}
        updateData={updateData}
        onDismiss={() => setUpdateVisible(false)}
      />
    </>
  );
}
