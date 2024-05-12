import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';


const ResetScreen=()=>{
    const[email,setEmail]= useState('');
    const hasErrors = () => {
        return !email.includes('@');
      };
    const handleSendPasswordResetEmail = () => {
        auth().sendPasswordResetEmail(email)
        .then(() => {
        console.log('Success: Password Reset Email sent.');
        })
        .catch(error => setErrorState(error.message));
        };
    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
        enableOnAndroid={true}>
        <View style={{flex:1}}>
                <Text style={{fontWeight:'bold',fontSize:28, textAlign:'center'}}>Reset Your Password</Text>         
                <TextInput
                    placeholder='Enter Your Email'
                    style={styles.ti}
                    value={email}
                    onChangeText={setEmail}
                    left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="error" visible={hasErrors()}>
                    Địa chỉ Email không hợp lệ !
                </HelperText>
                <Button style={styles.login} onPress={()=>handleSendPasswordResetEmail()}>
                    Send Reset Email
                </Button>
                <Button style={{color:'blue'}}>
                    Go back to Login 
                </Button>
        </View>
        </KeyboardAwareScrollView>
    )
}
export default ResetScreen;

const styles = StyleSheet.create(
    {
        logo:{
            maxHeight:250,
            maxWidth:250,
            justifyContent:'center',
            alignSelf:'center',
        },
        ti:{
            marginTop:20,
            marginLeft:20,
            marginRight:20,
        },
        login:{
            backgroundColor:'yellow',
            margin: 20,
            color:'white'
        }
    }
)