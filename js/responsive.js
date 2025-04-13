/**
 * Responsive functionality for Task Board
 * Handles mobile-specific features and responsive behavior
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile column navigation
  const columnNavButtons = document.querySelectorAll('.column-nav-btn');
  const columns = document.querySelectorAll('.column');
  
  // Set first button as active by default
  if (columnNavButtons.length > 0) {
    columnNavButtons[0].classList.add('active');
  }
  
  // Add click event to each button
  columnNavButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      columnNavButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get column id from data attribute
      const columnId = button.dataset.column;
      
      // Find the column element
      const targetColumn = document.getElementById(columnId);
      
      if (targetColumn) {
        // Scroll to the column with smooth behavior
        targetColumn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    });
  });
  
  // Update active button based on visible columns
  function updateActiveButton() {
    // Only on mobile view
    if (window.innerWidth <= 768) {
      // Get the most visible column
      let mostVisibleColumn = null;
      let maxVisibleWidth = 0;
      
      columns.forEach(column => {
        const rect = column.getBoundingClientRect();
        const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
        
        if (visibleWidth > maxVisibleWidth) {
          maxVisibleWidth = visibleWidth;
          mostVisibleColumn = column;
        }
      });
      
      if (mostVisibleColumn) {
        const columnId = mostVisibleColumn.id;
        
        // Update active button
        columnNavButtons.forEach(button => {
          if (button.dataset.column === columnId) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
      }
    }
  }
  
  // Listen for scroll events on the board
  const board = document.querySelector('.board');
  if (board) {
    board.addEventListener('scroll', updateActiveButton);
  }
  
  // Update on resize
  window.addEventListener('resize', updateActiveButton);
  
  // Initial update
  updateActiveButton();
});
