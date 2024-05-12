import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import DetailWork from "../DetailWork";
import AddWork from "../AddWork";
import AddTask from "../AddTask";
import DetailTask from "../DetailTask";
import Member from "../Member";
import AddMember from "./AddMember";
import Chats from "./Chats";
import ProjectChart from "./test";
const Stack = createStackNavigator();
  const Stackwork = () => {
        return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={DetailWork} />
            <Stack.Screen name="AddTask" component={AddTask}/>
            <Stack.Screen name="DetailTask" component={DetailTask}/>
            <Stack.Screen name="Member" component={Member}/>
            <Stack.Screen name="Addmember" component={AddMember}/>
            <Stack.Screen name="GrantChart" component={ProjectChart}/>
            <Stack.Screen name="Chats" component={Chats}/>
        </Stack.Navigator>
        );
        };
export default Stackwork;