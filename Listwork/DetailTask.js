import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View, Linking, TouchableOpacity, FlatList, useWindowDimensions, StyleSheet } from "react-native";
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import { Button, Dialog, Portal, Provider, TextInput, ProgressBar, Avatar, Card } from "react-native-paper";
import { AuthenticatedUserContext } from "../providers";
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome6';

const DetailTask = ({ route, navigation }) => {
    const { item } = route.params;
    const { user } = useContext(AuthenticatedUserContext);
    const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const [report, setReport] = useState([]);
    const [visible, setVisible] = useState(false);
    const [proces, setProces] = useState(0);
    const [Description, setDescription] = useState("");
    const [dataevalue, setDataevalue] = useState([]);

    const uploadFileToFirebase = async (fileURI, fileName) => {
        try {
            const reference = storage().ref().child('files/' + fileName + user.uid);
            const task = await reference.putFile(fileURI);
            await task;
            const downloadURL = await reference.getDownloadURL();
            await firestore().collection('Reports').add({
                Member_upload: user.uid,
                Status: false,
                Task_ID: item.id,
                res: downloadURL,
                name: fileName
            });
            Alert.alert('Success', 'File has been uploaded to Firebase Storage.');
        } catch (error) {
            Alert.alert('Error', 'Failed to upload the file to Firebase Storage.');
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Member_PJ = firestore().collection('Reports').where("Task_ID", '==', item.id);
                const list = [];
                const snapshot = await Member_PJ.get();
                snapshot.forEach(doc => list.push(doc.data()));
                setReport(list);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [item.id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Evalua = firestore().collection('Evaluate_progress').where("Task_id", '==', item.id);
                const ev = [];
                const snapshot_eva = await Evalua.get();
                snapshot_eva.forEach(doc => ev.push(doc.data()));
                setDataevalue(ev);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [item.id]);

    useEffect(() => {
        if (dataevalue.length > 0) {
            setProces(dataevalue[0].status);
            setDescription(dataevalue[0].Description);
        }
    }, [dataevalue]);

    const pickDocument = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                copyTo: 'cachesDirectory'
            });
            if (res && res[0].fileCopyUri) {
                const fileName = res[0].name;
                await uploadFileToFirebase(res[0].fileCopyUri, fileName, res[0].types);
            } else {
                Alert.alert('Error', 'Invalid file selected.');
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                Alert.alert('Cancelled', 'File selection cancelled.');
            } else {
                Alert.alert('Error', 'Failed to pick the file.');
                console.error('Error picking file:', err);
            }
        }
    };

    const openFile = (link) => {
        Linking.openURL(link);
    };

    const UpdateStatus = () => {
        const Evalua = firestore().collection('Evaluate_progress');
        const valu = Evalua.where("Task_id", '==', item.id).get();

        valu.then((querySnapshot) => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const documentRef = firestore().collection('Evaluate_progress').doc(doc.id);
                    documentRef.update({
                        status: proces
                    })
                    .then(() => {
                        Alert.alert('Document updated successfully!');
                    })
                    .catch((error) => {
                        console.error('Error updating document: ', error);
                    });
                });
            } else {
                Evalua.add({
                    Task_id: item.id,
                    status: proces,
                    Description: Description
                })
                .then(() => {
                    console.log('New document added successfully!');
                })
                .catch((error) => {
                    console.error('Error adding new document: ', error);
                });
            }
        })
        .catch((error) => {
            console.error('Error getting documents: ', error);
        });
    };

    const renderwork = ({ item }) => {
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(item.name);
        const isPDF = /\.pdf$/i.test(item.name);
        const isWord = /\.docx$/i.test(item.name);
        let iconComponent;
        if (isImage) {
            iconComponent = <Icon size={20} name="image" />;
        } else if (isPDF) {
            iconComponent = <Icon size={20} name="file-pdf" />;
        } else {
            iconComponent = <Icon size={20} name="file-word" />;
        }
        return (
            <TouchableOpacity onPress={() => openFile(item.res)} style={styles.documentRow}>
                <View style={styles.documentContainer}>
                    {iconComponent}
                    <Text style={styles.documentName}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const isUserMember = item.members.find(member => member.id === user.uid);

    return (
        <Provider>
            <View style={styles.container}>
                <Text style={styles.taskTitle}>{item.Task_name}</Text>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả công việc</Text>
                    <Text>{item.Description}</Text>
                    <View style={styles.dateRow}>
                        <Icon color='blue' name="play" />
                        <Text> Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Icon color="red" name="flag-checkered" />
                        <Text> End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Phụ trách</Text>
                    <View style={styles.membersRow}>
                        {item.members.map((memberData, index) => (
                            <View key={memberData.id}>
                                <Avatar.Image source={{ uri: memberData.PhotoURL }} />
                                <Text style={styles.memberName}>{memberData.Name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh sách tệp</Text>
                    <FlatList
                        data={report}
                        renderItem={renderwork}
                    />
                    {isUserMember ? (
                        <Button mode="contained" onPress={pickDocument}>
                            Choose File
                        </Button>
                    ) : null}
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nhận xét</Text>
                    <Text>{Description}</Text>
                    <Text>{proces} %</Text>
                    <ProgressBar progress={proces / 100} />
                    <Button style={styles.saveButton} mode="contained" onPress={() => setVisible(true)}>
                        Xác nhận tiến độ
                    </Button>
                </View>
                <Portal>
                    <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                        <Dialog.Content>
                            <Text variant="bodyMedium">Xác nhận tiến độ %</Text>
                            <TextInput keyboardType="number-pad" value={proces.toString()} onChangeText={setProces} />
                            <TextInput value={Description} label="Mô tả đánh giá" onChangeText={setDescription} />
                            <Button onPress={() => UpdateStatus()}>Lưu</Button>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    taskTitle: {
        textAlign: 'center',
        fontSize: 25,
        marginBottom: 10,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
    },
    sectionTitle: {
      marginTop:10,
        color: 'blue',
        fontSize: 20,
        marginBottom: 10,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    membersRow: {
        flexDirection: 'row',
    },
    memberName: {
        textAlign: 'center',
    },
    documentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginBottom: 5,
    },
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    documentName: {
        marginLeft: 5,
    },
    saveButton: {
        marginTop: 10,
    },
});

export default DetailTask;
