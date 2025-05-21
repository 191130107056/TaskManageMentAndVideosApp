import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import TaskCard from '../components/TaskCard';
import colors from '../utils/colors';
import {
  setFilter,
  setSort,
  addTask,
  updateTask,
} from '../redux/slices/tasksSlice';
import FAB from '../components/FAB';
import TaskBottomSheet from '../components/TaskBottomSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const DATE_WIDTH = WINDOW_WIDTH / 5; // Show 5 dates at a time
const DATE_CIRCLE_SIZE = 38;

function toDateString(date) {
  // Returns 'YYYY-MM-DD'
  return date.toISOString().split('T')[0];
}

// Get dates for a month instead of just a week
function getMonthDates(selectedDate) {
  const dates = [];
  const currentDate = new Date(selectedDate);
  currentDate.setDate(1); // Start from first day of month

  // Previous month dates
  const prevMonthDates = [];
  const firstDay = currentDate.getDay();
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i - 1);
    prevMonthDates.push(date);
  }

  // Current month dates
  const currentMonth = currentDate.getMonth();
  while (currentDate.getMonth() === currentMonth) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Next month dates
  const remainingDays = 7 - ((dates.length + prevMonthDates.length) % 7);
  for (let i = 0; i < remainingDays; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    dates.push(date);
  }

  return [...prevMonthDates, ...dates];
}

