import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthenticatedUserContext } from '../providers';
import ICon from 'react-native-vector-icons/FontAwesome6';
const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDateTimePickers, setShowDateTimePickers] = useState({});
  const { user } = useContext(AuthenticatedUserContext);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách công việc từ Firestore
  const fetchTasksFromFirestore = async () => {
    try {
      const userId = user.uid;
      const taskSnapshot = await firestore().collection('Task').where('Member_ID', 'array-contains', userId).get();
      const tasksData = taskSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().Task_name,
        startDay: doc.data().Start_day.toDate(),
        endDay: doc.data().End_day.toDate(),
        selectedTime: doc.data().TimeMake ? doc.data().TimeMake.toDate() : null, // Lấy thời gian từ cột TimeMake
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasksFromFirestore();
}, [user]);
  // Hàm lưu thời gian vào CSDL
  const saveTimeToFirestore = async (taskId, selectedTime) => {
    try {
      await firestore().collection('Task').doc(taskId).update({
        Selected_time: selectedTime,
      });
    } catch (error) {
      console.error('Error saving time to Firestore: ', error);
    }
  };

  const handleDateTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      const updatedShowDateTimePickers = { ...showDateTimePickers };
      updatedShowDateTimePickers[selectedTask.id] = false;
      setShowDateTimePickers(updatedShowDateTimePickers);
      return;
    }

    const updatedShowDateTimePickers = { ...showDateTimePickers };
    updatedShowDateTimePickers[selectedTask.id] = false;
    setShowDateTimePickers(updatedShowDateTimePickers);

    if (selectedDate !== undefined) {
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          saveTimeToFirestore(task.id, selectedDate); // Lưu thời gian vào CSDL
          return {
            ...task,
            selectedTime: selectedDate
          };
        }
        return task;
      });
      setTasks(updatedTasks);
    }
  };

  const renderTaskItem = ({ item }) => {
    const isDateTimeSelected = selectedDate && item.selectedTime;
    
    return (
      <View>
        <View style={styles.taskItem}>
          {isDateTimeSelected ? (
            <>
              {showDateTimePickers[item.id] && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="clock"
                  onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate)}
                />
              )}
              <TouchableOpacity onPress={() => handleDateTimePickerOpen(item)} style={styles.timeButton}>
                {!item.selectedTime ? (
                  <Text style={styles.timeButtonText}>Set Time</Text>
                ) : (
                  <Text>{item.selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}
          <TouchableOpacity onPress={() => handleTaskPress(item)} style={styles.taskTouchable}>
            <View style={styles.infoContainer}>
            <ICon name="clock" size={25}/>
              <View style={styles.infoRow}>
                
                <Text style={styles.infoText}>{item.name}</Text>
                <Text style={styles.versionText}>{item.startDay.toLocaleDateString()}-{item.endDay.toLocaleDateString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 5 }} />
      
      </View>
    );
  };
  

  const handleDateTimePickerOpen = (item) => {
    setSelectedTask(item);
    const updatedShowDateTimePickers = { ...showDateTimePickers };
    updatedShowDateTimePickers[item.id] = true;
    setShowDateTimePickers(updatedShowDateTimePickers);
  };

  const searchTasks = () => {
    return tasks.filter(task => {
      return task.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const filteredTasks = selectedDate ? searchTasks().filter(task => {
    const selectedDay = new Date(selectedDate).setHours(0, 0, 0, 0);
    const startDay = task.startDay.setHours(0, 0, 0, 0);
    const endDay = task.endDay.setHours(23, 59, 59, 999);
    return (selectedDay >= startDay && selectedDay <= endDay);
  }) : searchTasks();
  
  // Hàm lấy danh sách các ngày trong một khoảng từ ngày bắt đầu đến ngày kết thúc
  const getDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const convertDateFormat = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
  };
  
  // Sử dụng hàm này để chuyển đổi ngày bắt đầu và kết thúc của mỗi công việc
  const tasksWithFormattedDates = tasks.map(task => ({
    ...task,
    startDayFormatted: convertDateFormat(task.startDay),
    endDayFormatted: convertDateFormat(task.endDay)
  }));
  
  return (
    <View>
      <Calendar
        markedDates={{
          ...tasksWithFormattedDates.reduce((markedDates, task) => {
            const dateRange = getDateRange(task.startDayFormatted, task.endDayFormatted);
            dateRange.forEach(date => {
              markedDates[date] = { selected: true, marked: true, dotColor: 'yellow' };
            });
            return markedDates;
          }, {}),
          [selectedDate]: { selected: true, marked: true, dotColor: 'red' }
        }}
        markingType={"simple"}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />
      
      <Text style={styles.headerText}>List Task</Text>
     
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    height: 50,
    width: 250,
    borderRadius: 10,
    overflow: 'scroll',
    flexDirection:'row',
    alignItems:'center'
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 20,
  },
  timeButton: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    height:50,
    justifyContent:'center',
    alignItems:'center'
  },
  timeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskList: {
    flexDirection: 'column',
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
 
});

export default TaskList;