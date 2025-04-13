/**
 * Task Manager
 * Handles task data persistence, filtering, and advanced task management features
 */

class TaskManager {
  constructor() {
    // Initialize tasks from localStorage or use default empty structure
    this.tasks = this.loadTasks() || {};
    this.taskHistory = this.loadTaskHistory() || [];
    this.lastTaskId = this.getLastTaskId() || 104; // Default starting ID if no tasks exist
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners for task changes
   */
  initEventListeners() {
    // Listen for task changes (custom event)
    document.addEventListener('taskChanged', (e) => {
      this.saveTaskHistory({
        taskId: e.detail.taskId,
        action: e.detail.action,
        fromColumn: e.detail.fromColumn,
        toColumn: e.detail.toColumn,
        timestamp: new Date().toISOString(),
        user: 'Current User' // In a multi-user system, this would be the actual user
      });
    });
  }
  
  /**
   * Load tasks from localStorage
   * @returns {Object} Tasks object with columns as keys and arrays of tasks as values
   */
  loadTasks() {
    const tasksJson = localStorage.getItem('taskboard-tasks');
    return tasksJson ? JSON.parse(tasksJson) : null;
  }
  
  /**
   * Save tasks to localStorage
   */
  saveTasks() {
    localStorage.setItem('taskboard-tasks', JSON.stringify(this.tasks));
  }
  
  /**
   * Load task history from localStorage
   * @returns {Array} Array of task history entries
   */
  loadTaskHistory() {
    const historyJson = localStorage.getItem('taskboard-history');
    return historyJson ? JSON.parse(historyJson) : null;
  }
  
  /**
   * Save task history entry
   * @param {Object} historyEntry - The history entry to save
   */
  saveTaskHistory(historyEntry) {
    this.taskHistory.push(historyEntry);
    localStorage.setItem('taskboard-history', JSON.stringify(this.taskHistory));
  }
  
  /**
   * Get the last used task ID to ensure new tasks have unique IDs
   * @returns {number} The last task ID number
   */
  getLastTaskId() {
    let maxId = 0;
    
    // Check all columns for the highest task ID
    Object.values(this.tasks).forEach(columnTasks => {
      columnTasks.forEach(task => {
        const idMatch = task.id.match(/TASK-(\d+)/);
        if (idMatch) {
          const idNum = parseInt(idMatch[1], 10);
          if (idNum > maxId) {
            maxId = idNum;
          }
        }
      });
    });
    
    return maxId;
  }
  
  /**
   * Generate a new unique task ID
   * @returns {string} New task ID in format "TASK-XXX"
   */
  generateTaskId() {
    this.lastTaskId++;
    return `TASK-${this.lastTaskId}`;
  }
  
  /**
   * Add a new task
   * @param {Object} taskData - Task data
   * @returns {string} The ID of the created task
   */
  addTask(taskData) {
    const columnId = taskData.column;
    
    // Initialize column array if it doesn't exist
    if (!this.tasks[columnId]) {
      this.tasks[columnId] = [];
    }
    
    // Generate ID if not provided
    if (!taskData.id) {
      taskData.id = this.generateTaskId();
    }
    
    // Add creation date
    taskData.createdAt = new Date().toISOString();
    
    // Add task to column
    this.tasks[columnId].push(taskData);
    
    // Save to localStorage
    this.saveTasks();
    
    // Record in history
    this.saveTaskHistory({
      taskId: taskData.id,
      action: 'created',
      toColumn: columnId,
      timestamp: new Date().toISOString(),
      user: 'Current User'
    });
    
    return taskData.id;
  }
  
  /**
   * Update an existing task
   * @param {string} taskId - ID of the task to update
   * @param {Object} taskData - New task data
   * @returns {boolean} True if task was updated successfully
   */
  updateTask(taskId, taskData) {
    let found = false;
    let fromColumn = null;
    
    // Find and update the task
    Object.keys(this.tasks).forEach(columnId => {
      const columnTasks = this.tasks[columnId];
      const taskIndex = columnTasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        fromColumn = columnId;
        
        // If column is changing, remove from current column
        if (taskData.column && taskData.column !== columnId) {
          // Remove from current column
          const task = columnTasks.splice(taskIndex, 1)[0];
          
          // Update task data
          Object.assign(task, taskData);
          
          // Add to new column
          if (!this.tasks[taskData.column]) {
            this.tasks[taskData.column] = [];
          }
          this.tasks[taskData.column].push(task);
          
          // Record column change in history
          this.saveTaskHistory({
            taskId: taskId,
            action: 'moved',
            fromColumn: columnId,
            toColumn: taskData.column,
            timestamp: new Date().toISOString(),
            user: 'Current User'
          });
        } else {
          // Just update the task data in the same column
          Object.assign(columnTasks[taskIndex], taskData);
          
          // Record update in history
          this.saveTaskHistory({
            taskId: taskId,
            action: 'updated',
            fromColumn: columnId,
            toColumn: columnId,
            timestamp: new Date().toISOString(),
            user: 'Current User'
          });
        }
        
        found = true;
      }
    });
    
    // Save changes
    if (found) {
      this.saveTasks();
    }
    
    return found;
  }
  
  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {boolean} True if task was deleted successfully
   */
  deleteTask(taskId) {
    let found = false;
    let fromColumn = null;
    
    // Find and delete the task
    Object.keys(this.tasks).forEach(columnId => {
      const columnTasks = this.tasks[columnId];
      const taskIndex = columnTasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        fromColumn = columnId;
        columnTasks.splice(taskIndex, 1);
        found = true;
        
        // Record deletion in history
        this.saveTaskHistory({
          taskId: taskId,
          action: 'deleted',
          fromColumn: columnId,
          timestamp: new Date().toISOString(),
          user: 'Current User'
        });
      }
    });
    
