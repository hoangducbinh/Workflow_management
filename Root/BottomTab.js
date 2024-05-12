import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import StackListwork from "../Listwork/StackListWork";
import ICon from 'react-native-vector-icons/FontAwesome6';
import List from "../Listwork/ListWork";
import Notify from "../Listwork/Notify";
import StackSetting from "../Setting/StackSetting";
import TaskList from "../Listwork/UserTaskList";

const Tab = createBottomTabNavigator();
const BottomTab=()=>{
    return(
        <Tab.Navigator
            screenOptions={({route})=>({
                showLabel:false,
                headerShown:false,
                style:{
                    height:"10%",
                    backgroundColor:'black'
                },
                tabBarIcon:({focused})=>{
                    const color = focused ? 'red' : 'gray'; // Use color instead of tintColor
                    switch(route.name){
                        case "Home":
                            return(
                                <ICon
                                size={20}
                                name="house"
                                resizeMode="contain"
                                style={{
                                    paddingLeft:2,
                                    color: color, // Use color property
                                    width:25,
                                    height:25
                                }}/>
                            )
                        case "ListWork":
                            return(
                                <ICon
                                name="list"
                                size={20}
                                resizeMode="contain"
                                style={{
                                    paddingLeft:2,
                                    color: color, // Use color property
                                    width:25,
                                    height:25
                                }}/>
                            )
                        case "Calendar":
                            return(
                                <ICon
                                name="calendar-days"
                                size={20}
                                resizeMode="contain"
                                style={{
                                    paddingLeft:2,
                                    color: color, // Use color property
                                    width:25,
                                    height:25
                                }}/>
                            )
                        case "Setting":
                            return(
                                <ICon
                                name="gear"
                                size={20}
                                resizeMode="contain"
                                style={{
                                    paddingLeft:2,
                                    color: color, // Use color property
                                    width:25,
                                    height:25
                                }}/>
                            )
                    }
                }
            })}>
                <Tab.Screen name="Home" component={StackListwork}/>
                <Tab.Screen name="ListWork" component={List}/>
                <Tab.Screen name="Calendar" component={TaskList}/>
                <Tab.Screen name="Setting" component={StackSetting}/>
        </Tab.Navigator>
    )
}
export default BottomTab;
