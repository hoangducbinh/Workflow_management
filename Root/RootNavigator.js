import React, { useState, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import  {LoadingIndicator}  from './LoadingIndicator';
import StackListwork from '../Listwork/StackListWork';
import { AuthStack } from './AuthStack';
import { AuthenticatedUserContext } from '../providers';
import BottomTab from './BottomTab';

export const RootNavigator = () => {
    const { user, setUser } = useContext(AuthenticatedUserContext);
    //console.log("user1123"+user);   
    const [isLoading, setIsLoading] = useState(true);
    //const [role,setRole]=useState("");
    useEffect(() => {
        const unsubscribeAuthStateChanged = auth().onAuthStateChanged(
            authenticatedUser => {
                //console.log("use"+ authenticatedUser);
                authenticatedUser ? setUser(authenticatedUser) : setUser(null);
                //console.log("authenticatedUser: ha  ", authenticatedUser);        
                setIsLoading(false);
            }    
        );
            // unsubscribe auth listener on unmount
        return unsubscribeAuthStateChanged;
        }, [user]);
        
    if (isLoading) {
        return <LoadingIndicator />;
    }
    //console.log("user1123"+user);
    return (
    <NavigationContainer>
        {user ? <BottomTab /> : <AuthStack/>}
    </NavigationContainer>
    );  
};