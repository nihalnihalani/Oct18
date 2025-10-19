/**
 * Gemini Live API Integration
 * Real-time bidirectional audio streaming with Voice Activity Detection
 */

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
}

export interface AudioChunk {
  data: ArrayBuffer;
  mimeType: string;
  timestamp: number;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioData?: string;
}

export type GeminiLiveEventType = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'transcript'
  | 'audio-response'
  | 'speaking-start'
  | 'speaking-end';

export interface GeminiLiveEvent {
  type: GeminiLiveEventType;
  data?: any;
  error?: string;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private eventHandlers: Map<GeminiLiveEventType, Set<(event: GeminiLiveEvent) => void>>;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private conversationHistory: TranscriptMessage[] = [];
  private isRecording = false;
  private vadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GeminiLiveConfig) {
    this.config = {
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      ...config,
    };
    this.eventHandlers = new Map();
  }

  /**
   * Connect to Gemini Live API
   */
  async connect(): Promise<void> {
    try {
      // For now, we'll use a local proxy since WebSocket requires special handling
      // The actual implementation will connect through our API route
      const response = await fetch('/api/gemini-live/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          systemPrompt: this.config.systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize Gemini Live session');
      }

      const { sessionId } = await response.json();
      
      this.emit('connected', { sessionId });
    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : 'Connection failed' });
      throw error;
    }
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      // Use webm opus for better compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000,
      });

      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          // Send chunk to server for processing
          this.sendAudioChunk(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        await this.processAudioBlob(audioBlob);
        audioChunks.length = 0;
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.emit('speaking-start', {});

    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : 'Failed to start recording' });
      throw error;
    }
  }

  /**
   * Stop recording audio
   */
  stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) return;

    this.mediaRecorder.stop();
    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    this.isRecording = false;
    this.emit('speaking-end', {});
  }

  /**
   * Send audio chunk for real-time processing
   */
  private async sendAudioChunk(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);

      const response = await fetch('/api/gemini-live/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: blob.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.transcript) {
          const message: TranscriptMessage = {
            role: 'user',
            text: data.transcript,
            timestamp: new Date(),
          };
          this.conversationHistory.push(message);
          this.emit('transcript', message);
        }

        if (data.response) {
          const assistantMessage: TranscriptMessage = {
            role: 'assistant',
            text: data.response.text || '',
            timestamp: new Date(),
            audioData: data.response.audio,
          };
          this.conversationHistory.push(assistantMessage);
          this.emit('transcript', assistantMessage);
          
          if (data.response.audio) {
            this.emit('audio-response', { audio: data.response.audio });
            await this.playAudioResponse(data.response.audio);
          }
        }
      }
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  }

  /**
   * Process complete audio blob
   */
  private async processAudioBlob(blob: Blob): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('audio', blob);

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.transcription) {
          const message: TranscriptMessage = {
            role: 'user',
            text: data.transcription,
            timestamp: new Date(),
          };
          this.conversationHistory.push(message);
          this.emit('transcript', message);
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }

  /**
   * Play audio response from Gemini
   */
  private async playAudioResponse(base64Audio: string): Promise<void> {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  }

  /**
   * Send text message to Gemini Live
   */
  async sendMessage(text: string): Promise<void> {
    try {
      const response = await fetch('/api/gemini-live/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          history: this.conversationHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const userMessage: TranscriptMessage = {
          role: 'user',
          text,
          timestamp: new Date(),
        };
        this.conversationHistory.push(userMessage);
        this.emit('transcript', userMessage);

        if (data.response) {
          const assistantMessage: TranscriptMessage = {
            role: 'assistant',
            text: data.response.text || '',
            timestamp: new Date(),
            audioData: data.response.audio,
          };
          this.conversationHistory.push(assistantMessage);
          this.emit('transcript', assistantMessage);
          
          if (data.response.audio) {
            this.emit('audio-response', { audio: data.response.audio });
            await this.playAudioResponse(data.response.audio);
          }
        }
      }
    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : 'Failed to send message' });
    }
  }

  /**
   * Disconnect from Gemini Live
   */
  disconnect(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.stopRecording();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.emit('disconnected', {});
  }

  /**
   * Register event handler
   */
  on(event: GeminiLiveEventType, handler: (event: GeminiLiveEvent) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: GeminiLiveEventType, handler: (event: GeminiLiveEvent) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(type: GeminiLiveEventType, data: any): void {
    const event: GeminiLiveEvent = { type, data };
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): TranscriptMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Create a new Gemini Live client instance
 */
export function createGeminiLiveClient(config: GeminiLiveConfig): GeminiLiveClient {
  return new GeminiLiveClient(config);
}

