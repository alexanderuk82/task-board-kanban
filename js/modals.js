/**
 * Task Board Modal Functionality
 * Handles the create and edit task modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const createTaskModal = document.getElementById('create-task-modal');
  const editTaskModal = document.getElementById('edit-task-modal');
  const exportImportModal = document.getElementById('export-import-modal');
  const deleteTaskModal = document.getElementById('delete-task-modal');
  const filterPanel = document.getElementById('filter-panel');
  const filterBackdrop = document.getElementById('filter-backdrop');
  const globalAddButton = document.getElementById('global-add-task');
  const filterButton = document.getElementById('filter-button');
  const searchInput = document.getElementById('search-input');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  
  // Create task form elements
  const createTaskForm = document.getElementById('create-task-form');
  const taskColumnSelect = document.getElementById('task-column');
  const taskDueDateInput = document.getElementById('task-due-date');
  const subtasksList = document.getElementById('subtasks-list');
  const addSubtaskButton = document.getElementById('add-subtask');
  const cancelCreateButton = document.getElementById('cancel-create');
  const submitCreateButton = document.getElementById('submit-create');
  
  // Edit task form elements
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskIdInput = document.getElementById('edit-task-id');
  const editTaskTitleInput = document.getElementById('edit-task-title');
  const editTaskDescriptionInput = document.getElementById('edit-task-description');
  const editTaskTagInputs = document.querySelectorAll('input[name="edit-tag"]');
  const editTaskPrioritySelect = document.getElementById('edit-task-priority');
  const editTaskEstimateSelect = document.getElementById('edit-task-estimate');
  const editTaskDueDateInput = document.getElementById('edit-task-due-date');
  const editSubtasksList = document.getElementById('edit-subtasks-list');
  const editAddSubtaskButton = document.getElementById('edit-add-subtask');
  const historyList = document.getElementById('history-list');
  const cancelEditButton = document.getElementById('cancel-edit');
  const submitEditButton = document.getElementById('submit-edit');
  
  // Export/Import elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const exportJsonButton = document.getElementById('export-json');
  const exportCsvButton = document.getElementById('export-csv');
  const importDropzone = document.getElementById('import-dropzone');
  const importFileInput = document.getElementById('import-file');
  const importPreview = document.getElementById('import-preview');
  const confirmImportButton = document.getElementById('confirm-import');
  const closeExportImportButton = document.getElementById('close-export-import');
  
  // Filter elements
  const closeFilterButton = document.querySelector('.close-filter');
  const resetFiltersButton = document.getElementById('reset-filters');
  const applyFiltersButton = document.getElementById('apply-filters');
  const filterTagInputs = document.querySelectorAll('input[name="filter-tag"]');
  const filterPriorityInputs = document.querySelectorAll('input[name="filter-priority"]');
  
  // Delete task elements
  const taskToDeleteElement = document.querySelector('.task-to-delete');
  const cancelDeleteButton = document.getElementById('cancel-delete');
  const confirmDeleteButton = document.getElementById('confirm-delete');
  let taskIdToDelete = null;
  
  // Add event listener to global "Create Task" button
  globalAddButton.addEventListener('click', () => {
    // Clear the form
    createTaskForm.reset();
    
    // Clear subtasks list
    subtasksList.innerHTML = '';
    
    // Open modal
    openModal(createTaskModal);
  });
  
  // Add event listener to filter button
  filterButton.addEventListener('click', () => {
    filterPanel.classList.toggle('active');
    filterBackdrop.classList.toggle('active');
  });
  
  // Close filter panel
  closeFilterButton.addEventListener('click', () => {
    filterPanel.classList.remove('active');
    filterBackdrop.classList.remove('active');
  });
  
  // Close filter panel when clicking on backdrop
  filterBackdrop.addEventListener('click', () => {
    filterPanel.classList.remove('active');
    filterBackdrop.classList.remove('active');
  });
  
  // Reset filters
  resetFiltersButton.addEventListener('click', () => {
    // Uncheck all filter checkboxes
    filterTagInputs.forEach(input => {
      input.checked = false;
    });
    
    filterPriorityInputs.forEach(input => {
      input.checked = false;
    });
    
    // Clear search input
    searchInput.value = '';
    
    // Reset board to show all tasks
    taskManager.initializeBoard();
    
    // Show toast notification
    toastManager.info('Filters have been reset');
  });
  
  // Apply filters
  applyFiltersButton.addEventListener('click', () => {
    const filters = {
      text: searchInput.value,
      tags: [],
      priorities: []
    };
    
    // Get selected tags
    filterTagInputs.forEach(input => {
      if (input.checked) {
        filters.tags.push(input.value);
      }
    });
    
    // Get selected priorities
    filterPriorityInputs.forEach(input => {
      if (input.checked) {
        filters.priorities.push(input.value);
      }
    });
    
    // Apply filters
    applyTaskFilters(filters);
    
    // Close filter panel
    filterPanel.classList.remove('active');
    filterBackdrop.classList.remove('active');
    
    // Show toast notification
    toastManager.info('Filters applied');
  });
  
  // Search input
  searchInput.addEventListener('input', debounce(() => {
    const searchText = searchInput.value.trim();
    
    if (searchText.length > 0) {
      applyTaskFilters({ text: searchText });
    } else {
      taskManager.initializeBoard();
    }
  }, 300));
  
  // Close modal when clicking close button
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal-overlay');
      closeModal(modal);
    });
  });
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target);
    }
  });
  
  // Cancel buttons
  cancelCreateButton.addEventListener('click', () => {
    closeModal(createTaskModal);
  });
  
  cancelEditButton.addEventListener('click', () => {
    closeModal(editTaskModal);
  });
  
  closeExportImportButton.addEventListener('click', () => {
    closeModal(exportImportModal);
  });
  
  // Tab switching in export/import modal
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // Show/hide confirm import button
      if (tabId === 'import') {
        confirmImportButton.style.display = 'block';
      } else {
        confirmImportButton.style.display = 'none';
      }
    });
  });
  
  // Export to JSON
  exportJsonButton.addEventListener('click', () => {
    const jsonData = taskManager.exportTasks();
    downloadFile(jsonData, 'taskboard-export.json', 'application/json');
    
    // Show toast notification
    toastManager.success('Tasks exported to JSON successfully');
  });
  
  // Export to CSV
  exportCsvButton.addEventListener('click', () => {
    const csvData = convertTasksToCsv();
    downloadFile(csvData, 'taskboard-export.csv', 'text/csv');
    
    // Show toast notification
    toastManager.success('Tasks exported to CSV successfully');
  });
  
  // Import dropzone click
  importDropzone.addEventListener('click', () => {
    importFileInput.click();
  });
  
  // Import file selection
  importFileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop for import
  importDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    importDropzone.classList.add('dragover');
  });
  
  importDropzone.addEventListener('dragleave', () => {
    importDropzone.classList.remove('dragover');
  });
  
  importDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    importDropzone.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  });
  
  // Confirm import
  confirmImportButton.addEventListener('click', () => {
    const jsonData = importPreview.dataset.jsonData;
    
    if (jsonData) {
      if (taskManager.importTasks(jsonData)) {
        taskManager.initializeBoard();
        closeModal(exportImportModal);
        toastManager.success('Tasks imported successfully');
      } else {
        toastManager.error('Error importing tasks');
      }
    }
  });
  
  // Listen for open edit modal event
  document.addEventListener('openEditTaskModal', (e) => {
    const taskId = e.detail.taskId;
    const task = taskManager.getTaskById(taskId);
    
    if (task) {
      populateEditForm(task);
      openModal(editTaskModal);
    }
  });
  
  // Listen for open delete task modal event
  document.addEventListener('openDeleteTaskModal', (e) => {
    const { taskId, taskTitle } = e.detail;
    
    if (taskId) {
      taskIdToDelete = taskId;
      taskToDeleteElement.textContent = `"${taskTitle}" (${taskId})`;
      openModal(deleteTaskModal);
    }
  });
  
  // Cancel delete button
  cancelDeleteButton.addEventListener('click', () => {
    closeModal(deleteTaskModal);
    taskIdToDelete = null;
  });
  
  // Confirm delete button
  confirmDeleteButton.addEventListener('click', () => {
    if (taskIdToDelete) {
      if (taskManager.deleteTask(taskIdToDelete)) {
        // Refresh the board
        taskManager.initializeBoard();
        
        // Show toast notification
        toastManager.success('Task deleted successfully');
      } else {
        toastManager.error('Error deleting task');
      }
      
      // Close modal and reset
      closeModal(deleteTaskModal);
      taskIdToDelete = null;
    }
  });
  
  // Add subtask in create form
  addSubtaskButton.addEventListener('click', () => {
    addSubtaskToList(subtasksList);
  });
  
  // Add subtask in edit form
  editAddSubtaskButton.addEventListener('click', () => {
    addSubtaskToList(editSubtasksList);
  });
  
  // Submit create task form
  submitCreateButton.addEventListener('click', () => {
    const formData = new FormData(createTaskForm);
    
    // Validate form
    if (!formData.get('title')) {
      toastManager.error('Task title is required');
      return;
    }
    
    // Get subtasks
    const subtasks = [];
    subtasksList.querySelectorAll('.subtask-item').forEach(item => {
      const checkbox = item.querySelector('.subtask-checkbox');
      const input = item.querySelector('.subtask-input');
      
      if (input.value.trim()) {
        subtasks.push({
          text: input.value.trim(),
          completed: checkbox.checked
        });
      }
    });
    
    // Create task data object
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      tag: formData.get('tag'),
      priority: formData.get('priority'),
      estimate: formData.get('estimate'),
      column: formData.get('column'),
      dueDate: formData.get('dueDate') || null,
      subtasks: subtasks.length > 0 ? subtasks : null
    };
    
    // Add task using task manager
    const taskId = taskManager.addTask(taskData);
    
    // Create DOM element for the task
    const column = document.getElementById(taskData.column);
    if (column) {
      taskManager.createTaskElement(taskManager.getTaskById(taskId), column);
      taskManager.updateTaskCounts();
    }
    
    // Close modal and reset form
    closeModal(createTaskModal);
    createTaskForm.reset();
    subtasksList.innerHTML = '';
    
    // Show toast notification
    toastManager.success('Task created successfully');
  });
  
  // Submit edit task form
  submitEditButton.addEventListener('click', () => {
    const taskId = editTaskIdInput.value;
    
    // Validate form
    if (!editTaskTitleInput.value) {
      toastManager.error('Task title is required');
      return;
    }
    
    // Get selected tag value
    let selectedTag = '';
    editTaskTagInputs.forEach(input => {
      if (input.checked) {
        selectedTag = input.value;
      }
    });
    
    // Get subtasks
    const subtasks = [];
    editSubtasksList.querySelectorAll('.subtask-item').forEach(item => {
      const checkbox = item.querySelector('.subtask-checkbox');
      const input = item.querySelector('.subtask-input');
      
      if (input.value.trim()) {
        subtasks.push({
          text: input.value.trim(),
          completed: checkbox.checked
        });
      }
    });
    
    // Update task data
    const taskData = {
      title: editTaskTitleInput.value,
      description: editTaskDescriptionInput.value,
      tag: selectedTag,
      priority: editTaskPrioritySelect.value,
      estimate: editTaskEstimateSelect.value,
      dueDate: editTaskDueDateInput.value || null,
      subtasks: subtasks.length > 0 ? subtasks : null
    };
    
    // Update task using task manager
    if (taskManager.updateTask(taskId, taskData)) {
      // Refresh the board
      taskManager.initializeBoard();
      
      // Show toast notification
      toastManager.success('Task updated successfully');
    } else {
      toastManager.error('Error updating task');
    }
    
    // Close modal
    closeModal(editTaskModal);
  });
  
  // Function to open a modal
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Function to close a modal
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  }
  
  // Function to populate edit form with task data
  function populateEditForm(task) {
    // Set form values
    editTaskIdInput.value = task.id;
    editTaskTitleInput.value = task.title;
    editTaskDescriptionInput.value = task.description;
    
    // Set tag radio button
    editTaskTagInputs.forEach(input => {
      input.checked = (input.value === task.tag);
    });
    
    // Set priority
    editTaskPrioritySelect.value = task.priority;
    
    // Set estimate
    editTaskEstimateSelect.value = task.estimate;
    
    // Set due date
    editTaskDueDateInput.value = task.dueDate || '';
    
    // Set subtasks
    editSubtasksList.innerHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        addSubtaskToList(editSubtasksList, subtask.text, subtask.completed);
      });
    }
    
    // Load task history
    loadTaskHistory(task.id);
  }
  
  // Function to load task history
  function loadTaskHistory(taskId) {
    const history = taskManager.getTaskHistory(taskId);
    historyList.innerHTML = '';
    
    if (history && history.length > 0) {
      // Sort by timestamp, newest first
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      history.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        let actionText = '';
        switch (entry.action) {
          case 'created':
            actionText = 'Task created';
            break;
          case 'updated':
            actionText = 'Task updated';
            break;
          case 'moved':
            actionText = `Moved from ${getColumnName(entry.fromColumn)} to ${getColumnName(entry.toColumn)}`;
            break;
          case 'deleted':
            actionText = 'Task deleted';
            break;
          default:
            actionText = entry.action;
        }
        
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        historyItem.innerHTML = `
          <div>${actionText} by ${entry.user}</div>
          <div class="history-item-time">${formattedDate}</div>
        `;
        
        historyList.appendChild(historyItem);
      });
    } else {
      historyList.innerHTML = '<div class="history-item">No history available</div>';
    }
  }
  
  // Function to get column name from id
  function getColumnName(columnId) {
    const columns = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'testing': 'In Review',
      'done': 'Completed'
    };
    
    return columns[columnId] || columnId;
  }
  
  // Function to add a subtask to the list
  function addSubtaskToList(container, text = '', completed = false) {
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item';
    
    subtaskItem.innerHTML = `
      <input type="checkbox" class="subtask-checkbox" ${completed ? 'checked' : ''}>
      <input type="text" class="form-control subtask-input" value="${text}" placeholder="Subtask description">
      <button type="button" class="subtask-remove">&times;</button>
    `;
    
    // Add event listener to remove button
    subtaskItem.querySelector('.subtask-remove').addEventListener('click', () => {
      subtaskItem.remove();
    });
    
    // Add event listener to checkbox
    subtaskItem.querySelector('.subtask-checkbox').addEventListener('change', (e) => {
      const textElement = subtaskItem.querySelector('.subtask-input');
      if (e.target.checked) {
        textElement.classList.add('completed');
      } else {
        textElement.classList.remove('completed');
      }
    });
    
    // Add to container
    container.appendChild(subtaskItem);
  }
  
  // Function to apply task filters
  function applyTaskFilters(filters) {
    // Hide all cards
    document.querySelectorAll('.card').forEach(card => {
      card.style.display = 'none';
    });
    
    // Show empty column messages
    document.querySelectorAll('.column').forEach(column => {
      let emptyColumnElement = column.querySelector('.empty-column');
      
      if (!emptyColumnElement) {
        emptyColumnElement = document.createElement('div');
        emptyColumnElement.className = 'empty-column';
        emptyColumnElement.textContent = 'No tasks match the filters';
        column.appendChild(emptyColumnElement);
      }
    });
    
    // Get all tasks
    const tasks = taskManager.getAllTasks();
    
    // Loop through columns and tasks
    Object.keys(tasks).forEach(columnId => {
      const column = document.getElementById(columnId);
      if (!column) return;
      
      let visibleCount = 0;
      
      tasks[columnId].forEach(task => {
        const card = column.querySelector(`.card[data-id="${task.id}"]`);
        if (!card) return;
        
        let show = true;
        
        // Filter by text
        if (filters.text && filters.text.length > 0) {
          const text = filters.text.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(text);
          const descMatch = task.description.toLowerCase().includes(text);
          
          if (!titleMatch && !descMatch) {
            show = false;
          }
        }
        
        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
          if (!filters.tags.includes(task.tag)) {
            show = false;
          }
        }
        
        // Filter by priorities
        if (filters.priorities && filters.priorities.length > 0) {
          if (!filters.priorities.includes(task.priority)) {
            show = false;
          }
        }
        
        // Show or hide card
        if (show) {
          card.style.display = '';
          visibleCount++;
        }
      });
      
      // Update empty column message
      const emptyColumnElement = column.querySelector('.empty-column');
      if (visibleCount > 0 && emptyColumnElement) {
        emptyColumnElement.remove();
      }
      
      // Update task count
      const countElement = column.querySelector('.task-count');
      if (countElement) {
        countElement.textContent = visibleCount;
      }
    });
  }
  
  // Function to convert tasks to CSV
  function convertTasksToCsv() {
    const tasks = taskManager.getAllTasks();
    let csv = 'ID,Title,Description,Tag,Priority,Estimate,Column,Due Date\n';
    
    Object.keys(tasks).forEach(columnId => {
      tasks[columnId].forEach(task => {
        const row = [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${task.description.replace(/"/g, '""')}"`,
          task.tag,
          task.priority,
          task.estimate,
          columnId,
          task.dueDate || ''
        ];
        
        csv += row.join(',') + '\n';
      });
    });
    
    return csv;
  }
  
  // Function to download a file
  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Function to handle file select for import
  function handleFileSelect(e) {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        try {
          const jsonData = event.target.result;
          const data = JSON.parse(jsonData);
          
          // Preview the data
          importPreview.innerHTML = `
            <div>Tasks to import: ${countTasks(data.tasks)}</div>
            <div>Change history: ${data.history ? data.history.length : 0} entries</div>
          `;
          
          importPreview.dataset.jsonData = jsonData;
          importPreview.classList.add('active');
          
          // Show toast notification
          toastManager.info('File loaded. Click "Import Data" to confirm.');
        } catch (error) {
          toastManager.error('The selected file is not a valid JSON');
          importPreview.innerHTML = '';
          importPreview.classList.remove('active');
        }
      };
      
      reader.readAsText(file);
    }
  }
  
  // Function to count tasks in import data
  function countTasks(tasks) {
    let count = 0;
    
    if (tasks) {
      Object.values(tasks).forEach(columnTasks => {
        count += columnTasks.length;
      });
    }
    
    return count;
  }
  
  // Debounce function for search input
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
});
