# 🎨 CREATIVE STUDIO AI

**Voice-Powered Creative Platform**

*The world's first conversational content creation platform combining Gemini Live + Imagen 4 + Veo 3*

---

## ✨ **What is This?**

CREATIVE STUDIO AI is a revolutionary platform that lets you create professional images and videos through natural conversation with AI. Talk with Gemini Live to brainstorm ideas, refine your vision, and generate stunning content in minutes.

---

## 🚀 **Features**

- **🎤 Voice Brainstorming** - Natural conversations with Gemini Live AI
- **🎨 Image Generation** - Professional images in 10 seconds (Imagen 4)
- **🎬 Video Generation** - Cinematic videos in 2-3 minutes (Veo 3)
- **🔄 Image-to-Video** - Convert any image to animated video
- **📚 Gallery** - Manage all your creations
- **🧠 Context-Aware** - AI remembers your conversation to create better content

---

## 🛠️ **Quick Start**

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- UV package manager
- Google API key (Gemini/Imagen/Veo)
- Daily.co API key (for voice)

### **Installation**

```bash
# Install client dependencies
npm install

# Install server dependencies
cd server
uv sync
```

### **Configuration**

Create `.env.local` in root:
```env
GEMINI_API_KEY=your_google_api_key
BOT_START_URL=http://localhost:7860/start
```

Create `server/.env`:
```env
DAILY_API_KEY=your_daily_api_key
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_google_api_key
```

### **Run**

```bash
# Terminal 1: Start voice server
cd server
uv run creative_bot.py --transport daily

# Terminal 2: Start client
npm run dev
```

Open http://localhost:3000 (or the port shown)

---

## 🎯 **How to Use**

### **Option 1: Voice Brainstorming**
1. Click "Connect" in voice panel (left)
2. Say: "Help me create content for a product launch"
3. Have a conversation with AI to refine your idea
4. Say: "Generate that!"
5. Watch it create from your conversation

### **Option 2: Direct Creation**
1. Type prompt in main canvas
2. Click "Generate Image" or "Generate Video"
3. Get professional results

---

## 💰 **Business Model**

**Problem:** Creators waste 5+ hours creating 1 minute of content using $100-200/month in tools

**Solution:** One platform creates professional content in 15 minutes for $20/month

**Market:** $150 billion content creation industry, 50 million creators

---

## 🏆 **Technology Stack**

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Voice:** Pipecat AI, Gemini Live, Daily.co WebRTC
- **Generation:** Google Imagen 4, Google Veo 3
- **Storage:** IndexedDB for gallery

---

## 📝 **Project Structure**

```
creative-studio-ai/
├── app/              # Next.js application
├── components/       # React components
│   ├── voice/       # Voice panel UI
│   └── ui/          # Generation & gallery UI
├── contexts/        # State management
├── server/          # Pipecat voice bot
└── types/           # TypeScript definitions
```

---

## 🎬 **Demo Script**

**2-Minute Hackathon Demo:**

1. Show the integrated UI (voice + canvas)
2. Connect voice and have a brief conversation
3. Generate an image from conversation (10 seconds)
4. Show the gallery
5. Explain the business opportunity

---

## 🔑 **API Keys Needed**

1. **Google API Key** - https://ai.google.dev
   - Enables: Gemini Live, Imagen 4, Veo 3

2. **Daily.co API Key** - https://dashboard.daily.co
   - Enables: Voice conversation (optional)

---

## 🐛 **Troubleshooting**

**Chat not visible?**
- Refresh browser (Cmd+R or F5)
- Text is styled as 15px white on colored backgrounds

**Voice not working?**
- Allow microphone permission
- Use main canvas - works without voice!

**Clear gallery?**
- Browser console: `indexedDB.deleteDatabase('veo-gallery-db')`

---

## 📄 **License**

Apache 2.0

---

## 🤝 **Contributing**

This is a hackathon project showcasing the integration of Google's latest AI technologies.

---

**Built with ❤️ using Gemini Live + Imagen 4 + Veo 3**

🌐 **Live Demo:** http://localhost:3005 (when running locally)

🏆 **Status:** Ready to win hackathons!
