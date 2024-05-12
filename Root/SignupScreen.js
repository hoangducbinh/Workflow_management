import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Avatar, Button, HelperText, Text, TextInput } from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { login, useMyContextController } from './context';

const SignupScreen=()=>{
    const navigation = useNavigation();
    const[email,setEmail]= useState('');
    const[password,setPassword]= useState('');
    const [username,setUsername]=useState('');
    const[enterpassword,setenterPassword]= useState('');
    const[hidepass,sethidepass]=useState(true)
    const[hide_enter_pass,set_enter_hidepass]=useState(true)
    const[hidebutton,sethidebutton]=useState(true)
    const[selected,setSelected]=useState(false)
    const[controller,dispatch]= useMyContextController();
    const [img,setImg]= useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU8TDDFS503rPt6U-CNt2J8eN65YJMoljLhw&s");
    const hasErrors = () => {
        return !email.includes('@');
      };
      const handleSignup = async () => {
        try {
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          const uid = userCredential.user.uid; // Lấy uid từ userCredential
      
          const Profile = firestore().collection('Member');
          await Profile.doc(uid).set({
            Name: username,
            Email: email,
            Password: password,
            PhotoURL:img
          });
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
          }
      
          if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
          }
      
          console.error(error);
        }
      };
      
    const checkSign=async()=>{
        if(password===enterpassword)
        {
            await handleSignup();
            login(dispatch,email,password)
        }else{
            console.log('Enter Password invalid!');
        }
    }
    const pickImage = () => {
        let options = {
          storageOptions: {
            path: 'image',
          },
        };
    launchImageLibrary(options, (response) => {
          if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
            const selectedImageUrl = response.assets[0].uri;
            setImg(selectedImageUrl);
            console.log(img);
            setSelected(true);
          } else if (response.didCancel) {
            // Người dùng hủy chọn hình ảnh
            console.log('Hủy chọn hình ảnh');
            setSelected(false);
          } else if (response.error) {
            // Xử lý lỗi khi người dùng không chọn ảnh
            Alert.alert('Lỗi', 'Không có ảnh được chọn.');
          }
        });
        
      };
      const uploadImageAndAddUser= async () => {
        if(selected){
        const response = await fetch(img);
        const blob = await response.blob();
    
        const storageRef = storage().ref().child('images/' + new Date().getTime());
    
        const uploadTask = storageRef.put(blob);
    
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Theo dõi tiến trình upload nếu cần
            // snapshot.totalBytes và snapshot.bytesTransferred
          },
          (error) => {
            console.error('Error uploading image:', error);
          },
          () => {
            // Lấy URL của ảnh sau khi upload thành công
            uploadTask.snapshot.ref.getDownloadURL().then(async(downloadURL) => {
              setImg(downloadURL);
            });
          }
        );
    }checkSign();
      };
    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
        enableOnAndroid={true}>
        <View style={{flex:1}}>
            <View style={{flex:3}}>
                <Avatar.Image style={{alignSelf:'center'}} size={150} source={{uri:img}}/>
                <Button onPress={pickImage}>Chọn ảnh</Button>
                <Text style={{fontWeight:'bold',fontSize:28, textAlign:'center'}}>Craete a new account!</Text>
            </View>
            <View style={{flex:7}}>
                <TextInput
                    placeholder='Enter User Name'
                    style={styles.ti}
                    value={username}
                    onChangeText={setUsername}
                    left={<TextInput.Icon icon="email" />}
                />
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
                <TextInput
                    placeholder='Enter Password'
                    style={styles.ti}
                    secureTextEntry={hidepass}
                    value={password}
                    onChangeText={setPassword}
                    left={<TextInput.Icon icon="key" />}
                    right={<TextInput.Icon icon="eye" onPress={()=>sethidepass(!hidepass)}/>}
                />
                <TextInput
                    placeholder='Confirm Password'
                    style={styles.ti}
                    secureTextEntry={hide_enter_pass}
                    value={enterpassword}
                    onChangeText={setenterPassword}
                    left={<TextInput.Icon icon="key"/>}
                    right={<TextInput.Icon icon="eye" onPress={()=>set_enter_hidepass(!hide_enter_pass)}/>}
                />
                <Button style={styles.login} onPress={()=>uploadImageAndAddUser()} >
                    Signup
                </Button>
                <Button style={{color:'blue'}} onPress={()=>navigation.navigate('Login')}>
                    Already have an account?
                </Button>
                </View>
        </View>
        </KeyboardAwareScrollView>
    )
}
export default SignupScreen;

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