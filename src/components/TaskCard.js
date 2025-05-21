// src/components/TaskCard.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import {toggleTask, updateTask} from '../redux/slices/tasksSlice';
import colors from '../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {PRIORITY_COLORS, STATUS_COLORS, DEFAULT_CARD_COLOR} from '../constants';

const TaskCard = React.memo(({task, onPress, isLast}) => {
  const dispatch = useDispatch();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    dispatch(toggleTask(task.id));
  };

  const handlePriorityChange = priority => {
    dispatch(updateTask({...task, priority}));
  };

  const handleStatusToggle = () => {
    dispatch(
      updateTask({
        ...task,
        completed: !task.completed,
      }),
    );
  };

  const priorityColor = PRIORITY_COLORS[task.priority || 'low'];
  const statusColor = task.completed
    ? STATUS_COLORS.completed
    : STATUS_COLORS.incomplete;
  const cardColor = task.color || DEFAULT_CARD_COLOR;

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, {backgroundColor: statusColor}]} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.card, {backgroundColor: cardColor}]}>
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.7}>
          <TouchableOpacity onPress={handleStatusToggle} activeOpacity={0.7}>
            <Text
              style={[styles.title, task.completed && styles.completedText]}>
              {task.title}
            </Text>
          </TouchableOpacity>
          {/* {task.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null} */}
          <View style={styles.meta}>
            <View style={styles.timeContainer}>
              <Icon name="time-outline" size={14} color={colors.gray} />
              <Text style={styles.time}>
                {new Date(task.dueDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.priorityContainer}
              onPress={() => {
                const priorities = ['low', 'medium', 'high'];
                const currentIndex = priorities.indexOf(task.priority || 'low');
                const nextIndex = (currentIndex + 1) % priorities.length;
                handlePriorityChange(priorities[nextIndex]);
              }}>
              <Icon name="flag" size={14} color={priorityColor} />
              <Text style={[styles.priorityText, {color: priorityColor}]}>
                {(task.priority || 'low').charAt(0).toUpperCase() +
                  (task.priority || 'low').slice(1)}
              </Text>
            </TouchableOpacity>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.gray}
              style={styles.trailingIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    completed: PropTypes.bool,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    color: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isLast: PropTypes.bool,
};

TaskCard.defaultProps = {
  isLast: false,
};

export default TaskCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 20,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 22,
  },
  line: {
    position: 'absolute',
    top: 34,
    left: 9,
    width: 2,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.text,
  },
  desc: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: colors.gray,
  },
  trailingIcon: {
    marginLeft: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
  },
});
