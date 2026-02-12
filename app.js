// Todo App JavaScript
// Handles task management, localStorage persistence, and UI updates

class TodoApp {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        // Load tasks from localStorage
        this.loadTasks();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup online/offline detection
        this.setupOnlineDetection();
        
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
        const text = input.value.trim();

        if (text === '') {
            input.focus();
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();

        // Clear input and focus
        input.value = '';
        input.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
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

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const taskCount = document.getElementById('taskCount');

        // Clear current list
        taskList.innerHTML = '';

        // Show/hide empty state
        if (this.tasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskList.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            taskList.style.display = 'block';
        }

        // Update task count
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const totalTasks = this.tasks.length;
        taskCount.textContent = `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

        // Render tasks
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
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

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
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
