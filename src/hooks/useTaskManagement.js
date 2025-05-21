import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../redux/slices/tasksSlice';

export const useTaskManagement = () => {
  const dispatch = useDispatch();

  const handleAddTask = useCallback(
    task => {
      dispatch(
        addTask({
          ...task,
          id: Date.now(),
          completed: false,
          priority: task.priority || 'low',
        }),
      );
    },
    [dispatch],
  );

  const handleUpdateTask = useCallback(
    task => {
      dispatch(updateTask(task));
    },
    [dispatch],
  );

  const handleDeleteTask = useCallback(
    taskId => {
      dispatch(deleteTask(taskId));
    },
    [dispatch],
  );

  const handleToggleTask = useCallback(
    taskId => {
      dispatch(toggleTask(taskId));
    },
    [dispatch],
  );

  const handlePriorityChange = useCallback(
    (task, priority) => {
      dispatch(updateTask({...task, priority}));
    },
    [dispatch],
  );

  return {
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTask,
    handlePriorityChange,
  };
};
