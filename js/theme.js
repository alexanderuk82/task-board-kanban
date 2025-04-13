/**
 * Theme management for the task board application
 * Handles switching between light and dark themes
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('taskboard-theme');
    
    // Apply saved theme or default to light
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Toggle between light and dark
        const newTheme = currentTheme === 'dark' ? '' : 'dark';
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        localStorage.setItem('taskboard-theme', newTheme);
    });
});
