import React, {useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

const COLOR_OPTIONS = [
  colors.yellow,
  colors.pink,
  colors.blue,
  colors.lightGreen,
  colors.purple,
];

export default function TaskBottomSheet({
  visible,
  onClose,
  onSubmit,
  editingTask,
}) {
  const [title, setTitle] = React.useState(editingTask?.title || '');
  const [date, setDate] = React.useState(
    editingTask?.dueDate ? new Date(editingTask.dueDate) : new Date(),
  );
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);
  const [color, setColor] = React.useState(
    editingTask?.color || COLOR_OPTIONS[0],
  );
  const [description, setDescription] = React.useState(
    editingTask?.description || '',
  );
  const [errors, setErrors] = React.useState({});
  const [priority, setPriority] = React.useState(
    editingTask?.priority || 'low',
  );

  const translateY = React.useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDate(editingTask.dueDate ? new Date(editingTask.dueDate) : new Date());
      setColor(editingTask.color || COLOR_OPTIONS[0]);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'low');
    } else {
      setTitle('');
      setDate(new Date());
      setColor(COLOR_OPTIONS[0]);
      setDescription('');
      setPriority('low');
    }
  }, [editingTask]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!date) {
      newErrors.date = 'Due date is required';
    } else if (date < new Date()) {
      newErrors.date = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSubmit({
        ...editingTask,
        title,
        dueDate: date.toISOString(),
        color,
        description,
        priority: priority || 'low',
      });
      Keyboard.dismiss();
      if (!editingTask) {
        setTitle('');
        setDate(new Date());
        setColor(COLOR_OPTIONS[0]);
        setDescription('');
        setPriority('low');
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{translateY}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingTask ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter task title"
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  setErrors({...errors, title: ''});
                }}
                autoFocus
                placeholderTextColor={colors.gray}
              />
              {errors.title ? (
                <Text style={styles.errorText}>{errors.title}</Text>
              ) : null}
            </View>

            {/* Task Date and Task Color in a single row */}
            <View style={styles.rowGroupDateColor}>
              {/* Task Date group */}
              <View style={styles.flex1}>
                <Text style={styles.label}>Task Date</Text>
                <View style={styles.rowGroupNoMargin}>
                  <TouchableOpacity
                    style={[
                      styles.dateTimeButton,
                      errors.date && styles.inputError,
                    ]}
                    onPress={() => {
                      setShowDate(true);
                      setErrors({...errors, date: ''});
                    }}>
                    <Text style={styles.dateTimeText} numberOfLines={1}>
                      {date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTime(true)}>
                    <Text style={styles.dateTimeText} numberOfLines={1}>
                      {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.date ? (
                  <Text style={styles.errorText}>{errors.date}</Text>
                ) : null}
              </View>
              {/* Task Color group */}
              <View style={styles.flex1Color}>
                <Text style={styles.label}>Task Color</Text>
                <View style={styles.colorRowInlineCompact}>
                  {COLOR_OPTIONS.map((c, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.colorCircle,
                        {backgroundColor: c},
                        color === c && styles.selectedColor,
                      ]}
                      onPress={() => setColor(c)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'low' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority('low')}>
                  <Text
                    style={[
                      styles.priorityText,
                      priority === 'low' && styles.priorityTextActive,
                    ]}>
                    Low
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'medium' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority('medium')}>
                  <Text
                    style={[
                      styles.priorityText,
                      priority === 'medium' && styles.priorityTextActive,
                    ]}>
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'high' && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority('high')}>
                  <Text
                    style={[
                      styles.priorityText,
                      priority === 'high' && styles.priorityTextActive,
                    ]}>
                    High
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, {height: 60}]}
                placeholder="Enter description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                placeholderTextColor={colors.gray}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, {backgroundColor: color}]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingTask ? 'Update Task' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                setShowDate(false);
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(date.getHours(), date.getMinutes());
                  setDate(newDate);
                }
              }}
            />
          )}

          {showTime && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedTime) => {
                setShowTime(false);
                if (selectedTime) {
                  const newDate = new Date(date);
                  newDate.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                  );
                  setDate(newDate);
                }
              }}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SHEET_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: colors.text,
  },
  rowGroupDateColor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  rowGroupNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 0,
  },
  flex1: {
    flex: 1.5,
  },
  flex1Color: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginRight: 0,
  },
  dateTimeText: {
    color: colors.text,
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'center',
  },
  colorRowInlineCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 8,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 1,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.red,
    fontSize: 10,
    marginTop: 4,
  },
  inputError: {
    borderColor: colors.red,
    borderWidth: 1,
  },
  formGroup: {
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
  },
  priorityText: {
    fontSize: 12,
    color: colors.gray,
  },
  priorityTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
