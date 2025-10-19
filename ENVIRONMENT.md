# 🔐 Environment Setup Guide

Complete guide for configuring environment variables for Veo 3 Studio Pro.

---

## 📋 Required Environment Variables

### Create `.env.local` File

In the project root, create a file named `.env.local` with the following content:

```bash
# Google Gemini API Key (Required)
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Client-side API key for more reliable generation
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

---

## 🔑 Getting Your API Key

### Step 1: Get Gemini API Key

1. Visit: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the generated API key

### Step 2: Enable Billing

⚠️ **Important**: Veo 3 is a paid-only model

1. Go to Google Cloud Console
2. Select your project
3. Enable billing for the project
4. Visit: https://ai.google.dev/gemini-api/docs/billing

### Step 3: Verify Permissions

Ensure your API key has access to:
- ✅ Generative Language API
- ✅ Veo 3 video generation
- ✅ Imagen image generation

---

## 💰 Pricing Information

### Veo 3 Pricing

**Standard Rates** (as of October 2025):

| Model | Price per Second |
|-------|------------------|
| Veo 3.1 | ~$0.15/sec |
| Veo 3.1 Fast | ~$0.10/sec |
| Veo 3.0 | ~$0.12/sec |
| Veo 3.0 Fast | ~$0.08/sec |

**Example Costs:**
- 5-second video (Veo 3.1 Fast): ~$0.50
- 10-second video (Veo 3.1): ~$1.50
- 5-second video (Veo 3.0 Fast): ~$0.40

### Imagen 4 Pricing

- **Images**: ~$0.04 per image
- **Fast generation**: Usually <10 seconds

**💡 Tip**: Start with Veo 3.1 Fast for best balance of speed, quality, and cost.

For latest pricing: https://ai.google.dev/gemini-api/docs/pricing

---

## 🔧 Environment Variable Details

### `GEMINI_API_KEY` (Required)

**Purpose**: Server-side API calls  
**Used for**:
- Video generation requests
- Operation polling
- Video downloads
- Image generation

**Security**: 
- Never exposed to client
- Stays on server
- Secure for production

### `NEXT_PUBLIC_GEMINI_API_KEY` (Optional)

**Purpose**: Client-side generation (more reliable)  
**Used for**:
- Direct client-to-API communication
- Bypasses server-side limitations
- Faster response times

**Note**: 
- Exposed to client browser
- Use with caution in production
- Can use same key as GEMINI_API_KEY
- Falls back to server-side if not provided

---

## 🌍 Different Environments

### Development (Local)

File: `.env.local`
```bash
GEMINI_API_KEY=your_dev_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_dev_api_key
```

### Production (Vercel)

Add in Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `GEMINI_API_KEY` = your_api_key
   - `NEXT_PUBLIC_GEMINI_API_KEY` = your_api_key (optional)
4. Redeploy

### Production (Railway)

```bash
railway variables set GEMINI_API_KEY=your_api_key
railway variables set NEXT_PUBLIC_GEMINI_API_KEY=your_api_key
```

### Production (Netlify)

Add in Netlify Dashboard:
1. Site settings → Environment variables
2. Add variables:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY` (optional)

---

## ✅ Verification Checklist

After setting up your environment:

- [ ] `.env.local` file created in project root
- [ ] `GEMINI_API_KEY` added with valid API key
- [ ] Optional: `NEXT_PUBLIC_GEMINI_API_KEY` added
- [ ] API key is from a billing-enabled project
- [ ] Generative Language API is enabled
- [ ] Server running: `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] "API Connected" indicator shows in header
- [ ] Generate test video to verify

---

## 🐛 Troubleshooting Environment Issues

### Issue: "API Key Not Found"

**Check:**
```bash
# Verify .env.local exists
ls -la .env.local

# Verify content (don't share publicly!)
cat .env.local
```

**Solution:**
- Ensure file is named exactly `.env.local`
- No spaces around `=`
- API key is on same line

### Issue: "Permission Denied"

**Check:**
- Is billing enabled on your Google Cloud project?
- Does your API key have Generative Language API access?
- Is the API enabled for your project?

**Solution:**
Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

### Issue: "401 Unauthorized"

**Likely Cause**: API key is invalid or revoked

**Solution:**
1. Generate new API key: https://aistudio.google.com/apikey
2. Update `.env.local`
3. Restart server: `npm run dev`

---

## 📖 Additional Resources

### Official Documentation
- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **Veo 3 Guide**: https://ai.google.dev/gemini-api/docs/veo
- **Imagen Guide**: https://ai.google.dev/gemini-api/docs/imagen
- **Pricing**: https://ai.google.dev/gemini-api/docs/pricing

### Video Tutorials
- **Getting API Key**: https://ai.google.dev/gemini-api/docs/api-key
- **Enabling Billing**: https://ai.google.dev/gemini-api/docs/billing

---

## ⚡ Quick Reference

### Minimal Setup (Copy-Paste Ready)

```bash
# Create environment file
cat > .env.local << 'EOF'
GEMINI_API_KEY=paste_your_key_here
NEXT_PUBLIC_GEMINI_API_KEY=paste_your_key_here
EOF

# Install and run
npm install && npm run dev
```

Replace `paste_your_key_here` with your actual API key!

---

## 🎊 You're All Set!

Once your environment is configured:
1. ✅ API keys are set
2. ✅ Billing is enabled
3. ✅ Server is running
4. ✅ **Start creating amazing videos!**

**Return to**: [Main README](README.md)

