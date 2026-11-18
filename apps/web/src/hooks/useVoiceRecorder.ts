import { useState, useRef, useCallback, useEffect } from 'react';

export interface RecordedAudioData {
  base64: string;
  mimeType: string;
  durationSec: number;
}

/**
 * Encodes Float32 mono PCM samples to a 16-bit 16kHz WAV Blob.
 */
function encodeWav(samples: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(v: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  // Subchunk 1 (fmt)
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * 1 * 16/8)
  view.setUint16(32, 2, true); // BlockAlign (1 * 16/8)
  view.setUint16(34, 16, true); // BitsPerSample (16)
  // Subchunk 2 (data)
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Convert Float32 [-1.0, 1.0] to 16-bit signed integer [-32768, 32767]
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Resamples an array of Float32 audio samples to target sample rate (16kHz).
 */
function downsampleBuffer(buffer: Float32Array, inputRate: number, targetRate = 16000): Float32Array {
  if (inputRate === targetRate) return buffer;
  if (inputRate < targetRate) return buffer;

  const ratio = inputRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputRef.current) {
      inputRef.current.disconnect();
      inputRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];
    setDurationSec(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Microphone access is not supported in this browser.');
      return false;
    }

    try {
      cleanupAudio();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const input = audioContext.createMediaStreamSource(stream);
      inputRef.current = input;

      // 4096 buffer size, 1 input channel, 1 output channel
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Copy chunk
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      input.connect(processor);
      processor.connect(audioContext.destination);

      startTimeRef.current = Date.now();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDurationSec(elapsed);

        // 30 second limit per specification A6
        if (elapsed >= 30) {
          stopRecording();
        }
      }, 500);

      return true;
    } catch (err: any) {
      cleanupAudio();
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
        : `Could not access microphone: ${err.message || 'Unknown error'}`;
      setError(msg);
      setIsRecording(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<RecordedAudioData | null> => {
    if (!isRecording && audioChunksRef.current.length === 0) {
      return null;
    }

    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const inputSampleRate = audioContextRef.current?.sampleRate || 44100;
    const recordedChunks = [...audioChunksRef.current];

    cleanupAudio();
    setIsRecording(false);

    if (recordedChunks.length === 0) {
      return null;
    }

    // Merge Float32 chunks
    const totalLength = recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of recordedChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Downsample to 16,000 Hz Mono (required by Gnani STT)
    const downsampled = downsampleBuffer(merged, inputSampleRate, 16000);

    // Encode to standard 16-bit 16kHz Mono WAV
    const wavBlob = encodeWav(downsampled, 16000);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || '';
        resolve({
          base64,
          mimeType: 'audio/wav',
          durationSec: duration,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(wavBlob);
    });
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    cleanupAudio();
    audioChunksRef.current = [];
    setIsRecording(false);
    setDurationSec(0);
  }, []);

  return {
    isRecording,
    durationSec,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
