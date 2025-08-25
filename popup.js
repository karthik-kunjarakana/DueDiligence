document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const repeatFrequency = document.getElementById('repeatFrequency');
    const saveBtn = document.getElementById('saveBtn');
    const reminderList = document.getElementById('reminderList');

    // Load existing reminders
    function loadReminders() {
        chrome.storage.local.get(['reminders'], (result) => {
            const reminders = result.reminders || [];
            reminderList.innerHTML = ''; // Clear the list
            reminders.forEach((reminder, index) => {
                const li = document.createElement('li');
                li.className = 'reminder-item';
                const dueDate = new Date(reminder.date);
                li.innerHTML = `
                    <div class="reminder-info">
                        <strong>${reminder.task}</strong>
                        <small>Due: ${dueDate.toLocaleString()}</small>
                        ${reminder.repeat !== 'none' ? `<br><small>Repeats: ${reminder.repeat}</small>` : ''}
                    </div>
                    <button class="delete-btn" data-index="${index}">&times;</button>
                `;
                reminderList.appendChild(li);
            });
        });
    }

    loadReminders();

    // Save a new reminder
    saveBtn.addEventListener('click', () => {
        const task = taskInput.value;
        const date = dateInput.value;
        const repeat = repeatFrequency.value;

        if (task && date) {
            const reminder = { task, date, repeat };
            
            // Get existing reminders from storage
            chrome.storage.local.get(['reminders'], (result) => {
                const reminders = result.reminders || [];
                reminders.push(reminder);
                
                // Save the updated list
                chrome.storage.local.set({ 'reminders': reminders }, () => {
                    console.log('Reminder saved!');
                    
                    // Create an alarm for the reminder
                    const reminderTime = new Date(date).getTime();
                    chrome.alarms.create(task, { when: reminderTime });
                    
                    // Reload reminders on the page
                    loadReminders();
                    taskInput.value = '';
                    dateInput.value = '';
                    repeatFrequency.value = 'none';
                });
            });
        }
    });

    // Delete a reminder
    reminderList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const indexToDelete = event.target.dataset.index;
            
            chrome.storage.local.get(['reminders'], (result) => {
                const reminders = result.reminders || [];
                const reminderToDelete = reminders[indexToDelete];
                
                reminders.splice(indexToDelete, 1);
                
                chrome.storage.local.set({ 'reminders': reminders }, () => {
                    // Also clear the alarm to avoid future notifications
                    chrome.alarms.clear(reminderToDelete.task, (wasCleared) => {
                        if (wasCleared) {
                            console.log('Alarm cleared successfully.');
                        }
                    });
                    loadReminders();
                });
            });
        }
    });
});