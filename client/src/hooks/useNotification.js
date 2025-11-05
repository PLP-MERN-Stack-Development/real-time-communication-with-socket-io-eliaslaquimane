import { useEffect } from 'react';

export const useNotification = () => {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    // Request permission
    Notification.requestPermission();
  }, []);

  const sendNotification = (title, options = {}) => {
    if (Notification.permission === "granted" && document.hidden) {
      new Notification(title, options);
    }
  };

  return { sendNotification };
};