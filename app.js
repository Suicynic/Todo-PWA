// Todo App JavaScript
// Handles task management, localStorage persistence, and UI updates

class TodoApp {
    constructor() {
        this.tasks = [];
        this.theme = localStorage.getItem('pwa-todo-theme') || 'light';
        this.sortByPriority = false;
        this.categoryFilter = 'all';
        this.init();
    }

    init() {
        // Load tasks from localStorage
        this.loadTasks();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup online/offline detection
        this.setupOnlineDetection();
        
        // Apply theme
        this.applyTheme();
        
        // Populate category filter
        this.populateCategoryFilter();
        
        // Render initial tasks
        this.render();
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addBtn').addEventListener('click', () => {
            this.addTask();
        });

        // Enter key on input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Clear completed button
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // Theme toggle button
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('pwa-todo-theme', this.theme);
            this.applyTheme();
        });
        
        // Sort button
        document.getElementById('sortBtn').addEventListener('click', () => {
            this.sortByPriority = !this.sortByPriority;
            this.render();
            document.getElementById('sortBtn').textContent = this.sortByPriority ? 'Sort by Date' : 'Sort by Priority';
        });
        
        // Category select for custom
        const categorySelect = document.getElementById('categorySelect');
        const customCategory = document.getElementById('customCategory');
        categorySelect.addEventListener('change', () => {
            customCategory.style.display = categorySelect.value === 'Custom' ? 'block' : 'none';
        });
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.render();
        });
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.theme === 'dark');
        document.getElementById('themeToggle').textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    setupOnlineDetection() {
        const updateOnlineStatus = () => {
            const indicator = document.getElementById('offlineIndicator');
            const statusText = document.getElementById('statusText');
            
            if (navigator.onLine) {
                indicator.classList.remove('offline');
                statusText.textContent = 'Online';
            } else {
                indicator.classList.add('offline');
                statusText.textContent = 'Offline';
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial status
        updateOnlineStatus();
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const categorySelect = document.getElementById('categorySelect');
        const customCategory = document.getElementById('customCategory');
        const dueDateInput = document.getElementById('dueDateInput'); // New
        const text = input.value.trim();

        if (text === '') {
            input.focus();
            return;
        }

        let category = categorySelect.value;
        if (category === 'Custom') {
            category = customCategory.value.trim();
            if (!category) return; // Skip if empty custom
        } else if (category === '') {
            category = null; // No category
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: prioritySelect.value,
            category: category,
            dueDate: dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null, // New: ISO due date or null
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.populateCategoryFilter();
        this.render();

        // Reset inputs
        input.value = '';
        categorySelect.value = '';
        customCategory.value = '';
        customCategory.style.display = 'none';
        dueDateInput.value = ''; // New: Reset date
        input.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.populateCategoryFilter();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        const hadCompleted = this.tasks.some(task => task.completed);
        if (!hadCompleted) return;

        if (confirm('Are you sure you want to delete all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.populateCategoryFilter();
            this.render();
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('pwa-todo-tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage:', e);
        }
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('pwa-todo-tasks');
            if (stored) {
                this.tasks = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading tasks from localStorage:', e);
            this.tasks = [];
        }
    }

    populateCategoryFilter() {
        const filterSelect = document.getElementById('categoryFilter');
        const staticOptions = ['all', 'Work', 'Personal', 'Shopping'];
        const uniqueCategories = [...new Set(this.tasks.map(task => task.category).filter(cat => cat && !staticOptions.includes(cat.toLowerCase())))];
        
        // Preserve selected value
        const currentValue = filterSelect.value;
        
        // Clear and repopulate
        filterSelect.innerHTML = '<option value="all">All</option><option value="Work">Work</option><option value="Personal">Personal</option><option value="Shopping">Shopping</option>';
        uniqueCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterSelect.appendChild(option);
        });
        
        // Restore selection
        filterSelect.value = currentValue;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const taskCount = document.getElementById('taskCount');

        // Clear current list
        taskList.innerHTML = '';

        // Filter tasks
        let filteredTasks = this.tasks.filter(task => this.categoryFilter === 'all' || task.category === this.categoryFilter);

        // Sort filtered tasks
        let sortedTasks = [...filteredTasks];
        if (this.sortByPriority) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskList.style.display = 'none';
            taskCount.textContent = this.tasks.length === 0 ? 'No tasks' : 'No tasks in this category';
        } else {
            emptyState.classList.add('hidden');
            taskList.style.display = 'block';
            
            // Update task count
            const activeTasks = filteredTasks.filter(task => !task.completed).length;
            const totalTasks = filteredTasks.length;
            taskCount.textContent = `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
            
            // Render tasks
            sortedTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
                if (task.category) li.classList.add(`category-${task.category.toLowerCase().replace(/\s/g, '-')}`);
                if (!task.completed && task.dueDate && dateFns.isBefore(new Date(task.dueDate), new Date())) { // New: Check overdue
                    li.classList.add('overdue');
                }
                li.setAttribute('data-id', task.id);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => {
                    this.toggleTask(task.id);
                });

                const span = document.createElement('span');
                span.className = 'task-text';
                span.textContent = task.text;

                const dueDateSpan = document.createElement('span'); // New: Due date display
                if (task.dueDate) {
                    dueDateSpan.className = 'due-date';
                    dueDateSpan.textContent = `Due: ${dateFns.format(new Date(task.dueDate), 'MMM d, yyyy')}`;
                }

                const priorityBadge = document.createElement('span');
                priorityBadge.className = `priority-badge priority-${task.priority}`;
                priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

                const categoryTag = document.createElement('span');
                if (task.category) {
                    categoryTag.className = `category-tag category-${task.category.toLowerCase().replace(/\s/g, '-')}`;
                    categoryTag.textContent = task.category;
                }

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => {
                    this.deleteTask(task.id);
                });

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(dueDateSpan);
                li.appendChild(priorityBadge);
                li.appendChild(categoryTag);
                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TodoApp();
    });
} else {
    new TodoApp();
}
