# 🎬 Veo 3 Studio Pro - Unified AI Video Generation Platform

A comprehensive Next.js application combining the best features of Veo Studio and Gallery, providing advanced AI video generation with Google's Veo 3 and Imagen 4 APIs.

![Veo 3 Studio Pro](./public/example.png)

## 🌟 Key Features

### 🎥 Multiple Generation Modes
- **Text to Video**: Generate videos from text descriptions
- **Image to Video**: Transform images into dynamic videos
- **Frames to Video**: Create videos from start and end frames
- **References to Video**: Use reference images for style and content
- **Video Extension**: Continue existing 720p videos (coming soon)

### 🖼️ Image Generation & Editing
- Generate images with Imagen 4 (Gemini 2.5 Flash)
- Direct integration with video generation pipeline
- Upload or generate images inline

### 📚 Persistent Gallery
- IndexedDB-powered local storage
- Grid and list view modes
- Filter by type (images/videos)
- Sort by date or type
- Download and manage all generated content

### ✂️ Advanced Video Editing
- In-browser video trimming
- Custom time range selection
- Export trimmed sections
- No server-side processing required

### 🎨 Advanced Controls
- Multiple Veo models (3.0, 3.1, Fast variants)
- Aspect ratio control (16:9, 9:16)
- Resolution selection (720p, 1080p)
- Negative prompts support
- Looping video generation

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15.3.5 with App Router
- **React**: 19.0.0
- **API Integration**: @google/genai v1.22.0
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Storage**: IndexedDB for persistence
- **Video Processing**: MediaRecorder API (client-side)

### Project Structure

```
gallery/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── imagen/generate/    # Image generation
│   │   └── veo/
│   │       ├── generate/       # Video generation (all modes)
│   │       ├── operation/      # Poll status
│   │       └── download/       # Proxy download
│   ├── page.tsx               # Main unified application
│   ├── layout.tsx             # Root layout with error boundary
│   └── globals.css            # Tailwind + animations
├── components/
│   ├── ui/
│   │   ├── UnifiedComposer.tsx    # Multi-mode composer
│   │   ├── VideoPlayer.tsx        # Player with trimming
│   │   └── VeoGallery.tsx         # Gallery management
│   └── ErrorBoundary.tsx          # Error handling
├── contexts/
│   ├── VideoGenerationContext.tsx # Generation state
│   └── GalleryContext.tsx         # Gallery + IndexedDB
├── types/
│   └── index.ts                   # TypeScript definitions
└── lib/
    ├── mockGalleryItems.ts        # Sample content
    └── utils.ts                   # Utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- **Gemini API Key** with paid tier access ([Get one here](https://aistudio.google.com/app/apikey))

> ⚠️ **Important**: Veo 3 and Imagen 4 require a paid Google Cloud billing account.

### Installation

1. **Clone and Install**
   ```bash
   cd gallery
   npm install
   ```

2. **Configure API Key**
   
   Create a `.env.local` file in the `gallery` directory:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Text to Video Generation
1. Select "Text to Video" mode (default)
2. Enter a detailed prompt
3. Optionally adjust model, aspect ratio, and resolution in advanced settings
4. Click generate button

### Image to Video Generation
1. Click the "Image" button to open image tools
2. Either:
   - Generate an image with Imagen by describing it
   - Upload an existing image
3. Enter a video prompt describing the motion/action
4. Click generate button

### Frames to Video
1. Select "Frames to Video" mode
2. Upload a start frame
3. Optionally upload an end frame (or enable looping)
4. Add motion description (optional)
5. Generate

### References to Video
1. Select "References to Video" mode
2. Upload up to 3 reference images (for content/assets)
3. Optionally add a style image
4. Describe the desired video
5. Generate

### Video Trimming
1. After video generation, the player shows advanced controls
2. Click the scissors icon to show the trim bar
3. Drag the handles to select time range
4. Click "Cut" to trim
5. Download the trimmed video

### Gallery Management
1. Click "Gallery" to open the persistent gallery
2. View all generated content (images & videos)
3. Filter by type (all/image/video)
4. Sort by newest, oldest, or type
5. Actions: View, Download, Edit (regenerate), Delete

## 🎨 UI/UX Features

### Modern Design
- Animated gradient backgrounds
- Glass morphism effects
- Smooth transitions and animations
- Responsive design (mobile-first)
- Dark theme optimized

### User Experience
- Real-time generation status
- Progress indicators with fun messages
- Error boundaries for graceful failure handling
- Persistent storage (survives page refreshes)
- Intuitive mode switching
- Keyboard shortcuts support

## 🔧 Advanced Configuration

### Model Selection
```typescript
VeoModel.VEO_3_0            // Standard quality
VeoModel.VEO_3_0_FAST       // Faster generation
VeoModel.VEO_3_1            // Latest model
VeoModel.VEO_3_1_FAST       // Latest + faster
VeoModel.VEO_2_0            // Legacy model
```

### Aspect Ratios
- **16:9** (Landscape) - Default, best for most content
- **9:16** (Portrait) - Ideal for mobile/social media

### Resolution Options
- **720p** - Faster, supports video extension
- **1080p** - Higher quality, larger files

### Generation Modes

| Mode | Required Inputs | Optional Inputs | Use Case |
|------|----------------|-----------------|----------|
| Text to Video | Prompt | Negative prompt | General video generation |
| Image to Video | Prompt + Image | - | Animate still images |
| Frames to Video | Start frame | End frame, Looping | Interpolate between frames |
| References to Video | Prompt + References | Style image | Consistent character/style |
| Extend Video | Input video (720p) | Prompt | Continue existing videos |

## 🔐 Security & Privacy

### API Key Protection
- API key stored server-side only (never exposed to client)
- Requests proxied through Next.js API routes
- CORS handling automatic

### Data Storage
- Gallery data stored locally in IndexedDB
- No server-side storage required
- Videos stored as blob URLs (client-side only)
- Clear data anytime by clearing browser storage

## 🐛 Troubleshooting

### Common Issues

**"API key not set" error**
- Ensure `.env.local` exists in the `gallery` directory
- Verify the key is valid and has billing enabled
- Restart the dev server after adding the key

**Video generation fails**
- Check that you're on the paid tier
- Verify prompt isn't empty
- Check console for detailed error messages
- Try a different model or lower resolution

**Gallery doesn't persist**
- Check browser supports IndexedDB
- Verify not in incognito/private mode
- Clear browser cache and try again

**Video won't trim**
- Ensure browser supports MediaRecorder API
- Try downloading original and trimming locally
- Check console for specific errors

**Image generation fails**
- Verify API key has Imagen access
- Check prompt isn't too long (max ~1000 chars)
- Try simplifying the prompt

### Browser Compatibility

**Recommended:**
- Chrome 90+
- Edge 90+
- Safari 15+
- Firefox 88+

**Required Features:**
- IndexedDB
- MediaRecorder API
- Blob URLs
- ES2020+

## 📊 Performance Tips

### Optimization Strategies
1. **Resolution**: Use 720p for faster generation
2. **Model**: Use "fast" variants when quality isn't critical
3. **Prompt Length**: Keep prompts concise (200-500 chars ideal)
4. **References**: Limit to 1-2 reference images when possible
5. **Gallery**: Periodically clear old items to free storage

### Resource Management
- Videos automatically cleaned up when closing player
- Gallery items persist but can be manually deleted
- Blob URLs revoked when no longer needed
- IndexedDB limited by browser quota (typically 50-100GB)

## 🎯 Best Practices

### Prompt Engineering
```
Good: "A professional chef expertly flipping vegetables in a wok, 
       close-up shot, steam rising, warm kitchen lighting, 
       cinematic style"

