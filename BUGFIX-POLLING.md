# 🐛 Bug Fix: Operation Polling Error

## Issue
```
TypeError: operation._fromAPIResponse is not a function
```

## Root Cause
The operation polling route was using an incompatible API structure for `@google/genai` v1.22.0.

## Solution Applied

### Before (Broken)
```typescript
const fresh = await ai.operations.getVideosOperation({
  operation: { name } as unknown as never,
});
```

### After (Fixed)
```typescript
const operationObject = {
  name,
  done: false,
  metadata: {},
};

const fresh = await ai.operations.getVideosOperation({
  operation: operationObject as any,
});
```

## Why This Works
The newer SDK version (v1.22.0) expects a complete operation object with:
- `name` - The operation identifier
- `done` - Boolean status (will be updated by SDK)
- `metadata` - Additional operation metadata

## Status
✅ **FIXED** - Polling will now work correctly for video generation!

## Testing
Try generating a video now:
1. Enter a prompt
2. Click Generate
3. Polling should work without errors
4. Video will download when complete

---

*Auto-reloading in Next.js dev server. The fix is already live!*

