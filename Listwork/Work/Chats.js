import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Image, Keyboard, TouchableOpacity, KeyboardAvoidingView, } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import Icon from 'react-native-vector-icons/FontAwesome';

const Chats = ({ route, navigation }) => {

  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
 

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('GroupChats')
      .doc(groupId)
      .collection('Messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const messageList = [];
        snapshot.forEach(doc => {
          messageList.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messageList);
      });
    return () => unsubscribe();
  }, [ groupId]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
    Keyboard.dismiss();
    setNewMessage('');
    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.error('Error sending message: User is not logged in');
        return;
      }
      const senderSnapshot = await firestore().collection('Member').doc(currentUser.uid).get();
      const senderData = senderSnapshot.data();
      const senderName = senderData ? senderData.Name : "Unknown";
      if (!currentUser.uid || !senderName) {
        console.error('Error sending message: Sender information is undefined');
        return;
      }
      await firestore().collection('GroupChats').doc(groupId).collection('Messages').add({
        text: newMessage,
        createdAt: firestore.FieldValue.serverTimestamp(),
        senderId: currentUser.uid,
        senderName: senderName,
      });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMyMessage = item.senderId === firebase.auth().currentUser.uid;
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMyMessage && <Image style={styles.avatar} source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtajIEIEWD4IRO96S1qflyEjySsZxXi7VxLdAdrmVWEA&s' }} />}
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageTime}>{formatMessageTime(item.createdAt)}</Text>
            <Text style={styles.messageSender}>{item.senderName}</Text>
          </View>
          <View style={[styles.message, isMyMessage ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        </View>
        {isMyMessage && <Image style={styles.avatar} source={{ uri: 'https://technewsdaily.vn/uploads/2023/01/20/f-14.jpg' }} />}
      </View>
    );
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Group Chat</Text> */}
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Icon name="send" size={20} color="#007bff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  messageList: {
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    marginLeft: 10,
    marginRight: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  message: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#16a085',
  },
  myMessage: {
    backgroundColor: '#2980b9',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageSender: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 5,
  },
  messageTime: {
    color: '#ccc',
    fontSize: 12,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#000', // Change text color to black
  },
  sendButton: {
    marginRight: 10,
  },
});

export default Chats;
