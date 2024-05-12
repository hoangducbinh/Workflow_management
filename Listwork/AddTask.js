import React, { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView, Image, Alert, StyleSheet } from "react-native";
import DatePicker from 'react-native-date-picker'
import { IconButton, Button, Chip } from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';
import { Dropdown } from "react-native-element-dropdown";
import ICon from 'react-native-vector-icons/FontAwesome6';

const AddTask = ({ route }) => {
    const { work } = route.params;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dateStart, setDateStart] = useState(new Date());
    const [dateEnd, setDateEnd] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Member_PJSnapshot = await firestore().collection('Member_PJ').where("Project_ID", '==', work).get();
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
    }, []);

    const handleItemSelected = (item) => {
        if (!isItemSelected(item)) {
            setSelected([...selected, item]);
        }
    };

    const removeFromSelected = (indexToRemove) => {
        const updatedSelected = [...selected];
        updatedSelected.splice(indexToRemove, 1);
        setSelected(updatedSelected);
    };

    const isItemSelected = (item) => {
        return selected.some(selectedItem => selectedItem.Member_ID === item.Member_ID);
    };

    async function AddTask() {
        try {
            if (name != null) {
                const Task = await firestore().collection('Task');
                const memberNames = selected.map(item => item.Member_ID);
                await Task.add({
                    Task_name: name,
                    Description: description,
                    Project_ID: work,
                    Start_day: dateStart,
                    End_day: dateEnd,
                    Status: false,
                    Member_ID: memberNames
                });
                const Notify = await firestore().collection('Notification');
                await Notify.add({
                    Description: 'Nhiệm vụ mới ',
                    Project_ID: work,
                    Title: name,
                    Time: new Date().toISOString()
                });
                Alert.alert("Tạo dự án thành công");
            } else {
                console.error("Một số giá trị không hợp lệ để thêm vào Firestore.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu thuê:", error);
        }
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Tên nhiệm vụ</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={data.map(item => ({ ...item, disable: isItemSelected(item) }))}
                        search
                        maxHeight={300}
                        labelField="member.Name"
                        valueField="Member_ID"
                        placeholder="Chọn thành viên"
                        searchPlaceholder="Tìm kiếm..."
                        disableSearch={true}
                        onChange={item => handleItemSelected(item)}
                    />
                    <Text style={styles.label}>Ngày bắt đầu: {dateStart.toDateString()}</Text>
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
                    <Text style={styles.label}>Ngày kết thúc: {dateEnd.toDateString()}</Text>
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
                    <Button
                        style={styles.button}
                        labelStyle={{ color: '#fff' }}
                        onPress={() => AddTask()}
                    >
                        Thêm nhiệm vụ
                    </Button>


                </View>
                <View style={styles.selectedContainer}>
                    <Text style={styles.label}>Thành viên đã chọn:</Text>
                    {selected.map((item, idx) => (
                        <Chip
                            key={item.Member_ID}
                            avatar={<Image source={{ uri: item.member.PhotoURL }} />}
                            style={styles.chip}
                            onClose={() => removeFromSelected(idx)}>
                            {item.member.Name}
                        </Chip>
                    ))}
                </View>
            </View>
        </ScrollView>
    )
}
export default AddTask;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
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
    dropdown: {
        marginBottom: 20,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    button: {
        alignSelf: 'center',
        backgroundColor: '#007bff',
        marginTop: 10,
    },
    selectedContainer: {
        marginTop: 20,
    },
    chip: {
        alignSelf: 'flex-start',
        marginRight: 10,
        marginBottom: 10,
    },
});
