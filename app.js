// app.js - Main app logic
import { Storage } from './storage.js';
import { applyTheme, updateSortButtonText, setupOnlineDetection, formatDueDate, isOverdue, sortTasks, getNextDueDate } from './utils.js';

class TodoApp {
    constructor() {
        this.tasks = [];
        this.theme = localStorage.getItem('pwa-todo-theme') || 'light';
        this.sortMode = 'dateAdded';
        this.categoryFilter = 'all';
        this.storage = new Storage();
        this.init();
    }

    async init() {
        // Open IndexedDB
        await this.storage.open();
        
        // Migrate from localStorage if needed
        await this.storage.migrateFromLocalStorage();
        
        // Load tasks from IndexedDB
        this.tasks = await this.storage.loadTasks();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup online/offline detection
        setupOnlineDetection();
        
        // Apply theme
        applyTheme(this.theme);
        
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
            applyTheme(this.theme);
        });
        
        // Sort button
        document.getElementById('sortBtn').addEventListener('click', () => {
            if (this.sortMode === 'dateAdded') {
                this.sortMode = 'priority';
            } else if (this.sortMode === 'priority') {
                this.sortMode = 'dueDate';
            } else {
                this.sortMode = 'dateAdded';
            }
            updateSortButtonText(this.sortMode);
            this.render();
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

    async addTask() {
        const input = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const categorySelect = document.getElementById('categorySelect');
        const customCategory = document.getElementById('customCategory');
        const dueDateInput = document.getElementById('dueDateInput');
        const recurrenceSelect = document.getElementById('recurrenceSelect');
        const text = input.value.trim();

        if (text === '') {
            input.focus();
            return;
        }

        let category = categorySelect.value;
        if (category === 'Custom') {
            category = customCategory.value.trim();
            if (!category) return;
        } else if (category === '') {
            category = null;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: prioritySelect.value,
            category: category,
            dueDate: dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null,
            recurrence: recurrenceSelect.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        await this.storage.saveTasks(this.tasks);
        this.populateCategoryFilter();
        this.render();

        // Reset inputs
        input.value = '';
        categorySelect.value = '';
        customCategory.value = '';
        customCategory.style.display = 'none';
        dueDateInput.value = '';
        recurrenceSelect.value = 'none';
        input.focus();
    }

    async deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        await this.storage.saveTasks(this.tasks);
        this.populateCategoryFilter();
        this.render();
    }

    async toggleTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            task.completed = !task.completed;
            if (task.completed && task.recurrence && task.recurrence !== 'none') {
                // Generate collision-resistant ID using timestamp + random string
                const newTask = { 
                    ...task, 
                    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9), 
                    completed: false, 
                    createdAt: new Date().toISOString() 
                };
                newTask.dueDate = getNextDueDate(task.dueDate, task.recurrence);
                this.tasks.push(newTask);
            }
            await this.storage.saveTasks(this.tasks);
            this.render();
        }
    }

    async clearCompleted() {
        const hadCompleted = this.tasks.some(task => task.completed);
        if (!hadCompleted) return;

        if (confirm('Are you sure you want to delete all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            await this.storage.saveTasks(this.tasks);
            this.populateCategoryFilter();
            this.render();
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
        let sortedTasks = sortTasks(filteredTasks, this.sortMode);

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
                if (isOverdue(task)) {
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

                const dueDateSpan = document.createElement('span');
                const formattedDate = formatDueDate(task.dueDate);
                if (formattedDate) {
                    dueDateSpan.className = 'due-date';
                    dueDateSpan.textContent = formattedDate;
                }

                const recurrenceSpan = document.createElement('span');
                if (task.recurrence && task.recurrence !== 'none') {
                    recurrenceSpan.className = 'recurrence-indicator';
                    recurrenceSpan.textContent = `(${task.recurrence})`;
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
                li.appendChild(recurrenceSpan);
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
    document.addEventListener('DOMContentLoaded', async () => {
        await new TodoApp();
    });
} else {
    new TodoApp();
}
