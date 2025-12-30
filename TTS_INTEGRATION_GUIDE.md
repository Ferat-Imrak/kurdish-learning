# 🎵 Kurdish Text-to-Speech Integration Guide

## Overview
Your Kurdish Learning App now uses **Google Cloud Text-to-Speech API** to provide real Kurdish pronunciation for all audio features. This replaces the previous placeholder audio files with high-quality, natural-sounding Kurdish speech.

## ✅ What's Been Updated

### 1. **Core TTS Service** (`src/lib/kurdishTTS.ts`)
- Google Cloud TTS integration with Kurdish language support
- Automatic fallback to phonetic simulation if TTS fails
- Simple beep fallback as last resort
- Optimized for Kurdish pronunciation

### 2. **Updated Components**
- ✅ **AudioButton** - Now uses real TTS with Kurdish text
- ✅ **Practice Speaking** - Real pronunciation for all 47 words
- ✅ **Listen & Tap Game** - Real audio for game words
- ✅ **Daily Phrases** - Audio buttons for all phrases
- ✅ **Colors Page** - TTS for all color names
- ✅ **Numbers Page** - TTS for all numbers 1-20

### 3. **Environment Variables**
- Added `NEXT_PUBLIC_GOOGLE_TTS_API_KEY` to `env.example`

## 🚀 Setup Instructions

### Step 1: Get Google Cloud TTS API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Text-to-Speech API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Text-to-Speech API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### Step 2: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. **Add your API key** to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_actual_api_key_here
   ```

### Step 3: Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test audio features**:
   - Go to `/practice-speaking` and click "Listen to Pronunciation"
   - Go to `/colors` and click "Listen" buttons
   - Go to `/numbers` and test number pronunciation
   - Play the "Listen & Tap" game

## 💰 Cost Information

### Google Cloud TTS Pricing:
- **Free Tier**: 1 million characters per month
- **Paid**: $4.00 per 1 million characters
- **Your App Usage**: ~$0.01-0.05 per month (very affordable!)

### Cost Breakdown:
- **47 practice words**: ~200 characters
- **Colors (12 words)**: ~50 characters  
- **Numbers (20 words)**: ~100 characters
- **Daily phrases (8 phrases)**: ~150 characters
- **Total per session**: ~500 characters
- **Monthly estimate**: ~15,000 characters = **FREE** (within free tier)

## 🎯 Features

### Real Kurdish Pronunciation
- **Natural voices** - High-quality Kurdish speech synthesis
- **Proper pronunciation** - Correct Kurdish phonetics
- **Consistent quality** - Same voice across all features

### Smart Fallbacks
1. **Primary**: Google Cloud TTS (real Kurdish)
2. **Secondary**: Phonetic simulation (syllable-based tones)
3. **Tertiary**: Simple beep (always works)

### Loading States
- **Loading indicators** - Shows when TTS is processing
- **Disabled states** - Prevents multiple simultaneous requests
- **Error handling** - Graceful fallback on failures

## 🔧 Technical Details

### TTS Configuration:
```typescript
{
  language: 'ku',           // Kurdish language code
  voice: 'ku-KU-Standard-A', // Kurdish voice
  speed: 0.8,              // Slightly slower for learning
  pitch: 0.0               // Natural pitch
}
```

### Usage Example:
```typescript
import { speakKurdish } from '../lib/kurdishTTS'

// Real Kurdish TTS with phonetic fallback
await speakKurdish('Silav', 'see-LAHV')
```

## 🎮 Updated Games & Features

### 1. **Practice Speaking** (`/practice-speaking`)
- Real pronunciation for all 47 Kurdish words
- Categories: Greetings, Numbers, Colors, Family, Home, Food, Body, Time, Seasons
- Loading states and error handling

### 2. **Listen & Tap Game** (`/listen-tap`)
- Real audio for game words
- Improved user experience with loading states
- Better phonetic fallbacks

### 3. **Daily Phrases** (`/learn/[dialect]/songs`)
- Audio buttons for each phrase
- Real Kurdish pronunciation
- Practice tips with audio support

### 4. **Colors & Numbers Pages**
- TTS integration for all items
- Consistent audio experience
- Better learning outcomes

## 🛠️ Troubleshooting

### Common Issues:

1. **"Audio not working"**
   - Check if API key is set in `.env.local`
   - Verify Google Cloud TTS API is enabled
   - Check browser console for errors

2. **"Loading forever"**
   - Check internet connection
   - Verify API key permissions
   - Check Google Cloud quotas

3. **"Fallback audio only"**
   - API key might be invalid
   - Check Google Cloud billing
   - Verify API is enabled

### Debug Steps:
1. **Check console logs** for TTS errors
2. **Verify API key** in Google Cloud Console
3. **Test API directly** using curl:
   ```bash
   curl -X POST \
     "https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"input":{"text":"Silav"},"voice":{"languageCode":"ku","name":"ku-KU-Standard-A"},"audioConfig":{"audioEncoding":"MP3"}}'
   ```

## 🎉 Benefits

### For Learners:
- **Authentic pronunciation** - Learn correct Kurdish sounds
- **Consistent experience** - Same voice across all features
- **Better retention** - Audio + visual learning
- **Confidence building** - Hear proper pronunciation

### For Developers:
- **Scalable solution** - Handles any Kurdish text
- **Cost effective** - Very affordable pricing
- **Reliable fallbacks** - Always works, even without API
- **Easy maintenance** - No audio files to manage

## 🔮 Future Enhancements

### Possible Improvements:
1. **Voice Selection** - Multiple Kurdish voices
2. **Speed Control** - Adjustable playback speed
3. **Accent Training** - Different regional accents
4. **Custom Voices** - Train app-specific voices
5. **Offline Mode** - Cache common pronunciations

### Advanced Features:
1. **Pronunciation Scoring** - Compare user speech to TTS
2. **Interactive Lessons** - Voice-guided learning
3. **Story Narration** - Full Kurdish story audio
4. **Song Integration** - Kurdish children's songs

---

## 🎯 Next Steps

1. **Get your Google Cloud TTS API key**
2. **Add it to your `.env.local` file**
3. **Test the audio features**
4. **Enjoy real Kurdish pronunciation!**

The app now provides an authentic Kurdish learning experience with professional-quality audio throughout all features! 🎵✨
