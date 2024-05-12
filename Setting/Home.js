import React, { useContext, useEffect,useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { AuthenticatedUserContext } from "../providers";
import ICon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

const Home=()=>{
    const { user } = useContext(AuthenticatedUserContext);
    const [user_main,setUser_main]=useState("");
    const handleLogout = () => {
        auth().signOut().catch(error => console.log('Error logging out: ', error));
        };  
    const fetchData = async () => {
        const Main_user = firestore().collection('Member').doc(user.uid);
        try {
            const snapshot_user = await Main_user.get();
            if (snapshot_user.exists) {
                setUser_main(snapshot_user.data());
            } else {
                console.log("Không tìm thấy dữ liệu cho người dùng có UID:", user.uid);
            }
        } catch (error) {
            console.error("Lỗi khi truy vấn dữ liệu người dùng:", error);
        }
    }
    useEffect(() => { 
        fetchData();
        },[user])
        console.log(user_main)
    return(
        <View style={{flex:1}}>
                {user_main.PhotoURL&&<Avatar.Image style={{alignSelf:'center'}} size={100} source={{ uri: user_main.PhotoURL }} />}
                <View style={{alignItems:'center'}}>
                        <Text><ICon name="information"/>{user_main.Name}</Text>
                        <Text style={{color:'blue'}}><ICon name="email"/> {user_main.Email}</Text>
                </View>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',margin:5,padding:5}}>
                    <ICon name="bag-personal"/>
                    <Text>Thay đổi thông tin cá nhân</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',margin:5,padding:5}}>
                    <ICon name="logout"/>
                    <Text>Đăng xuất</Text>
                </TouchableOpacity>
        </View>
    )
}
export default Home;