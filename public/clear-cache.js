// This script will be included in the HTML and will clear all caches
(function() {
  console.log('Clearing all caches...');
  
  // Clear localStorage
  try {
    console.log('Clearing localStorage...');
    localStorage.clear();
    console.log('localStorage cleared');
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
  
  // Clear sessionStorage
  try {
    console.log('Clearing sessionStorage...');
    sessionStorage.clear();
    console.log('sessionStorage cleared');
  } catch (e) {
    console.error('Error clearing sessionStorage:', e);
  }
  
  // Clear caches using Cache API
  if ('caches' in window) {
    try {
      console.log('Clearing Cache API caches...');
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
          console.log('Deleted cache:', name);
        }
      });
    } catch (e) {
      console.error('Error clearing Cache API caches:', e);
    }
  }
  
  // Add a random query parameter to force reload without cache
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2, 15);
  
  // Log that cache clearing is complete
  console.log('Cache clearing complete - no auto-refresh');
  
  console.log('All caches cleared');
})();
