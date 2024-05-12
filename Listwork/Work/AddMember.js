import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Text } from "react-native-paper";

const AddMember = ({ route, navigation }) => {
    const { item, role } = route.params;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', item[0].Project_ID).get();
            const Member_PJ = Member_PJSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const memberSnapshot = await firestore().collection('Member').get();
            const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const mergedData = members.map(member => {
                const relatedMembers = Member_PJ.filter(PJ => PJ.Member_ID === member.id);
                return {
                    ...member,
                    relatedMembers: relatedMembers
                };
            });
            setData(mergedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [item[0].Project_ID, loading]);

    const renderTask = ({ item }) => {
        return (
            <View style={styles.taskItem}>
                {item.PhotoURL && <Avatar.Image source={{ uri: item.PhotoURL }} />}
                <View style={styles.taskDetails}>
                    <Text style={styles.taskName}>{item.Name}</Text>
                    <Text>{item.Email}</Text>
                </View>
                {role[0].Role === 0 && (
                    <View style={styles.buttonContainer}>
                        {!item.relatedMembers.length ? (
                            <Button onPress={() => Join_PJ(item.id)} mode="contained" style={styles.addButton}>
                                Thêm thành viên
                            </Button>
                        ) : (
                            <Text style={styles.greenText}>Thành viên nhóm</Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const Join_PJ = async (id) => {
        await firestore().collection('Member_PJ').add({
            Member_ID: id,
            Project_ID: item[0].Project_ID,
            Role: 2
        });
        setLoading(!loading);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Màu nền sáng
        padding: 10,
    },
    taskItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    taskDetails: {
        marginLeft: 10,
        flex: 1,
    },
    taskName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    buttonContainer: {
        marginLeft: 'auto',
    },
    addButton: {
        backgroundColor: '#6959CD', // Màu nút
    },
    greenText: {
        color: 'green',
    },
});

export default AddMember;
