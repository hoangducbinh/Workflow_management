/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import StackListwork from './Listwork/StackListWork';
import { NavigationContainer } from '@react-navigation/native';
import { AuthenticatedUserContext, AuthenticatedUserProvider } from './providers';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './Root/RootNavigator';

function App() { 
  return (
    <AuthenticatedUserProvider>
        <SafeAreaProvider>
                <RootNavigator/>
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );
}



export default App;
