# Quick Start Guide - Refactored Codebase

## Running the Application

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API key

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## New Project Structure

```
SEC-hacakthon/
├── app/
│   ├── api/                    # API routes
│   ├── page.tsx               # Main app (REFACTORED - 350 lines)
│   └── layout.tsx
├── components/
│   └── ui/                    # UI components
├── lib/
│   ├── types.ts              # ✨ NEW: Type definitions
│   ├── constants.ts          # ✨ NEW: Application constants
│   ├── config.ts             # ✨ NEW: Configuration
│   ├── hooks/                # ✨ NEW: Custom hooks
│   │   ├── useVideoGeneration.ts
│   │   ├── useImageGeneration.ts
│   │   └── useGallery.ts
│   ├── services/             # ✨ NEW: API services
│   │   ├── videoService.ts
│   │   └── imageService.ts
│   └── utils/                # ✨ NEW: Utilities
│       └── errorHandler.ts
└── REFACTORING_SUMMARY.md    # ✨ NEW: Detailed refactoring docs
```

## Key Improvements

### 1. Custom Hooks
Replace complex state management with simple hooks:

```typescript
// Video generation
const videoGen = useVideoGeneration({
  onAddToGallery: gallery.addToGallery,
});

// Image generation
const imageGen = useImageGeneration({
  onAddToGallery: gallery.addToGallery,
});

// Gallery management
const gallery = useGallery({
  onEditStart: (operationName) => {
    // Handle edit
  },
});
```

### 2. API Services
Clean API calls with automatic error handling:

```typescript
import { generateVideo } from '@/lib/services/videoService';

const response = await generateVideo({
  prompt: 'A beautiful sunset',
  model: 'veo-3.0',
  aspectRatio: '16:9',
});
```

### 3. Type Safety
Full TypeScript support with centralized types:

```typescript
import type { GalleryItem, VideoGenerationRequest } from '@/lib/types';
```

### 4. Constants
No more magic strings or numbers:

```typescript
import { DEFAULT_MODEL, API_ENDPOINTS } from '@/lib/constants';
```

## Feature Flags

Control features via `lib/config.ts`:

```typescript
export const config = {
  features: {
    voiceAgent: true,      // Enable/disable voice agent
    agentPanel: true,      // Enable/disable AI agent panel
    gallery: true,         // Enable/disable gallery
    imageGeneration: true, // Enable/disable image generation
  },
};
```

## Development Tips

### Adding a New Feature

1. **Add types** in `lib/types.ts`
2. **Add constants** in `lib/constants.ts`
3. **Create service** in `lib/services/` if needed
4. **Create hook** in `lib/hooks/` if needed
5. **Use in component** with clean imports

### Debugging

- Check console for detailed error logs
- All errors include context information
- Use React DevTools to inspect hook state
- Service calls are wrapped with error handling

### Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Common Tasks

### Adding a New API Endpoint

1. Add endpoint to `lib/constants.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     NEW_API: {
       ACTION: '/api/new-api/action',
     },
   };
   ```

2. Create service in `lib/services/newService.ts`:
   ```typescript
   export async function performAction() {
     return withErrorHandling(async () => {
       const response = await fetch(API_ENDPOINTS.NEW_API.ACTION);
       return await response.json();
     }, 'performAction');
   }
   ```

### Creating a Custom Hook

```typescript
// lib/hooks/useNewFeature.ts
export function useNewFeature() {
  const [state, setState] = useState();
  
  const action = useCallback(async () => {
    // Implementation
  }, []);
  
  return {
    state,
    action,
  };
}
```

## Troubleshooting

### Build Errors
- Run `npm install` to ensure dependencies are up to date
- Check for TypeScript errors: `npx tsc --noEmit`
- Clear Next.js cache: `rm -rf .next`

### Runtime Errors
- Check browser console for detailed error messages
- Verify environment variables are set correctly
- Ensure API key is valid and has required permissions

### Type Errors
- All types are in `lib/types.ts`
- Import types with `import type { ... } from '@/lib/types'`
- Use TypeScript's "Go to Definition" to find type sources

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Support

For issues or questions:
1. Check `REFACTORING_SUMMARY.md` for detailed architecture info
2. Review inline code comments and JSDoc
3. Check the original README.md for project overview

---

**Happy Coding! 🚀**

