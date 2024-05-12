import React, { useContext, useEffect, useMemo, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { TabView, SceneMap } from 'react-native-tab-view';
import { IconButton, Appbar, Dialog, Portal, Button, Provider, Avatar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { AuthenticatedUserContext } from "../providers";
import { Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import First from "./Work/First";
import Second from "./Work/Second";

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

const DetailWork = ({ route, navigation }) => {
    const { work } = route.params;
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [dataTask, setdataTask] = useState([]);
    const { user } = useContext(AuthenticatedUserContext);
    const [role, setRole] = useState([]);
    const [visible, setVisible] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    const [notify, setNotify] = useState([]);
    const [routes] = useState([
        { key: 'first', title: 'Chung' },
        { key: 'second', title: 'Nhiệm vụ' },
    ]);

    const copyToClipboard = async () => {
        Clipboard.setString(work.Project_ID);
    };

    const handleChatButtonPress = async () => {
        const groupChatRef = await firestore().collection('GroupChats').where('projectId', '==', work.Project_ID).get();
        if (groupChatRef.empty) {
            await createNewGroupChat();
        } else {
            navigation.navigate('Chats', { groupId: groupChatRef.docs[0].id });
        }
    };

    const fetchData = async () => {
        try {
            const Member_PJ = firestore().collection('Member_PJ').where("Member_ID", '==', user.uid).where("Project_ID", '==', work.Project_ID);
            const list = [];
            const snapshot = await Member_PJ.get();
            snapshot.forEach(doc => list.push(doc.data()));
            setRole(list);
            const taskSnapshot = await firestore().collection('Task').where("Project_ID", '==', work.Project_ID).get();
            const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (taskSnapshot != null) {
                const memberSnapshot = await firestore().collection('Member').get();
                const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const mergedData = tasks.map(task => ({
                    ...task,
                    members: members.filter(member => task.Member_ID.includes(member.id))
                }));
                setdataTask(mergedData)
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [work.Project_ID, user.uid]);

    const fetchNotify = async () => {
        try {
            const Notify = firestore().collection('Notification').where("Project_ID", '==', work.Project_ID);
            const list = [];
            const snapshot = await Notify.get();
            snapshot.forEach(doc => list.push(doc.data()));
            const mergedData = list.map(list => ({
                ...list,
                tasks: dataTask.filter(tasks => list.Title == tasks.Task_name)
            }));
            setNotify(mergedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    }

    useEffect(() => {
        fetchNotify();
    }, [dataTask]);

    const FirstRoute = useMemo(() => () => <First data={notify} navigation={navigation} />, [notify]);

    const SecondRoute = useMemo(() => () => <Second data={dataTask} role={role} navigation={navigation} />, [dataTask, role, navigation]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    const createNewGroupChat = async () => {
        try {
            const projectRef = await firestore().collection('Project').doc(work.Project_ID).get();
            const projectData = projectRef.data();
            if (!projectData) {
                throw new Error(`Project with ID ${work.Project_ID} does not exist`);
            }
            const newGroupChatRef = await firestore().collection('GroupChats').add({
                projectId: work.Project_ID,
            });
            const membersSnapshot = await firestore().collection('Project').doc(work.Project_ID).collection('Member_PJ').get();
            const members = membersSnapshot.docs.map(doc => doc.data());
            await Promise.all(members.map(member => newGroupChatRef.collection('Members').add(member)));
            navigation.navigate('Chats', { groupId: newGroupChatRef.id });
        } catch (error) {
            console.error('Error creating new group chat:', error);
        }
    };

    return (
        <Provider>
            <View style={{ flex: 1 }}>
                <Appbar.Header>
                    <Appbar.Content title={work.Project_name} />
                    <Appbar.Action icon="account-supervisor" onPress={() => navigation.navigate("Member", { item: dataTask, role: role })} />
                    <Appbar.Action icon="chart-timeline" onPress={() => navigation.navigate("GrantChart", { item: work })} />
                    <Appbar.Action icon="chat-processing" onPress={handleChatButtonPress} />
                    <Appbar.Action icon="chart-timeline" onPress={() => navigation.navigate("AddTask", { item: work })} />
                    <Appbar.Action icon={MORE_ICON} onPress={() => setVisible(true)} />
                </Appbar.Header>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                />
                <Portal>
                    <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ position: 'absolute', top: 0, right: 2 }}>
                        <Dialog.Actions style={{ flexDirection: 'column' }}>
                            <Button onPress={copyToClipboard}>Copy Mã </Button>
                            <Button onPress={() => navigation.navigate("Addmember", { item: dataTask, role: role })}>Thêm thành viên</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    )
}

export default DetailWork;
