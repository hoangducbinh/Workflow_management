import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Alert } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { Avatar, Button, Dialog, Portal, Provider, Text } from "react-native-paper";

const Member = ({ route, navigation }) => {
    const { item, role } = route.params;
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', item[0].Project_ID).get();
                const Member_PJ = Member_PJSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const memberSnapshot = await firestore().collection('Member').get();
                const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const mergedData = Member_PJ.map(memberPJ => {
                    const correspondingMember = members.find(member => member.id === memberPJ.Member_ID);
                    return { ...memberPJ, member: correspondingMember };
                });
                setData(mergedData);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };

        fetchData();
    }, [item[0].Project_ID, loading]);

    const removeUserIDFromTask = async () => {
        try {
            const taskDoc = await firestore().collection('Task')
                .where("Project_ID", '==', selected.Project_ID)
                .where("Member_ID", 'array-contains', selected.Member_ID).get();
            const tasks = taskDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            tasks.forEach(async (taskDoc) => {
                const updatedMemberID = taskDoc.Member_ID.filter(id => id !== selected.Member_ID);
                await firestore().collection('Task').doc(taskDoc.id).update({
                    Member_ID: updatedMemberID
                });
            });
        } catch (error) {
            console.error('Error removing user from task:', error);
            Alert.alert('Error', 'An error occurred while removing the user from the task');
        }
    };

    const handleDelete = async () => {
        try {
            await removeUserIDFromTask();
            await firestore().collection('Member_PJ').doc(selected.id).delete();
            hideDialog();
            setLoading(!loading);
            Alert.alert('Xóa thành công');
        } catch (error) {
            console.error('Error deleting service: ', error);
            Alert.alert('Error', 'An error occurred while deleting the user');
        }
    };

    const renderTask = ({ item }) => {
        return (
            <View style={styles.taskItem}>
                <Avatar.Image source={{ uri: item.member.PhotoURL }} />
                <View style={styles.taskDetails}>
                    <Text style={styles.taskName}>{item.member.Name}</Text>
                    <Text>{item.member.Email}</Text>
                </View>
                {role[0].Role === 0 && (
                    <Button mode="contained" onPress={() => { setVisible(true); setSelected(item); }}>
                        Mời rời nhóm
                    </Button>
                )}
            </View>
        );
    };

    const hideDialog = () => setVisible(false);

    return (
        <Provider>
            <View style={styles.container}>
                <Text style={styles.title}>Danh sách thành viên</Text>
                <FlatList
                    data={data}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                />
                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Title>Bạn có chắc muốn xóa người này ra khỏi dự án?</Dialog.Title>
                        <Dialog.Actions>
                            <Button onPress={hideDialog}>Cancel</Button>
                            <Button onPress={handleDelete}>Ok</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    title: {
        fontSize: 25,
        textAlign: 'center',
        fontWeight: "bold",
        marginBottom: 10,
    },
    taskItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
    },
    taskDetails: {
        marginLeft: 10,
        flex: 1,
    },
    taskName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});

export default Member;
