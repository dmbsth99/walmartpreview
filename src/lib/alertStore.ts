// src/lib/stores/alertStore.ts
import { writable } from 'svelte/store';

interface Alert {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

// Initial state of the alert
const initialAlertState: Alert = {
  message: '',
  type: 'info',
  show: false,
};

// Create a writable store for the alert
export const alert = writable<Alert>(initialAlertState);

// Function to easily show an alert
export function showAlert(message: string, type: Alert['type'] = 'info', duration: number = 3000) {
  alert.set({ message, type, show: true });

  // Automatically hide the alert after a duration
  if (duration > 0) {
    setTimeout(() => {
      alert.update(currentAlert => ({ ...currentAlert, show: false }));
    }, duration);
  }
}

// Function to hide the alert manually
export function hideAlert() {
  alert.update(currentAlert => ({ ...currentAlert, show: false }));
}