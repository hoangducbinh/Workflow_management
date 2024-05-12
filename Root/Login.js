import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, Image} from "react-native"
import { Button, HelperText, TextInput } from "react-native-paper";
import {  login, useMyContextController  } from "./context";
const Login =({navigation})=>{
    const[controller,dispatch]= useMyContextController();
    const {userLogin}=controller;
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[hidepass,sethidepass]=useState(true);
    // useEffect(()=>{
    //   if(userLogin!=null)
    //   {
    //     if(userLogin.role=="admin")
    //         navigation.navigate("Admin")
    //     else if(userLogin.role=="customer")
    //         navigation.navigate("Customer")
    //   }
    // },[userLogin])
    
    const hasErrors = () => {
        return !email.includes('@');
      };
    const handleLogin = () => {
        login(dispatch,email,password)
      };      
    return(
        <View style={{backgroundColor:'white',flex:1}}>
            
            <Image style={{alignSelf:'center'}} resizeMode="cover" width={300} height={300} source={{uri:'https://img.freepik.com/premium-photo/cartoon-3d-business-man-office-isolated-white_744040-3767.jpg'}} />
            <Text style={{textAlign:"center",fontWeight:'bold',fontSize:25}}>Login</Text>
             <TextInput
                    mode="outlined"
                    style={{margin:10}}
                    placeholder='Enter Your Email'
                    value={email}
                    onChangeText={setEmail}
                    left={<TextInput.Icon icon="email" />}
                />
                <TextInput
                    mode="outlined"
                    style={{margin:10}}
                    placeholder='Enter Password'
                    secureTextEntry={hidepass}
                    value={password}
                    onChangeText={setPassword}
                    left={<TextInput.Icon icon="key" />}
                    right={<TextInput.Icon icon="eye" onPress={()=>sethidepass(!hidepass)}/>}
                />
                <View style={{marginTop:30, flexDirection:'row',alignSelf:'center'}}>
                    <Button mode="contained" style={{alignSelf:'center'}} onPress={()=>handleLogin()}>
                        Login
                    </Button>
                    <Button onPress={()=> navigation.navigate("Signup")} mode="outlined" style={{alignSelf:'center'}} >
                        Signup
                    </Button>
                </View>
        </View>
    )
}
export default Login;