// ✅ NEW FILE: utils/apiHelpers.js - Safe API helpers

export const safeJsonParse = (str, fallback = null) => {
  try {
    return str && str !== 'undefined' ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

export const getStorageItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? safeJsonParse(item, fallback) : fallback;
  } catch {
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
};

export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    return error.response.data?.message || error.response.data?.error || fallbackMessage;
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || fallbackMessage;
};
