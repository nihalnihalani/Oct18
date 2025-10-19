# 🚀 Quick Setup Guide - Veo 3 Studio Pro

## ⚡ 5-Minute Setup

### Step 1: Get Your API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. **Important**: Enable billing on your Google Cloud project
   - Veo 3 and Imagen 4 require paid tier
   - See [pricing details](https://ai.google.dev/gemini-api/docs/pricing#veo-3)

### Step 2: Install Dependencies
```bash
cd gallery
npm install
```

### Step 3: Configure Environment
Create `.env.local` in the `gallery` folder:
```env
GEMINI_API_KEY="AIza..."
```

### Step 4: Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 First Generation

### Try This Prompt
```
A serene sunset over a calm ocean, gentle waves lapping at the shore, 
birds flying in the distance, golden hour lighting, cinematic 4K quality
```

1. Paste the prompt in the text area
2. Click the arrow button (→)
3. Wait 1-2 minutes for generation
4. Your video appears in the player!

## 🎨 Try Image Generation

1. Click the **"+ Image"** button
2. In the image panel, type:
   ```
   A majestic mountain landscape with snow-capped peaks at sunrise
   ```
3. Click the wand icon to generate
4. Once generated, click the arrow (→) to turn it into a video!

## 📚 Gallery Usage

- All generated content automatically saved
- Click **"Gallery"** button to view history
- Gallery persists across page refreshes (IndexedDB)
- Download, delete, or regenerate any item

## 🎬 Advanced Mode Walkthrough

### Frames to Video
1. Click the mode selector (shows current mode)
2. Select "Frames to Video"
3. Upload a start frame (any image)
4. Either:
   - Upload end frame for interpolation
   - Enable "looping" for seamless loops
5. Describe motion (optional)
6. Generate!

**Example**: Upload a photo of a tree in summer as start frame, autumn as end frame, and watch it transition!

### References to Video
1. Select "References to Video" mode
2. Upload 1-3 reference images (character, object, scene)
3. Describe the action:
   ```
   The character walking through a magical forest, 
   camera following from behind
   ```
4. Generate with consistent style!

## ⚙️ Advanced Settings

Click the sparkle (✨) icon to reveal:
- **Model**: Choose quality vs speed
  - veo-3.1: Best quality
  - veo-3.1-fast: Faster generation
- **Aspect Ratio**: 16:9 or 9:16
- **Resolution**: 720p (faster) or 1080p (quality)

## ✂️ Video Trimming

After generation:
1. Click the scissors icon in the player
2. Drag the purple handles to select range
3. Click **"Cut"** to trim
4. Download trimmed version

## 🎨 Negative Prompts

To avoid unwanted elements:
```
Prompt: "A beautiful garden with flowers"
Negative: "people, text, watermark, blurry"
```

## 💡 Pro Tips

### Better Prompts
- **Be specific**: "Close-up shot" vs "shot"
- **Describe motion**: "Camera slowly zooming in"
- **Add lighting**: "Warm sunset lighting"
- **Set mood**: "Cinematic, dramatic"
- **Specify style**: "Photorealistic" or "Animated"

### Faster Generation
- Use "fast" model variants
- Choose 720p resolution
- Shorter prompts (200-300 chars)
- Simpler scenes generate faster

### Quality Results
- Use veo-3.1 (non-fast)
- 1080p resolution
- Detailed prompts with camera instructions
- Reference images for consistency

## 🐛 Quick Troubleshooting

**Generation Fails?**
- Check API key is valid and has billing
- Try simpler prompt
- Use 720p resolution
- Switch to different model

**Gallery Not Saving?**
- Not in incognito mode?
- Browser supports IndexedDB?
- Try Chrome or Edge

**Slow Performance?**
- Clear old gallery items
- Close other tabs
- Use "fast" model variants

## 📊 What's Using My Quota?

Each generation counts toward your API quota:
- **Video Generation**: ~$0.10-0.30 per generation (varies by duration/resolution)
- **Image Generation**: ~$0.01 per image
- See [official pricing](https://ai.google.dev/gemini-api/docs/pricing)

Monitor usage in [Google Cloud Console](https://console.cloud.google.com)

## 🎓 Learning Resources

### Example Prompts

**Cinematic Shot**
```
Aerial drone shot soaring over a misty mountain valley at dawn, 
rays of sunlight breaking through clouds, cinematic camera movement, 
high production value
```

**Action Scene**
```
Sports car drifting around a corner, tires smoking, 
dynamic camera angle tracking the motion, urban environment, 
high-energy action
```

**Nature Documentary**
```
Close-up of a hummingbird feeding from a bright red flower, 
slow motion, shallow depth of field, natural lighting, 
BBC Earth style
```

**Abstract/Creative**
```
Colorful paint splashing in slow motion against black background, 
vibrant reds and blues mixing, dramatic lighting, 
macro photography style
```

## 🌟 Community Tips

### From Other Users

1. **Start Simple**: Master text-to-video before advanced modes
2. **Study Examples**: Check the sample videos in gallery
3. **Iterate**: Generate multiple variations with slight prompt changes
4. **Combine Modes**: Generate image → Use in image-to-video
5. **Save Favorites**: Download before closing (auto-cleanup on close)

## 🔐 Privacy & Data

- **API Key**: Stored server-side only, never exposed
- **Generated Content**: Stored locally in your browser
- **No Cloud Storage**: Everything stays on your device
- **Clear Anytime**: Delete items from gallery or clear browser data

## ⚡ Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Start generation (when focused on prompt)
- `Escape`: Close video player or gallery
- `Space`: Play/pause video (when player focused)

## 📱 Mobile Usage

The app is responsive and works on mobile, but:
- Desktop recommended for best experience
- Mobile may have slower performance
- Trimming feature works best on desktop
- Gallery grid view optimized for larger screens

## 🎯 Next Steps

1. ✅ Complete first generation
2. ✅ Try different modes
3. ✅ Experiment with prompts
4. ✅ Explore gallery features
5. ✅ Try video trimming
6. ✅ Share your creations!

## 📞 Need Help?

- Check main [README-UNIFIED.md](./README-UNIFIED.md) for detailed docs
- Review [troubleshooting section](./README-UNIFIED.md#-troubleshooting)
- Check [Gemini API docs](https://ai.google.dev/gemini-api/docs)

---

**Happy creating! 🎬✨**

Start with simple prompts and work your way up to complex scenes!

