import React, { useState } from "react";
import { Text, TextInput, View, ScrollView, StyleSheet } from "react-native";
import DatePicker from 'react-native-date-picker'
import { IconButton, Button } from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';

const AddWork = ({ }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dateStart, setDateStart] = useState(new Date());
    const [dateEnd, setDateEnd] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [user, setUser] = useState("QWqNQon3mmP6HVs0cNT0KKRf5tV2");

    async function AddProject() {
        try {
            if (name != null) {
                const Project = await firestore().collection('Project');
                const docRef = await Project.add({
                    Project_name: name,
                    Description: description,
                    Project_ID: '',
                    Start_day: dateStart,
                    End_day: dateEnd
                });
                const docId = docRef.id;
                await Project.doc(docId).update({
                    Project_ID: docId
                });
                const Member_PJ = await firestore().collection('Member_PJ');
                Member_PJ.add({
                    Member_ID: user,
                    Project_ID: docId,
                    Role: 0,
                })
                Alert.alert("Tạo dự án thành công");
            } else {
                console.error("Một số giá trị không hợp lệ để thêm vào Firestore.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu thuê:", error);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.headerText}>Tạo dự án mới</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Tên dự án"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Mô tả"
                    multiline={true}
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />
                <View style={styles.dateContainer}>
                    <View style={styles.datePickerContainer}>
                        <Text style={styles.label}>Ngày bắt đầu:</Text>
                        <Text>{dateStart.toDateString()}</Text>
                        <IconButton icon="calendar-clock" onPress={() => setOpen(true)} />
                        <DatePicker
                            modal
                            open={open}
                            date={dateStart}
                            onConfirm={(date) => {
                                setOpen(false)
                                setDateStart(date)
                            }}
                            onCancel={() => setOpen(false)}
                        />
                    </View>
                    <View style={styles.datePickerContainer}>
                        <Text style={styles.label}>Ngày kết thúc dự kiến:</Text>
                        <Text>{dateEnd.toDateString()}</Text>
                        <IconButton icon="calendar-clock" onPress={() => setOpenE(true)} />
                        <DatePicker
                            modal
                            open={openE}
                            date={dateEnd}
                            onConfirm={(date) => {
                                setOpenE(false)
                                setDateEnd(date)
                            }}
                            onCancel={() => setOpenE(false)}
                        />
                    </View>
                </View>
                <Button style={styles.button} mode="contained" onPress={() => AddProject()}>Tạo dự án</Button>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    formContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        padding: 10,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    datePickerContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        alignSelf: 'center',
        backgroundColor: '#007bff',
        marginTop: 10,
    },
});

export default AddWork;
