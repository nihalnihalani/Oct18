# ⚡ Quick Command Reference

## 🚀 Getting Started (30 seconds)

```bash
cd gallery
npm install
echo 'GEMINI_API_KEY="your-api-key-here"' > .env.local
npm run dev
```

Then open: http://localhost:3000

## 📦 Installation

```bash
# Install dependencies
cd gallery
npm install

# Or with specific package manager
npm install  # or yarn / pnpm
```

## 🔑 Environment Setup

```bash
# Create environment file
cat > .env.local << EOF
GEMINI_API_KEY="your-gemini-api-key"
EOF

# Or manually create .env.local and add:
# GEMINI_API_KEY="your-key"
```

Get API key: https://aistudio.google.com/app/apikey

## 🏃 Running the App

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🧪 Testing Different Modes

### Text to Video (Default)
```bash
# Just run the app and type a prompt!
npm run dev
# → Type: "A sunset over mountains"
```

### Image to Video
```bash
# Run app → Click "+ Image" → Generate or upload
```

### Frames to Video
```bash
# Run app → Mode selector → "Frames to Video"
# → Upload start frame (and optional end frame)
```

### References to Video
```bash
# Run app → Mode selector → "References to Video"  
# → Upload 1-3 reference images
```

## 🗂️ Project Structure

```bash
# View structure
tree -L 3 -I 'node_modules|.next'

# Or manually:
ls -la gallery/
```

## 🔍 Useful Commands

```bash
# Check TypeScript errors
cd gallery && npx tsc --noEmit

# Format code (if prettier installed)
npx prettier --write .

# Check bundle size
npm run build && du -sh .next/

# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json && npm install

# Check for outdated packages
npm outdated

# Update packages (careful!)
npm update
```

## 🐛 Debugging

```bash
# Check if API key is set
cat .env.local

# Verify environment variables loaded
npm run dev
# Check console: process.env.GEMINI_API_KEY

# Clear browser storage (if gallery issues)
# In browser console:
# indexedDB.deleteDatabase('veo-gallery-db')
# localStorage.clear()

# Check network requests
# Open DevTools → Network tab → Filter: "api"
```

## 📊 Development Tools

```bash
# Install React DevTools
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools

# View Context values in DevTools
# Components tab → Find VideoGenerationProvider/GalleryProvider

# Check IndexedDB
# DevTools → Application tab → IndexedDB → veo-gallery-db
```

## 🔧 Maintenance

```bash
# Update @google/genai
npm install @google/genai@latest

# Update Next.js
npm install next@latest react@latest react-dom@latest

# Update all dependencies (risky!)
npm update --save

# Check security vulnerabilities
npm audit

# Fix vulnerabilities (if any)
npm audit fix
```

## 📝 Git Commands (if version controlling)

```bash
# Initialize git (if not already)
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules
.next
.env.local
*.log
.DS_Store
EOF

# Initial commit
git add .
git commit -m "feat: unified veo studio and gallery"

# Create branch for changes
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: your feature description"
```

## 🎨 Customization

```bash
# Edit colors in globals.css
nano gallery/app/globals.css

# Edit component styles
nano gallery/components/ui/UnifiedComposer.tsx

# Modify generation defaults
nano gallery/contexts/VideoGenerationContext.tsx
```

## 📚 Documentation

```bash
# View main README
cat gallery/README.md

# View detailed docs
cat gallery/README-UNIFIED.md

# View setup guide
cat gallery/SETUP-GUIDE.md

# View changelog
cat gallery/CHANGELOG.md

# View this integration summary
cat INTEGRATION-SUMMARY.md
```

## 🚨 Troubleshooting

```bash
# Port 3000 already in use?
npm run dev -- -p 3001  # Use port 3001 instead

# Permission errors?
sudo npm install  # (not recommended, fix permissions instead)

# Module not found?
rm -rf node_modules package-lock.json
npm install

# Build errors?
rm -rf .next
npm run build

# TypeScript errors?
npm install --save-dev @types/node @types/react @types/react-dom
```

## 🔄 Reset Everything

```bash
# Nuclear option - start fresh
cd gallery
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## 📦 Deployment

```bash
# Vercel (recommended for Next.js)
npx vercel

# Or build locally
npm run build
npm start

# Environment variables for production
# Add GEMINI_API_KEY in Vercel dashboard
# Settings → Environment Variables
```

## 🎯 Quick Testing

```bash
# Run and test text-to-video
npm run dev &
sleep 10
open http://localhost:3000

# Stop background process
pkill -f "next dev"
```

## 💾 Backup

```bash
# Backup your gallery database
# Export from browser:
# DevTools → Application → IndexedDB → veo-gallery-db
# Right-click → Export

# Backup environment
cp .env.local .env.backup

# Backup entire project
tar -czf veo-studio-backup-$(date +%Y%m%d).tar.gz gallery/
```

## 🆘 Emergency Commands

```bash
# Kill all node processes (if stuck)
pkill -9 node

# Force kill port 3000
lsof -ti:3000 | xargs kill -9

# Clear all Next.js data
rm -rf .next out node_modules/.cache

# Reinstall everything
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🎓 Learning

```bash
# Read component source
cat gallery/components/ui/UnifiedComposer.tsx | less

# Understand Context API
cat gallery/contexts/VideoGenerationContext.tsx

# Check API routes
cat gallery/app/api/veo/generate/route.ts

# View types
cat gallery/types/index.ts
```

## ✨ Productivity Tips

```bash
# Create alias for common command
echo 'alias veo="cd ~/path/to/gallery && npm run dev"' >> ~/.bashrc
source ~/.bashrc
# Now just type: veo

# Watch for changes (already built into npm run dev)
# But for custom scripts:
npx nodemon --watch app --exec "npm run build"

# Quick restart
# Ctrl+C then ↑ (up arrow) then Enter
```

---

## 📞 Need Help?

1. **Quick Start**: See `SETUP-GUIDE.md`
2. **Full Docs**: See `README-UNIFIED.md`  
3. **API Reference**: In `README-UNIFIED.md` → API Reference section
4. **Troubleshooting**: In `README-UNIFIED.md` → Troubleshooting section

---

**Happy coding! 🎬✨**

