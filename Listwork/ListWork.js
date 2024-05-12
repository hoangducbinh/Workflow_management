import React, { useContext, useEffect, useRef, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import { AuthenticatedUserContext } from "../providers";
import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { Avatar, Searchbar, Text, Divider } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome6';

const List = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthenticatedUserContext);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const hasFetchedData = useRef(false);
    const [datasearch, setDatasearch] = useState([]);
    const [memberCounts, setMemberCounts] = useState({});

    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    useEffect(() => {
        const fetchData = async () => {
            const Tasks = firestore().collection('Member_PJ').where("Member_ID", '==', user.uid);
            const list = [];
            const snapshot = await Tasks.get();
            snapshot.forEach(doc => list.push(doc.data()));

            const userIDs = list.map(item => item.Project_ID);
            const Projects = firestore().collection('Project').orderBy("Start_day", "desc").where(firestore.FieldPath.documentId(), 'in', userIDs);
            const listall = [];
            const projectSnapshot = await Projects.get();
            projectSnapshot.forEach(doc => listall.push(doc.data()));
            setData(listall);
        };
        fetchData();
        hasFetchedData.current = true;
    }, [user]);

    useEffect(() => {
        const fetchMemberCounts = async () => {
            const counts = {};
            for (const item of data) {
                try {
                    const snapshot = await firestore().collection('Member_PJ').where("Project_ID", "==", item.Project_ID).get();
                    const count = snapshot.size;
                    counts[item.Project_ID] = count;
                } catch (error) {
                    console.error('Error counting members:', error);
                    counts[item.Project_ID] = 0; // Gán số thành viên là 0 nếu có lỗi
                }
            }
            setMemberCounts(counts);
        };
        fetchMemberCounts();
    }, [data]);

    useEffect(() => {
        if (hasFetchedData.current) {
            if (searchQuery != null) {
                const filteredResult = data.filter((item) =>
                    item &&
                    (
                        (item.Project_name && removeDiacritics(item.Project_name).toLowerCase().includes(removeDiacritics(searchQuery).toLowerCase())) ||
                        (item.Description && removeDiacritics(item.Description).toLowerCase().includes(removeDiacritics(searchQuery).toLowerCase()))
                    )
                );
                setDatasearch(filteredResult);
            } else {
                setDatasearch(data);
            }
        }
    }, [searchQuery, data]);

    const renderwork = ({ item }) => {
        const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const memberCount = memberCounts[item.Project_ID] || 0; // Lấy số thành viên từ biến trạng thái hoặc mặc định là 0
        return (
            <TouchableOpacity style={styles.projectContainer} onPress={() => navigation.navigate("DetailWork", { screen: 'Home', params: { work: item } })}>
                <View style={styles.projectDetails}>
                    <View style={styles.projectHeader}>
                        <Avatar.Image source={{ uri: "https://png.pngtree.com/png-clipart/20230504/original/pngtree-project-management-flat-icon-png-image_9137782.png" }} style={styles.avatar} />
                        <View>
                            <Text style={styles.projectName}>{item.Project_name}</Text>
                            <Text style={styles.dateText}><Icon color='blue' name="play" /> Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                            <Text style={styles.dateText}><Icon color="red" name="flag-checkered" /> End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                        </View>
                    </View>
                    <Divider />
                    <View style={styles.memberCount}>
                        <Icon name="people-group" size={20} />
                        <Text style={styles.memberCountText}>{memberCount} members</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>My Projects</Text>
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />
            {data != null ? (
                <FlatList
                    data={datasearch}
                    renderItem={renderwork}
                />
            ) : (<Text style={styles.emptyListText}>No projects found</Text>)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    pageTitle: {
        fontSize: 30,
        marginLeft: 10,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    searchbar: {
        marginBottom: 10,
    },
    projectContainer: {
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 15,
        elevation: 3,
        padding: 10,
    },
    projectDetails: {
        flex: 1,
    },
    projectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        marginRight: 10,
    },
    projectName: {
        fontSize: 20,
        color: '#007bff',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    dateText: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#555',
    },
    memberCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    memberCountText: {
        fontSize: 16,
        marginLeft: 5,
        color: '#555',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#555',
    },
});

export default List;
