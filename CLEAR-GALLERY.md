# Clear Gallery

To clear all items from the gallery:

## Method 1: Browser Console (Easiest)

1. Open the app: http://localhost:3005
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to "Console" tab
4. Paste this command and press Enter:

```javascript
indexedDB.deleteDatabase('veo-gallery-db').onsuccess = () => location.reload();
```

5. Page will refresh with empty gallery!

## Method 2: Application Tab

1. Open app and press F12
2. Go to "Application" tab
3. Find "IndexedDB" in left sidebar
4. Right-click "veo-gallery-db"
5. Click "Delete database"
6. Refresh page (Cmd+R or F5)

Gallery is now empty!

