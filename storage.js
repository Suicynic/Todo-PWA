// storage.js - IndexedDB handling

export class Storage {
    constructor() {
        this.db = null;
    }

    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TodoPWA', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('tasks', { keyPath: 'id' });
            };
        });
    }

    async migrateFromLocalStorage() {
        const stored = localStorage.getItem('pwa-todo-tasks');
        if (stored) {
            const oldTasks = JSON.parse(stored);
            await this.saveTasks(oldTasks);
            localStorage.removeItem('pwa-todo-tasks');
        }
    }

    async saveTasks(tasks) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);

            // Clear existing
            store.clear();

            // Add all tasks
            tasks.forEach(task => store.add(task));
        });
    }

    async loadTasks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
}
