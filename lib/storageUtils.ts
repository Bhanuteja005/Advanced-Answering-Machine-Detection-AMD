/**
 * Storage cleanup utility
 * Clears localStorage to fix quota issues
 */

export function clearLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🧹 Clearing localStorage...');
    
    // Get count before clearing
    const beforeCount = localStorage.length;
    
    // Clear all localStorage
    localStorage.clear();
    
    console.log(`✅ Cleared ${beforeCount} items from localStorage`);
    return true;
  } catch (e) {
    console.error('❌ Failed to clear localStorage:', e);
    return false;
  }
}

export function clearSessionStorage(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🧹 Clearing sessionStorage...');
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');
    return true;
  } catch (e) {
    console.error('❌ Failed to clear sessionStorage:', e);
    return false;
  }
}

export function clearAllStorage(): boolean {
  const localCleared = clearLocalStorage();
  const sessionCleared = clearSessionStorage();
  
  if (localCleared && sessionCleared) {
    console.log('✅ All storage cleared successfully');
    return true;
  }
  
  return false;
}

export function checkStorageAvailability(): {
  localStorage: boolean;
  sessionStorage: boolean;
  localStorageQuota?: string;
} {
  const result = {
    localStorage: false,
    sessionStorage: false,
    localStorageQuota: undefined as string | undefined,
  };
  
  if (typeof window === 'undefined') return result;
  
  // Check localStorage
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    result.localStorage = true;
  } catch (e: any) {
    result.localStorage = false;
    result.localStorageQuota = e.message;
  }
  
  // Check sessionStorage
  try {
    const testKey = '__test_storage__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    result.sessionStorage = true;
  } catch (e) {
    result.sessionStorage = false;
  }
  
  return result;
}
