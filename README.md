# 🎬 Veo 3 Studio - AI Video Generation Platform

A comprehensive AI-powered video generation platform built with Next.js, React, and Google's Gemini API featuring Veo 3 video generation and advanced voice integration.

## ✨ Features

### 🎥 **Video Generation**
- **Veo 3 Integration**: Generate high-quality videos using Google's latest Veo 3 model
- **Multiple Models**: Support for Veo 3, Veo 3 Fast, and Veo 2 models
- **Aspect Ratio Control**: Customize video dimensions (16:9, 9:16, 1:1)
- **Image-to-Video**: Upload images or generate with Imagen 3.0 for video creation

### 🎤 **Voice Integration**
- **Speech-to-Text**: Real-time voice recording with Gemini-powered transcription
- **Voice Editing**: Add voice prompts to enhance video descriptions
- **Seamless Workflow**: Voice input automatically appends to text prompts

### 🖼️ **Image Generation**
- **Imagen 3.0**: Generate images using Google's Imagen model
- **Image Enhancement**: Use generated images as starting points for videos
- **Multiple Formats**: Support for PNG, JPG, WEBP formats

### 🎨 **Modern UI/UX**
- **Dark Theme**: Sleek, modern dark interface
- **Responsive Design**: Works perfectly on desktop and mobile
- **Glassmorphism Effects**: Beautiful backdrop blur and transparency
- **Smooth Animations**: Custom CSS animations and transitions
- **Product Gallery**: Comprehensive gallery with filtering and sorting

### 🔧 **Advanced Features**
- **Video Trimming**: In-browser video editing and trimming
- **Download Support**: Download generated videos and images
- **Real-time Polling**: Live status updates during video generation
- **Error Handling**: Comprehensive error management and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key (Paid tier required for Veo 3)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nihalnihalani/SEC-hacakthon.git
   cd SEC-hacakthon
   ```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── veo/                  # Veo 3 video generation
│   │   ├── imagen/               # Imagen image generation
│   │   └── voice/                # Voice transcription
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application
├── components/                    # React components
│   └── ui/                       # UI components
│       ├── Composer.tsx          # Main input interface
│       ├── VideoPlayer.tsx       # Video player with controls
│       ├── VeoGallery.tsx        # Product gallery
│       ├── EditVideoPage.tsx     # Video editing with voice
│       └── ModelSelector.tsx     # Model selection
├── lib/                          # Utility functions
│   ├── mockGalleryItems.ts       # Sample gallery data
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
└── veo-3-gallery/               # Reference gallery implementation
```

## 🔌 API Endpoints

### Video Generation
- `POST /api/veo/generate` - Start video generation
- `POST /api/veo/operation` - Check generation status
- `POST /api/veo/download` - Download generated video
- `POST /api/veo/regenerate` - Regenerate video with new prompt

### Image Generation
- `POST /api/imagen/generate` - Generate images with Imagen 3.0

### Voice Integration
- `POST /api/voice/transcribe` - Transcribe audio to text using Gemini

## 🎯 Usage Examples

### Generate a Video
1. Enter a detailed prompt describing your video
2. Select your preferred model (Veo 3, Veo 3 Fast, or Veo 2)
3. Choose aspect ratio if needed
4. Click "Generate" and wait for completion
5. Play, download, or edit the generated video

### Use Voice Input
1. Click "Edit" on any video in the gallery
2. Click the "Voice" button to start recording
3. Speak your additional prompt
4. Click "Stop" to transcribe automatically
5. The transcribed text will be appended to your prompt
6. Generate a new video with the enhanced prompt

### Create Image-to-Video
1. Click the "Image" button in the composer
2. Either upload an image or generate one with Imagen
3. Add a text prompt describing the video
4. Generate your video using the image as a starting point

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom animations
- **AI Integration**: Google Gemini API (@google/genai)
- **Video Processing**: MediaRecorder API, react-player
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔐 Security & Privacy

- API keys are stored securely in environment variables
- No user data is stored permanently
- All API calls are made server-side for security
- Voice recordings are processed locally and not stored

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API team for Veo 3 and Imagen models
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community for inspiration and tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/nihalnihalani/SEC-hacakthon/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Built with ❤️ for the SEC Hackathon**

*This project demonstrates advanced AI integration, modern web development practices, and innovative user experience design.*