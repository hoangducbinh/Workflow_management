import React, { useCallback, useContext, useEffect, useState } from "react";
import { AuthenticatedUserContext } from "../providers";
import { Icon, Text } from "react-native-paper";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import firestore from '@react-native-firebase/firestore';
import ICon from 'react-native-vector-icons/MaterialCommunityIcons';

const Notify=({navigation})=>{
    const { user } = useContext(AuthenticatedUserContext);
    const [data,setData]=useState([]);
    const fetchNotify=async()=>{
        try {
            const taskSnapshot = await firestore().collection('Task').where('Member_ID', 'array-contains', user.uid).get();
            const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const memberSnapshot = await firestore().collection('Member').get();
            const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const mergedData = await tasks.map(task => ({
                ...task,
                members: members.filter(member => task.Member_ID.includes(member.id))
            }));
            setData(mergedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);  
        }
    }
    useEffect(() => {
        fetchNotify();
    }, [data]);
    const renderwork =({item}) => {
        //console.log(item);
        return (
                <TouchableOpacity style={{backgroundColor:'white',flexDirection:'row',...styles.fl}} onPress={() => navigation.navigate("DetailWork", { screen: 'DetailTask', params: {item: item} })}>
                    <ICon name='bell-circle-outline' size={20}/>
                    <Text style={{marginLeft:5}} >Bạn được giao nhiệm vụ mới :<Text style={{color:'blue'}}>{item.Task_name}</Text></Text>
                </TouchableOpacity>
        )};
    return(
        <View style={{flex:1,margin:10}}>
            <Text style={{textAlign:'center',fontSize:20}}>Thông báo </Text>
            <FlatList
                data={data}
                renderItem={renderwork}
            />
        </View>
    )
}
export default Notify;
const styles = StyleSheet.create({
    fl:{
        shadowOffset: {
            width: 2,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor:'white',
        margin:10,
        padding:10,
        borderRadius:15,
        alignItems:'center' 
    }

})