"use client";

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export function AutoLogout() {
  useEffect(() => {
    // Timeout in milliseconds (1 hour = 60 * 60 * 1000)
    const TIMEOUT_MS = 60 * 60 * 1000;
    
    let lastActivity = Date.now();

    const updateLastActivity = () => {
      lastActivity = Date.now();
    };

    // Events to track user activity
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    // Attach event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Check activity every minute
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        // User has been inactive for 1 hour
        signOut({ callbackUrl: '/login' });
      }
    }, 60000); // Check every 60 seconds

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(interval);
    };
  }, []);

  return null;
}