    // Save changes
    if (found) {
      this.saveTasks();
    }
    
    return found;
  }
  
  /**
   * Move a task to a different column
   * @param {string} taskId - ID of the task to move
   * @param {string} targetColumnId - ID of the target column
   * @returns {boolean} True if task was moved successfully
   */
  moveTask(taskId, targetColumnId) {
    let found = false;
    let fromColumn = null;
    let taskData = null;
    
    // Find the task
    Object.keys(this.tasks).forEach(columnId => {
      const columnTasks = this.tasks[columnId];
      const taskIndex = columnTasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        fromColumn = columnId;
        
        // Skip if already in target column
        if (columnId === targetColumnId) {
          found = true;
          return;
        }
        
        // Remove from current column
        taskData = columnTasks.splice(taskIndex, 1)[0];
        found = true;
      }
    });
    
    // Add to target column if found
    if (found && taskData) {
      // Create target column if it doesn't exist
      if (!this.tasks[targetColumnId]) {
        this.tasks[targetColumnId] = [];
      }
      
      // Add to target column
      this.tasks[targetColumnId].push(taskData);
      
      // Save changes
      this.saveTasks();
      
      // Record move in history
      this.saveTaskHistory({
        taskId: taskId,
        action: 'moved',
        fromColumn: fromColumn,
        toColumn: targetColumnId,
        timestamp: new Date().toISOString(),
        user: 'Current User'
      });
    }
    
    return found;
  }
  
  /**
   * Get all tasks
   * @returns {Object} All tasks organized by column
   */
  getAllTasks() {
    return this.tasks;
  }
  
  /**
   * Get tasks in a specific column
   * @param {string} columnId - ID of the column
   * @returns {Array} Array of tasks in the column
   */
  getColumnTasks(columnId) {
    return this.tasks[columnId] || [];
  }
  
  /**
   * Get a specific task by ID
   * @param {string} taskId - ID of the task
   * @returns {Object|null} Task object or null if not found
   */
  getTaskById(taskId) {
    let foundTask = null;
    
    Object.values(this.tasks).forEach(columnTasks => {
      const task = columnTasks.find(task => task.id === taskId);
      if (task) {
        foundTask = task;
      }
    });
    
    return foundTask;
  }
  
  /**
   * Filter tasks by various criteria
   * @param {Object} filters - Filter criteria
   * @returns {Object} Filtered tasks organized by column
   */
  filterTasks(filters) {
    const filteredTasks = {};
    
    Object.keys(this.tasks).forEach(columnId => {
      filteredTasks[columnId] = this.tasks[columnId].filter(task => {
        // Filter by text (title or description)
        if (filters.text && !(
          task.title.toLowerCase().includes(filters.text.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.text.toLowerCase())
        )) {
          return false;
        }
        
        // Filter by tag
        if (filters.tag && task.tag !== filters.tag) {
          return false;
        }
        
        // Filter by priority
        if (filters.priority && task.priority !== filters.priority) {
          return false;
        }
        
        // Filter by due date (if implemented)
        if (filters.dueDate && task.dueDate) {
          const taskDueDate = new Date(task.dueDate);
          const filterDueDate = new Date(filters.dueDate);
          
          if (taskDueDate > filterDueDate) {
            return false;
          }
        }
        
        return true;
      });
    });
    
    return filteredTasks;
  }
  
  /**
   * Get task history
   * @param {string} [taskId] - Optional task ID to filter history
   * @returns {Array} Array of history entries
   */
  getTaskHistory(taskId) {
    if (taskId) {
      return this.taskHistory.filter(entry => entry.taskId === taskId);
    }
    return this.taskHistory;
  }
  
  /**
   * Export tasks to JSON string
   * @returns {string} JSON string of all tasks
   */
  exportTasks() {
    return JSON.stringify({
      tasks: this.tasks,
      history: this.taskHistory
    });
  }
  
  /**
   * Import tasks from JSON string
   * @param {string} jsonData - JSON string of tasks to import
   * @returns {boolean} True if import was successful
   */
  importTasks(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.tasks) {
        this.tasks = data.tasks;
        this.lastTaskId = this.getLastTaskId();
        
        if (data.history) {
          this.taskHistory = data.history;
        }
        
        this.saveTasks();
        localStorage.setItem('taskboard-history', JSON.stringify(this.taskHistory));
        
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Error importing tasks:', e);
      return false;
    }
  }
  
  /**
   * Initialize the board with the current tasks
   * Creates DOM elements for all tasks
   */
  initializeBoard() {
    // Clear existing tasks from DOM
    document.querySelectorAll('.column .card').forEach(card => card.remove());
    
    // Add tasks from storage to DOM
    Object.keys(this.tasks).forEach(columnId => {
      const column = document.getElementById(columnId);
      if (column) {
        this.tasks[columnId].forEach(taskData => {
          this.createTaskElement(taskData, column);
        });
      }
    });
    
    // Update task counts
    this.updateTaskCounts();
  }
  
  /**
   * Create a DOM element for a task
   * @param {Object} taskData - Task data
   * @param {HTMLElement} column - Column element to append to
   * @returns {HTMLElement} Created task element
   */
  createTaskElement(taskData, column) {
    // Create new card element
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.dataset.id = taskData.id;
    
    // Create card menu
    const cardMenu = document.createElement('div');
    cardMenu.className = 'card-menu';
    cardMenu.innerHTML = `
      <button class="card-menu-button">
        <i class="fas fa-ellipsis-v"></i>
      </button>
      <div class="card-menu-dropdown">
        <div class="card-menu-item delete">
          <i class="fas fa-trash-alt"></i>
          Remove Task
        </div>
      </div>
    `;
    
    // Create card content
    card.innerHTML = `
      <div class="card-id">${taskData.id}</div>
      <div class="card-title">${taskData.title}</div>
      <div class="card-description">${taskData.description}</div>
      <div class="card-tags">
        <span class="tag ${taskData.tag}">${this.capitalizeFirstLetter(taskData.tag)}</span>
      </div>
      <div class="card-footer">
        <div>
          <span class="card-priority priority-${taskData.priority}"></span>
          ${this.capitalizeFirstLetter(taskData.priority)}
        </div>
        <div>${taskData.estimate}</div>
      </div>
    `;
    
    // Add card menu to card
    card.appendChild(cardMenu);
    
    // Add due date indicator if present
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dueDateClass = 'due-date';
      if (diffDays < 0) {
        dueDateClass += ' overdue';
      } else if (diffDays <= 2) {
        dueDateClass += ' due-soon';
      }
      
      const dueDateElement = document.createElement('div');
      dueDateElement.className = dueDateClass;
      dueDateElement.innerHTML = `
        <i class="fas fa-calendar-alt"></i>
        ${dueDate.toLocaleDateString()}
      `;
      
      card.appendChild(dueDateElement);
    }
    
    // Add subtasks indicator if present
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const completedSubtasks = taskData.subtasks.filter(subtask => subtask.completed).length;
      const subtasksElement = document.createElement('div');
      subtasksElement.className = 'subtasks-indicator';
      subtasksElement.innerHTML = `
        <i class="fas fa-tasks"></i>
        ${completedSubtasks}/${taskData.subtasks.length}
      `;
      
      card.appendChild(subtasksElement);
    }
    
    // Add event listeners
    this.addCardEventListeners(card);
    
    // Add to column
    const emptyColumn = column.querySelector('.empty-column');
    if (emptyColumn) {
      emptyColumn.remove();
    }
    
    column.appendChild(card);
    
    return card;
  }
  
  /**
   * Add event listeners to a card
   * @param {HTMLElement} card - Card element
   */
  addCardEventListeners(card) {
    // Drag events
    card.addEventListener('dragstart', this.dragStart);
    card.addEventListener('dragend', this.dragEnd);
    
    // Double click to edit
    card.addEventListener('dblclick', () => {
      const taskId = card.dataset.id;
      const task = this.getTaskById(taskId);
      
      if (task) {
        // Dispatch custom event to open edit modal
        const event = new CustomEvent('openEditTaskModal', {
          detail: { taskId }
        });
        document.dispatchEvent(event);
      }
    });
    
    // Card menu functionality
    const menuButton = card.querySelector('.card-menu-button');
    const menuDropdown = card.querySelector('.card-menu-dropdown');
    const deleteOption = card.querySelector('.card-menu-item.delete');
    
    if (menuButton && menuDropdown) {
      // Toggle dropdown on menu button click
      menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click events
        menuDropdown.classList.toggle('show');
        
        // Close other open menus
        document.querySelectorAll('.card-menu-dropdown.show').forEach(dropdown => {
          if (dropdown !== menuDropdown) {
            dropdown.classList.remove('show');
          }
        });
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        menuDropdown.classList.remove('show');
      });
      
      // Prevent dropdown from closing when clicking inside it
      menuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Delete task option
    if (deleteOption) {
      deleteOption.addEventListener('click', () => {
        const taskId = card.dataset.id;
        const task = this.getTaskById(taskId);
        
        if (task) {
          // Close dropdown
          menuDropdown.classList.remove('show');
          
          // Dispatch custom event to open delete confirmation modal
          const event = new CustomEvent('openDeleteTaskModal', {
            detail: { taskId, taskTitle: task.title }
          });
          document.dispatchEvent(event);
        }
      });
    }
  }
  
  /**
   * Update task counts in column headers
   */
  updateTaskCounts() {
    document.querySelectorAll('.column').forEach(column => {
      const taskCount = column.querySelectorAll('.card').length;
      const countElement = column.querySelector('.task-count');
      
      if (countElement) {
        countElement.textContent = taskCount;
      }
      
      // Show or hide empty column message
      const emptyColumnElement = column.querySelector('.empty-column');
      
      if (taskCount === 0) {
        if (!emptyColumnElement) {
          const emptyElement = document.createElement('div');
          emptyElement.className = 'empty-column';
          emptyElement.textContent = 'Drag a card here';
          column.appendChild(emptyElement);
        }
      } else if (emptyColumnElement) {
        emptyColumnElement.remove();
      }
    });
  }
  
  /**
   * Helper function to capitalize first letter
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Drag start event handler (reference to external function)
   */
  dragStart() {
    this.classList.add('dragging');
    setTimeout(() => {
      this.style.display = 'none';
    }, 0);
  }
  
  /**
   * Drag end event handler (reference to external function)
   */
  dragEnd() {
    this.classList.remove('dragging');
    this.style.display = '';
    
    // Get the column this card was dropped into
    const column = this.closest('.column');
    if (column) {
      // Dispatch custom event for task moved
      const event = new CustomEvent('taskChanged', {
        detail: {
          taskId: this.dataset.id,
          action: 'moved',
          toColumn: column.id
        }
      });
      document.dispatchEvent(event);
    }
  }
}

// Initialize the task manager
const taskManager = new TaskManager();

// Export for use in other modules
window.taskManager = taskManager;

// Initialize the board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the board with tasks from storage
  taskManager.initializeBoard();
});
