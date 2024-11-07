const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
};

const scheduleNotification = (mealTime, mealName) => {
    const now = new Date();
    const [hours, minutes] = mealTime.split(':');
    const scheduledTime = new Date(now);
    scheduledTime.setHours(parseInt(hours), parseInt(minutes) - 20, 0); // 20 minutes before

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    // Create a unique identifier for this notification
    const notificationId = `${mealName.toLowerCase()}_${mealTime}`;

    // Clear any existing timeout for this meal
    if (window.notificationTimers && window.notificationTimers[notificationId]) {
        clearTimeout(window.notificationTimers[notificationId]);
    }

    // Initialize notification timers object if it doesn't exist
    if (!window.notificationTimers) {
        window.notificationTimers = {};
    }

    // Store the new timeout
    window.notificationTimers[notificationId] = setTimeout(() => {
        new Notification("Meal Time Reminder", {
            body: `Your ${mealName} time is in 20 minutes!`,
            icon: "/favicon.ico"
        });

        // Schedule next day's notification
        const nextDay = new Date(scheduledTime);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextTimeUntilNotification = nextDay.getTime() - new Date().getTime();
        
        window.notificationTimers[notificationId] = setTimeout(() => {
            scheduleNotification(mealTime, mealName);
        }, nextTimeUntilNotification);
    }, timeUntilNotification);
};

export const setupMealNotifications = async (mealTimes) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    if (mealTimes.breakfast) {
        scheduleNotification(mealTimes.breakfast, 'Breakfast');
    }
    if (mealTimes.lunch) {
        scheduleNotification(mealTimes.lunch, 'Lunch');
    }
    if (mealTimes.dinner) {
        scheduleNotification(mealTimes.dinner, 'Dinner');
    }
}; 