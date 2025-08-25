// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    // When an alarm goes off, create a notification
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Due Date Reminder!',
        message: alarm.name
    });
    
    // Once the alarm goes off, we should remove the reminder from storage
    chrome.storage.local.get(['reminders'], (result) => {
        const reminders = result.reminders || [];
        const updatedReminders = reminders.filter(r => r.task !== alarm.name);
        chrome.storage.local.set({ 'reminders': updatedReminders });
    });
});