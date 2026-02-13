// utils.js - Shared helper functions

export function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
}

export function updateSortButtonText(sortMode) {
    const btn = document.getElementById('sortBtn');
    if (sortMode === 'priority') {
        btn.textContent = 'Sort by Priority';
    } else if (sortMode === 'dueDate') {
        btn.textContent = 'Sort by Due Date';
    } else {
        btn.textContent = 'Sort by Date Added';
    }
}

export function setupOnlineDetection() {
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

export function formatDueDate(dueDate) {
    if (!dueDate) return '';
    return `Due: ${dateFns.format(new Date(dueDate), 'MMM d, yyyy')}`;
}

export function isOverdue(task) {
    return !task.completed && task.dueDate && dateFns.isBefore(new Date(task.dueDate), new Date());
}

export function sortTasks(tasks, sortMode) {
    let sorted = [...tasks];
    if (sortMode === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortMode === 'dueDate') {
        sorted.sort((a, b) => {
            const aDue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
            const bDue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
            const aOverdue = isOverdue(a);
            const bOverdue = isOverdue(b);
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            return dateFns.compareAsc(aDue, bDue) || new Date(b.createdAt) - new Date(a.createdAt);
        });
    } else { // dateAdded
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
}

export function getNextDueDate(dueDate, recurrence) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    if (recurrence === 'daily') {
        return dateFns.addDays(due, 1).toISOString();
    } else if (recurrence === 'weekly') {
        return dateFns.addWeeks(due, 1).toISOString();
    } else if (recurrence === 'monthly') {
        return dateFns.addMonths(due, 1).toISOString();
    }
    return null;
}
