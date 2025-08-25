// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    // When an alarm goes off, create a notification
    chrome.notifications.create(alarm.name, {
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Due Date Reminder!',
        message: alarm.name,
        buttons: [{ title: 'Snooze 5 Mins' }]
    });

    // Check for repeat settings and reschedule if necessary
    chrome.storage.local.get(['reminders'], (result) => {
        const reminders = result.reminders || [];
        const matchingReminder = reminders.find(r => r.task === alarm.name);

        if (matchingReminder && matchingReminder.repeat !== 'none') {
            const now = new Date();
            const newDate = new Date(matchingReminder.date);
            if (matchingReminder.repeat === 'daily') {
                newDate.setDate(newDate.getDate() + 1);
            } else if (matchingReminder.repeat === 'weekly') {
                newDate.setDate(newDate.getDate() + 7);
            } else if (matchingReminder.repeat === 'monthly') {
                newDate.setMonth(newDate.getMonth() + 1);
            }

            // Update the reminder's date in storage and re-create the alarm
            matchingReminder.date = newDate.toISOString();
            chrome.storage.local.set({ 'reminders': reminders });
            chrome.alarms.create(matchingReminder.task, { when: newDate.getTime() });
        } else {
            // If not repeating, remove the reminder from storage
            const updatedReminders = reminders.filter(r => r.task !== alarm.name);
            chrome.storage.local.set({ 'reminders': updatedReminders });
        }
    });
});

// Listen for notification button clicks (for snoozing)
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    // If the snooze button was clicked (buttonIndex 0)
    if (buttonIndex === 0) {
        // Re-create the alarm to trigger again in 5 minutes
        const newTime = Date.now() + 5 * 60 * 1000;
        chrome.alarms.create(notificationId, { when: newTime });
        console.log(`Snoozed alarm for: ${notificationId}`);
    }
});