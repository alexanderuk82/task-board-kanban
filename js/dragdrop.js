/**
 * Task Board Drag and Drop Functionality
 * Handles dragging and dropping tasks between columns
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const columns = document.querySelectorAll('.column');
  
  // Add event listeners to columns
  columns.forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', drop);
  });
  
  /**
   * Drag over event handler
   * @param {Event} e - The drag event
   */
  function dragOver(e) {
    e.preventDefault();
  }
  
  /**
   * Drag enter event handler
   * @param {Event} e - The drag event
   */
  function dragEnter(e) {
    e.preventDefault();
    this.classList.add('highlight');
  }
  
  /**
   * Drag leave event handler
   * @param {Event} e - The drag event
   */
  function dragLeave() {
    this.classList.remove('highlight');
  }
  
  /**
   * Drop event handler
   * @param {Event} e - The drop event
   */
  function drop() {
    this.classList.remove('highlight');
    
    const card = document.querySelector('.dragging');
    if (!card) return;
    
    // Get the column that the card was in before
    const fromColumn = card.closest('.column');
    
    // If the card is dropped in a different column
    if (fromColumn && fromColumn !== this) {
      // Get the task ID
      const taskId = card.dataset.id;
      
      // Get the column ID
      const columnId = this.id;
      
      // Use the task manager to move the task
      if (window.taskManager) {
        window.taskManager.moveTask(taskId, columnId);
        
        // Refresh the board
        window.taskManager.initializeBoard();
      } else {
        // Fallback if task manager is not available
        this.appendChild(card);
        updateTaskCounts();
      }
    } else {
      // If dropped in the same column, just append it
      this.appendChild(card);
    }
  }
  
  /**
   * Update task counts in column headers
   */
  function updateTaskCounts() {
    columns.forEach(column => {
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
});