function toLocalDateString(date) {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

export default function DashboardScreen() {
  const {items, loading, filter, sort} = useSelector(state => state.tasks);
  const dispatch = useDispatch();
  const [showSheet, setShowSheet] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();

  const monthDates = useMemo(() => getMonthDates(selectedDate), [selectedDate]);

  useEffect(() => {
    // Only run on mount
    const today = new Date();
    setSelectedDate(today);

    // Find today's index in monthDates
    const todayIndex = getMonthDates(today).findIndex(
      d => d.toDateString() === today.toDateString(),
    );
    if (scrollViewRef.current && todayIndex > 1) {
      scrollViewRef.current.scrollTo({
        x: (todayIndex - 2) * 48,
        animated: false,
      });
    }
  }, []); // Only run once on mount!

  const filteredTasks = useMemo(() => {
    return items.filter(task => {
      if (!task || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const selectedDateStr = selectedDate.toDateString();
      const taskDateStr = taskDate.toDateString();
      return (
        taskDateStr === selectedDateStr &&
        (filter === 'all' ||
          (filter === 'completed' ? task.completed : !task.completed))
      );
    });
  }, [items, selectedDate, filter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sort === 'date') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sort === 'priority') {
        const priorityOrder = {high: 3, medium: 2, low: 1};
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }, [filteredTasks, sort]);

  console.log('sortedTasks', sortedTasks);
  console.log('filteredTasks', filteredTasks);
  console.log('monthDates', monthDates);
  console.log('selectedDate', selectedDate);
  console.log('filter', filter);
  console.log('sort', sort);
  console.log('editingTask', editingTask);
  console.log('showSheet', showSheet);
  console.log('items', items);

  const handleAdd = () => {
    setEditingTask(null);
    setShowSheet(true);
  };

  const handleEdit = task => {
    setEditingTask(task);
    setShowSheet(true);
  };

  const handleSubmit = task => {
    if (task.id) {
      dispatch(updateTask(task));
    } else {
      dispatch(
        addTask({
          ...task,
          id: Date.now(),
          completed: false,
          priority: task.priority || 'low',
        }),
      );
    }
    setShowSheet(false);
  };

  const renderDate = (date, index) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

    return (
      <TouchableOpacity
        key={index}
        style={styles.dateItem}
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.dayLabel,
            !isCurrentMonth && styles.otherMonthText,
            isSelected && styles.selectedDayLabel,
          ]}>
          {date.toLocaleDateString(undefined, {weekday: 'short'})}
        </Text>
        <View
          style={[
            styles.dateCircle,
            isSelected && styles.selectedDateCircle,
            !isCurrentMonth && styles.otherMonthCircle,
          ]}>
          <Text
            style={[
              styles.dateText,
              isSelected && styles.selectedDateText,
              !isCurrentMonth && styles.otherMonthText,
            ]}>
            {date.getDate()}
          </Text>
        </View>
        {/* Today dot */}
        <View style={styles.dotContainer}>
          {isToday && (
            <View
              style={[styles.todayDot, isSelected && styles.todayDotSelected]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.headerCalendar}>
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleString(undefined, {month: 'short'})}{' '}
          </Text>
          <Text style={styles.yearText}>{selectedDate.getFullYear()}</Text>
        </View>
        <Text style={styles.longDateText}>
          {selectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
      {/* Calendar Strip */}
      <View style={styles.calendarContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarStrip}>
          {monthDates.map((date, index) => renderDate(date, index))}
        </ScrollView>
      </View>
      {/* Header, Filter, Sort */}
      <View style={styles.headerControls}>
        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all' && styles.activeFilterTab,
            ]}
            onPress={() => dispatch(setFilter('all'))}>
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'completed' && styles.activeFilterTab,
            ]}
            onPress={() => dispatch(setFilter('completed'))}>
            <Text
              style={[
                styles.filterText,
                filter === 'completed' && styles.activeFilterText,
              ]}>
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'incomplete' && styles.activeFilterTab,
            ]}
            onPress={() => dispatch(setFilter('incomplete'))}>
            <Text
              style={[
                styles.filterText,
                filter === 'incomplete' && styles.activeFilterText,
              ]}>
              Incomplete
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sorts}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sort === 'date' && styles.activeSortButton,
            ]}
            onPress={() => dispatch(setSort('date'))}>
            <Icon
              name="calendar"
              size={16}
              color={sort === 'date' ? '#fff' : colors.gray}
            />
            <Text
              style={[
                styles.sortText,
                sort === 'date' && styles.activeSortText,
              ]}>
              By Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sort === 'priority' && styles.activeSortButton,
            ]}
            onPress={() => dispatch(setSort('priority'))}>
            <Icon
              name="flag"
              size={16}
              color={sort === 'priority' ? '#fff' : colors.gray}
            />
            <Text
              style={[
                styles.sortText,
                sort === 'priority' && styles.activeSortText,
              ]}>
              By Priority
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={item => item.id.toString()}
          renderItem={({item, index}) => (
            <TaskCard
              task={item}
              onPress={() =>
                navigation.navigate('TaskDetailsScreen', {taskId: item.id})
              }
              isLast={index === sortedTasks.length - 1}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="document-text-outline"
                size={48}
                color={colors.gray}
              />
              <Text style={styles.empty}>No Tasks Found</Text>
              <Text style={styles.emptySubtext}>Tap + to add a new task</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB and BottomSheet */}
      <FAB onPress={handleAdd} />
      <TaskBottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={handleSubmit}
        editingTask={editingTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  calendarContainer: {
    // backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    // elevation: 2,
    marginTop: 10,
    paddingVertical: 0,
    paddingBottom: 4,
  },
  calendarStrip: {
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    height: 70,
  },
  dateItem: {
    width: 48,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
    fontWeight: '500',
  },
  selectedDayLabel: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  dateCircle: {
    width: DATE_CIRCLE_SIZE,
    height: DATE_CIRCLE_SIZE,
    borderRadius: DATE_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedDateCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  otherMonthText: {
    color: colors.gray + '80',
  },
  otherMonthCircle: {
    backgroundColor: '#f5f5f5',
    borderColor: '#f5f5f5',
  },
  dotContainer: {
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
    opacity: 0.7,
  },
  todayDotSelected: {
    backgroundColor: '#fff',
    opacity: 1,
  },
  headerCalendar: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  monthText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  yearText: {
    fontSize: 32,
    color: colors.text,
    opacity: 0.7,
  },
  longDateText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  headerControls: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filters: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: colors.gray,
  },
  activeFilterText: {
    color: colors.primary,
    fontWeight: '600',
  },
  sorts: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeSortButton: {
    backgroundColor: colors.primary,
  },
  sortText: {
    fontSize: 14,
    color: colors.gray,
  },
  activeSortText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  empty: {
    color: colors.gray,
    fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.gray,
    fontSize: 14,
  },
});
