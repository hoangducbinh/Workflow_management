import React from "react";
import { FlatList, SafeAreaView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome6';

const First = ({ data, navigation }) => {
    const renderNotification = ({ item }) => {
        const dateFormatOptions = { year: 'numeric', day: 'numeric', month: 'numeric' };
        return (
            <TouchableOpacity style={styles.notificationContainer} onPress={() => navigation.navigate("DetailTask", { item: item.tasks[0] })}>
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationText}>{item.Description} <Text style={styles.notificationTitle}>{item.Title}</Text> đã được Quản trị viên thêm vào</Text>
                    {item.Time != null ? (
                        <Text style={styles.notificationDate}><Icon color='blue' name="play" /> Ngày thêm: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Time.toDate())}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderNotification}
                keyExtractor={(item, index) => index.toString()}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    notificationContainer: {
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    notificationTitle: {
        color: 'blue',
        fontWeight: 'bold',
    },
    notificationDate: {
        color: '#777',
    },
});

export default First;
