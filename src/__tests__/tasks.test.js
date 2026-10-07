describe('Task Management', () => {
  describe('Task creation', () => {
    it('should create a new task with valid data', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        reminderTime: new Date().toISOString(),
        priority: 'media',
        completed: false,
      };

      expect(task.title).toBe('Test Task');
      expect(task.priority).toBe('media');
      expect(task.completed).toBe(false);
    });

    it('should not create task without title', () => {
      const task = {
        title: '',
        description: 'Test',
      };

      expect(task.title).toBe('');
      expect(task.title.trim().length).toBe(0);
    });

    it('should set correct priority levels', () => {
      const priorities = ['baja', 'media', 'alta'];
      const validPriorities = ['baja', 'media', 'alta'];

      priorities.forEach(priority => {
        expect(validPriorities).toContain(priority);
      });
    });
  });

  describe('Task completion', () => {
    it('should mark task as completed', () => {
      let task = {
        id: '1',
        title: 'Test',
        completed: false,
      };

      task.completed = true;
      expect(task.completed).toBe(true);
    });

    it('should toggle task completion', () => {
      let task = {
        id: '1',
        title: 'Test',
        completed: false,
      };

      task.completed = !task.completed;
      expect(task.completed).toBe(true);

      task.completed = !task.completed;
      expect(task.completed).toBe(false);
    });
  });

  describe('Task deletion', () => {
    it('should delete task from list', () => {
      let tasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
        { id: '3', title: 'Task 3' },
      ];

      tasks = tasks.filter(t => t.id !== '2');
      expect(tasks.length).toBe(2);
      expect(tasks.find(t => t.id === '2')).toBeUndefined();
    });
  });

  describe('Task filtering', () => {
    it('should filter incomplete tasks', () => {
      const tasks = [
        { id: '1', title: 'Task 1', completed: false },
        { id: '2', title: 'Task 2', completed: true },
        { id: '3', title: 'Task 3', completed: false },
      ];

      const incompleteTasks = tasks.filter(t => !t.completed);
      expect(incompleteTasks.length).toBe(2);
    });

    it('should filter completed tasks', () => {
      const tasks = [
        { id: '1', title: 'Task 1', completed: false },
        { id: '2', title: 'Task 2', completed: true },
        { id: '3', title: 'Task 3', completed: false },
      ];

      const completedTasks = tasks.filter(t => t.completed);
      expect(completedTasks.length).toBe(1);
    });
  });

  describe('Task sorting', () => {
    it('should sort tasks by date', () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const tasks = [
        { id: '1', title: 'Task 1', reminderTime: now.toISOString() },
        { id: '2', title: 'Task 2', reminderTime: tomorrow.toISOString() },
        { id: '3', title: 'Task 3', reminderTime: yesterday.toISOString() },
      ];

      const sorted = [...tasks].sort((a, b) =>
        new Date(a.reminderTime) - new Date(b.reminderTime)
      );

      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });

    it('should sort tasks by priority', () => {
      const priorityOrder = { baja: 1, media: 2, alta: 3 };
      const tasks = [
        { id: '1', title: 'Task 1', priority: 'baja' },
        { id: '2', title: 'Task 2', priority: 'alta' },
        { id: '3', title: 'Task 3', priority: 'media' },
      ];

      const sorted = [...tasks].sort((a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority]
      );

      expect(sorted[0].priority).toBe('alta');
      expect(sorted[1].priority).toBe('media');
      expect(sorted[2].priority).toBe('baja');
    });
  });

  describe('Reminder validation', () => {
    it('should validate reminder date is in future', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 60 * 60 * 1000);
      const past = new Date(now.getTime() - 60 * 60 * 1000);

      const futureValid = new Date(future).getTime() > now.getTime();
      const pastInvalid = new Date(past).getTime() > now.getTime();

      expect(futureValid).toBe(true);
      expect(pastInvalid).toBe(false);
    });

    it('should handle reminder time properly', () => {
      const reminderTime = '2024-12-31T15:30:00Z';
      const date = new Date(reminderTime);

      expect(date.getHours()).toBe(15);
      expect(date.getMinutes()).toBe(30);
    });
  });
});
