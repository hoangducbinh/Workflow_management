import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome6';

const Second = ({ role, data, navigation }) => {
    const renderTaskItem = useCallback(({ item }) => {
        const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return (
            <TouchableOpacity style={styles.taskItemContainer} onPress={() => navigation.navigate("DetailTask", { item: item })}>
                <Text style={styles.taskTitle}>Nhiệm vụ: {item.Task_name}</Text>
                <View style={styles.dateContainer}>
                    <View style={styles.dateItem}>
                        <Icon color='blue' name="play" />
                        <Text style={styles.dateText}>Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                    </View>
                    <View style={styles.dateItem}>
                        <Icon color="red" name="flag-checkered" />
                        <Text style={styles.dateText}>End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                    </View>
                </View>
                <Text style={styles.taskTitle}>Thành viên tham gia:</Text>
                <View style={styles.memberContainer}>
                    {item.members.map((memberData, index) => (
                        <View key={memberData.id} style={styles.memberItem}>
                            <Avatar.Image source={{ uri: memberData.PhotoURL }} size={30} />
                            <Text style={styles.memberName}>{memberData.Name}</Text>
                        </View>
                    ))}
                </View>
            </TouchableOpacity>
        );
    }, [navigation]); 

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderTaskItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.contentContainer}
            />
            {role.Role == 0 ? (
                <View style={styles.addButtonContainer}>
                    <IconButton
                        icon="plus"
                        color="#fff"
                        size={20}
                        onPress={() => navigation.navigate("AddTask", { work: work.Project_ID })}
                    />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Màu nền sáng
    },
    contentContainer: {
        paddingBottom: 60,
    },
    taskItemContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 15,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dateContainer: {
        marginBottom: 10,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    dateText: {
        marginLeft: 5,
    },
    memberContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    
    
    memberItem: {
        alignItems: 'center',
        marginRight: 10, 
        marginBottom: 10, 

    },
    memberName: {
        marginTop: 5,
        fontSize: 12,
    },
    addButtonContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: '#f44336',
        borderRadius: 30,
        padding: 10,
    },
});

export default Second;
