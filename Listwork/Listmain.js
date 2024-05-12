import React, { useContext, useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { List, Searchbar,IconButton, MD3Colors, Icon, Avatar,Card, Button, ProgressBar, Provider, Portal, Dialog, TextInput } from 'react-native-paper'
import { useNavigation } from "@react-navigation/native";
import ICon from 'react-native-vector-icons/FontAwesome6';
import { AuthenticatedUserContext } from "../providers";

import Clipboard from '@react-native-clipboard/clipboard';


const Listmain = ({}) => {
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const layout = useWindowDimensions();
    const { user } = useContext(AuthenticatedUserContext);
    const [search, setSearch] = useState('');
    const [task,setTask] = useState([]);
    const [datasearch,setDatasearch]=useState([]);
    const [user_main,setUser_main]=useState("");
    const [dataevalue,setDataevalue]=useState([]);
    const [visible, setVisible] = useState(false);
    const [code,setCode]=useState("");
    const hideDialog = () => setVisible(false);
    const [loading,setLoading]=useState(false);
    const hasFetchedData = useRef(false);   
    const fetchCopiedText = async () => {
        const text = await Clipboard.getString();
        setCode(text);
        setVisible(true);
      };
      
    useEffect(() => { 
        const fetchData = async () => {
            const Main_user = firestore().collection('Member').doc(user.uid);
            try {
                const snapshot_user = await Main_user.get();
                if (snapshot_user.exists) {
                    setUser_main(snapshot_user.data());
                } else {
                    console.log("Không tìm thấy dữ liệu cho người dùng có UID:", user.uid);
                }
            } catch (error) {
                console.error("Lỗi khi truy vấn dữ liệu người dùng:", error);
            }
            const Tasks = firestore().collection('Member_PJ').where("Member_ID", '==', user.uid);
            const list = [];
            const snapshot = await Tasks.get();
            snapshot.forEach(doc => list.push(doc.data()));

            const userIDs = list.map(item => item.Project_ID);
            const Projects = firestore().collection('Project').orderBy("Start_day","desc").where(firestore.FieldPath.documentId(), 'in', userIDs).limit(2);
            const listall = [];
            const projectSnapshot = await Projects.get();
            projectSnapshot.forEach(doc => listall.push(doc.data()));

            setData(listall);
            const taskSnapshot = await firestore().collection('Task').where('Member_ID', 'array-contains', user.uid).get();

            const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
                // Lấy tất cả các tài liệu Member
            const memberSnapshot = await firestore().collection('Member').get();
            const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const EvaSnapshot = await firestore().collection('Evaluate_progress').get();
            const evals = EvaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
                // Ghép dữ liệu từ hai collection
            const mergedData = tasks.map(task => ({
                    ...task,
                    members: members.filter(member => task.Member_ID.includes(member.id)),
                    evals:evals.filter(evall=>evall.Task_id==task.id)
                }));
                setTask(mergedData)
        };
        //console.log("hihi");
        fetchData();
        hasFetchedData.current = true;
    }, [user,loading,data]); 
    //console.log("nè");
    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
    useEffect(() => {
        if (hasFetchedData.current) {
        if(search!=null)
        {
            const filteredResult = data.filter((item) =>
          item &&
          (
            (item.Project_name && removeDiacritics(item.Project_name).toLowerCase().includes(removeDiacritics(search).toLowerCase())) ||
            (item.Description && removeDiacritics(item.Description).toLowerCase().includes(removeDiacritics(search).toLowerCase()))
          )
        );
        setDatasearch(filteredResult);
        }else{
            setDatasearch(data);
        }
        
      }}, [search,data]);
    const [memberCounts, setMemberCounts] = useState({});
    const handleSearch = (text) => {
        setSearch(text);
      };
    useEffect(() => {
        const fetchMemberCounts = async () => {
            const counts = {};
            for (const item of data) {
                try {
                    const snapshot = await firestore().collection('Member_PJ').where("Project_ID","==",item.Project_ID).get();
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
    const [hoveredItem, setHoveredItem] = useState(null); 
    const renderTask=({item})=>{
        
        let evalue=null;
        if (item.evals && item.evals.length > 0 && item.evals[0].status) {
            evalue=item.evals[0].status;
        } else {
            //console.log("Không có dữ liệu đánh giá hoặc dữ liệu không hợp lệ");
        }
        const lay = (layout.width * 0.7)/100;
        return(
            <View style={{ flex: 1, margin: 10 }}>
                <TouchableOpacity
                    onPressIn={() => setHoveredItem(item)}
                    onPressOut={() => setHoveredItem(null)}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: {
                        width: 2,
                        height: 4,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5, // Chỉ áp dụng cho Android
                        borderRadius: 30,
                        flex: 1,
                        width: layout.width * 0.8,
                        padding: 10,
                        backgroundColor: hoveredItem === item ? 'red' : '#9999ff',
                    }}
                    onPress={() => navigation.navigate("DetailWork", { screen: 'DetailTask', params: {item: item} })}
                >
                    <Text style={{ fontSize: 30, flex: 1, color: 'white', textAlign: 'center' }}>{item.Task_name}</Text>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        {item.members.map((memberData, index) => (
                            <View key={memberData.id}>
                                <Avatar.Image source={{ uri: memberData.PhotoURL }} />
                                <Text style={{ textAlign: 'center' }}>{memberData.Name}</Text>
                            </View>
                        ))}
                    </View>
                    {evalue != null ?
                        <View>
                            <Text style={{ paddingLeft: evalue * lay }}>{evalue} %</Text>
                            <ProgressBar progress={item.evals[0].status / 100} color={MD3Colors.error50} />
                        </View> : null}
                </TouchableOpacity>
            </View>

        )
    }
    const renderwork = ({ item }) => {
        const dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const memberCount = memberCounts[item.Project_ID] || 0; // Lấy số thành viên từ biến trạng thái hoặc mặc định là 0
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin:10,borderRadius:15,shadowColor: '#000',
                    shadowOffset: {
                    width: 2,
                    height: 4,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5 }}>
                <TouchableOpacity style={{ flex: 3,flexDirection:'row' }} onPress={() => navigation.navigate("DetailWork", { screen: 'Home', params: {work: item} })}>
                    <View style={{flex:3,justifyContent:'center',paddingLeft:10}}>
                        <Avatar.Image source={{ uri:"https://png.pngtree.com/png-clipart/20230504/original/pngtree-project-management-flat-icon-png-image_9137782.png"  }}/>
                    </View>
                    <View style={{flex:7}}>
                        <Text style={{fontSize:20,color:'blue'}}>{item.Project_name}</Text>
                        <Text><ICon color='blue' name="play" /> Start: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.Start_day.toDate())}</Text>
                        <Text><ICon color="red" name="flag-checkered" /> End: {Intl.DateTimeFormat('en-US', dateFormatOptions).format(item.End_day.toDate())}</Text>
                       <View style={{flexDirection:'row',alignItems:'center'}}>
                            <ICon name="people-group" size={20}/>
                            <Text style={{fontSize:20}}>:   {memberCount} </Text>
                            <ICon name="person" size={20}/>
                       </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
    const Join_PJ=async()=>{
        
        const bb = data.filter(dt=>dt.Project_ID==code);
        if(bb.length>0)
        {
            navigation.navigate("DetailWork", { work: bb[0] })
        }else{
            const Evalua = await firestore().collection('Member_PJ');
            await Evalua.add({
                Member_ID:user.uid,
                Project_ID:code,
                Role:1
            })
            setLoading(!loading);
            const bb = data.filter(dt=>dt.Project_ID==code);
            navigation.navigate("DetailWork", { work: bb[0] })
        }
    }     
    
    return (
        <Provider>
        <View style={{flex:1}}>
            <View style={{flex:1}}>
                    
                <View style={{flex:2}}>
                    <View style={{flexDirection:'row',margin:10}}>
                        <Text style={{flex:3,fontSize:30}}>Chào {user_main.Name} </Text>
                        <Button onPress={()=>fetchCopiedText()}>Join</Button>
                        {user_main.PhotoURL&&<Avatar.Image source={{ uri: user_main.PhotoURL }} />}
                    </View>
                    <Searchbar
                        style={{height:60,marginRight:10,marginLeft:10}}
                        placeholder="Type Here..."
                        onChangeText={handleSearch}
                        value={search}
                    />
                </View>
                <View  style={{flex:4}}>
                    <Text style={{fontSize:30,marginLeft:10}}>My Task</Text>
                    {task!=null?(
                    <FlatList
                    data={task}
                    renderItem={renderTask}
                    horizontal
                    keyExtractor={(item) => item.id}
                    />
                    ):(<Text style={{textAlign:'center'}}>Danh sách trống</Text>)}
                </View>
                
                <View style={{flex:3}}>
                    
                    <Text style={{fontSize:30,marginLeft:10}}>Lastest Project</Text>
                    {datasearch!=null?(
                        <FlatList
                            data={datasearch}
                            renderItem={renderwork}
                        />
                    ):(<Text style={{textAlign:'center'}}>Danh sách trống</Text>)}
                </View>
            </View>
            <View style={{position:"absolute",bottom:0,right:0}}>
                <IconButton
                    style={{backgroundColor:'#0000cc',borderRadius:10}}
                    icon="plus"
                    iconColor={MD3Colors.error50}
                    size={20}
                    onPress={()=>navigation.navigate("AddWork")}
                />
            </View>
        </View>
        <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Tham gia dự án</Dialog.Title>
            <TextInput style={{marginLeft:10,marginRight:10}} label="Nhập mã dự án" value={code} />
            <Dialog.Actions>
            <Button onPress={() => console.log('Cancel')}>Cancel</Button>
            <Button onPress={() =>Join_PJ() }>Ok</Button>
            </Dialog.Actions>
        </Dialog>
        </Portal>
        </Provider>
    );
};

export default Listmain;
