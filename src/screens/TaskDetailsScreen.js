// src/screens/TaskDetailsScreen.js
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {deleteTask, toggleTask, updateTask} from '../redux/slices/tasksSlice';
import colors from '../utils/colors';
import TaskBottomSheet from '../components/TaskBottomSheet';

export default function TaskDetailsScreen({route, navigation}) {
  const {taskId} = route.params;
  const task = useSelector(state =>
    state.tasks.items.find(t => t.id === taskId),
  );
  const dispatch = useDispatch();
  const [showSheet, setShowSheet] = useState(false);

  if (!task) return <Text style={{margin: 20}}>Task not found.</Text>;

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      {text: 'Cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteTask(task.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEdit = updatedTask => {
    dispatch(updateTask(updatedTask));
    setShowSheet(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.desc}>{task.description}</Text>
      <Text style={styles.label}>Due Date:</Text>
      <Text style={styles.value}>
        {new Date(task.dueDate).toLocaleString()}
      </Text>
      <Text style={styles.label}>Priority:</Text>
      <Text style={styles.value}>{task.priority}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>
        {task.completed ? 'Completed' : 'Incomplete'}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: colors.primary}]}
          onPress={() => setShowSheet(true)}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: colors.red}]}
          onPress={handleDelete}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: colors.green}]}
          onPress={() => dispatch(toggleTask(task.id))}>
          <Text style={styles.btnText}>
            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
      <TaskBottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={handleEdit}
        editingTask={task}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background, padding: 20},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  desc: {fontSize: 16, color: colors.text, marginBottom: 10},
  label: {fontWeight: 'bold', color: colors.gray, marginTop: 10},
  value: {color: colors.text, marginBottom: 5},
  row: {flexDirection: 'row', marginTop: 30, justifyContent: 'space-between'},
  btn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
