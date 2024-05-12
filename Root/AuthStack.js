import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './SignupScreen';
import ResetScreen from './ResetPassword';
import Login from './Login';
import { MyContextControllerProvider } from './context';
const Stack = createStackNavigator();
export const AuthStack = () => {
return (
    <MyContextControllerProvider>
    <Stack.Navigator
    initialRouteName='Login'
    screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='Signup' component={SignupScreen} />
        <Stack.Screen name='Reset' component={ResetScreen} />
    </Stack.Navigator>
    </MyContextControllerProvider>
);
};