Bad: "chef cooking food"
```

### Image to Video
- Use high-quality source images (1024x1024+)
- Describe the desired motion clearly
- Start with simple motions before complex ones

### Frames to Video
- Ensure frames are similar in composition
- Use for subtle motion interpolation
- Enable looping for seamless animations

### References to Video
- Use consistent art style in references
- Separate content refs from style refs
- Describe how elements should move/interact

## 🤝 Contributing

This project combines features from:
- **gallery**: Next.js gallery with video player and UI/UX
- **veo-studio**: Advanced generation modes and controls

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 API Reference

### Generate Video
```typescript
POST /api/veo/generate
Content-Type: multipart/form-data

Fields:
- prompt: string
- model: VeoModel
- aspectRatio: AspectRatio
- resolution: Resolution
- mode: GenerationMode
- negativePrompt?: string
- imageFile?: File (for IMAGE_TO_VIDEO)
- startFrame?: File (for FRAMES_TO_VIDEO)
- endFrame?: File (for FRAMES_TO_VIDEO)
- isLooping?: boolean (for FRAMES_TO_VIDEO)
- referenceImage0..N?: File (for REFERENCES_TO_VIDEO)
- styleImage?: File (for REFERENCES_TO_VIDEO)
- inputVideoUri?: string (for EXTEND_VIDEO)

Returns: { name: string } // Operation name for polling
```

### Poll Operation
```typescript
POST /api/veo/operation
Content-Type: application/json
Body: { name: string }

Returns: {
  done: boolean,
  response?: {
    generatedVideos: [{
      video: { uri: string }
    }]
  }
}
```

### Download Video
```typescript
POST /api/veo/download
Content-Type: application/json
Body: { uri: string }

Returns: video/mp4 blob
```

### Generate Image
```typescript
POST /api/imagen/generate
Content-Type: application/json
Body: { prompt: string }

Returns: {
  image: {
    imageBytes: string (base64),
    mimeType: string
  },
  text?: string
}
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI/Gemini Team for Veo 3 and Imagen 4 APIs
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review [Veo 3 Documentation](https://ai.google.dev/gemini-api/docs/video)
- Review [Imagen 4 Documentation](https://ai.google.dev/gemini-api/docs/imagen)
- Open an issue on GitHub

## 🔮 Roadmap

- [ ] Video extension mode implementation
- [ ] Batch generation support
- [ ] Export gallery as JSON
- [ ] Cloud storage integration
- [ ] Collaborative features
- [ ] Animation presets
- [ ] Style transfer improvements
- [ ] Mobile app companion

---

**Made with ❤️ combining the best of Veo Studio + Gallery**

Start creating amazing AI-generated videos today! 🎬✨

