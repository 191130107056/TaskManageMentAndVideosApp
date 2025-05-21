import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {storeData, getData} from '../../utils/storage';

const TASKS_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=20';
const STORAGE_KEY = 'tasks';

const todayISO = new Date().toISOString();
const defaultColor = '#FFF9C4'; // light yellow

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  try {
    // First try to get tasks from storage
    const storedTasks = await getData(STORAGE_KEY);
    if (storedTasks) {
      return storedTasks;
    }

    // If no stored tasks, fetch from API
    const response = await axios.get(TASKS_URL);
    const tasks = response.data.map(task => ({
      ...task,
      description: 'No description',
      color: '#FFF9C4',
      priority: 'low',
      dueDate: new Date().toISOString(),
    }));

    // Store the fetched tasks
    await storeData(STORAGE_KEY, tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filter: 'all', // all, completed, incomplete
    sort: 'date', // date, priority
  },
  reducers: {
    addTask: (state, action) => {
      const task = {
        ...action.payload,
        dueDate: action.payload.dueDate || new Date().toISOString(),
      };
      state.items.unshift(task);
      storeData(STORAGE_KEY, state.items);
    },
    updateTask: (state, action) => {
      const index = state.items.findIndex(
        task => task.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
        storeData(STORAGE_KEY, state.items);
      }
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter(task => task.id !== action.payload);
      storeData(STORAGE_KEY, state.items);
    },
    toggleTask: (state, action) => {
      const task = state.items.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        storeData(STORAGE_KEY, state.items);
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {setFilter, setSort, addTask, updateTask, deleteTask, toggleTask} =
  tasksSlice.actions;

export default tasksSlice.reducer;
