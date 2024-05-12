import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import Listmain from "./Listmain";
import Stackwork from "./Work/StackWork";
import AddWork from "./AddWork";
const Stack = createStackNavigator();
  const StackListwork = () => {
        return (
        <Stack.Navigator initialRouteName="Home" screenOptions={()=>({headerShown:false,} )}>
            <Stack.Screen name="Listmain" component={Listmain}/>
            <Stack.Screen name="DetailWork" component={Stackwork}/>
            <Stack.Screen name="AddWork" component={AddWork}/>
        </Stack.Navigator>
        );
        };
export default StackListwork;