// utils.js - Shared helper functions

// Fallback date functions if date-fns is not available
// Note: date-fns is loaded via CDN in index.html. If unavailable (e.g., blocked by ad-blockers),
// these fallback implementations provide basic date functionality.
const dateFallback = {
    format: (date, formatStr) => {
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    },
    isBefore: (date1, date2) => {
        return new Date(date1) < new Date(date2);
    },
    compareAsc: (date1, date2) => {
        return new Date(date1) - new Date(date2);
    },
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    addWeeks: (date, weeks) => {
        const result = new Date(date);
        result.setDate(result.getDate() + (weeks * 7));
        return result;
    },
    addMonths: (date, months) => {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
};

// Use date-fns if available, otherwise use fallback
const dateLib = typeof dateFns !== 'undefined' ? dateFns : dateFallback;

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
    return `Due: ${dateLib.format(new Date(dueDate), 'MMM d, yyyy')}`;
}

export function isOverdue(task) {
    return !task.completed && task.dueDate && dateLib.isBefore(new Date(task.dueDate), new Date());
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
            return dateLib.compareAsc(aDue, bDue) || new Date(b.createdAt) - new Date(a.createdAt);
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
        return dateLib.addDays(due, 1).toISOString();
    } else if (recurrence === 'weekly') {
        return dateLib.addWeeks(due, 1).toISOString();
    } else if (recurrence === 'monthly') {
        return dateLib.addMonths(due, 1).toISOString();
    }
    return null;
}
