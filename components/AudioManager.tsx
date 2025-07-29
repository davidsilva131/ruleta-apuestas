'use client'
import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  spinning: boolean;
  result: 'win' | 'lose' | null;
}

const AudioManager: React.FC<AudioManagerProps> = ({ spinning, result }) => {
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear elementos de audio si no existen
    if (typeof window !== 'undefined') {
      if (!spinSoundRef.current) {
        spinSoundRef.current = new Audio('/sounds/spin.mp3');
        spinSoundRef.current.loop = true;
        spinSoundRef.current.volume = 0.3;
      }
      
      if (!winSoundRef.current) {
        winSoundRef.current = new Audio('/sounds/win.mp3');
        winSoundRef.current.volume = 0.5;
      }
      
      if (!loseSoundRef.current) {
        loseSoundRef.current = new Audio('/sounds/lose.mp3');
        loseSoundRef.current.volume = 0.4;
      }
    }
  }, []);

  useEffect(() => {
    if (spinning && spinSoundRef.current) {
      spinSoundRef.current.play().catch(console.error);
    } else if (!spinning && spinSoundRef.current) {
      spinSoundRef.current.pause();
      spinSoundRef.current.currentTime = 0;
    }
  }, [spinning]);

  useEffect(() => {
    if (!spinning && result) {
      if (result === 'win' && winSoundRef.current) {
        winSoundRef.current.play().catch(console.error);
      } else if (result === 'lose' && loseSoundRef.current) {
        loseSoundRef.current.play().catch(console.error);
      }
    }
  }, [spinning, result]);

  return null; // Este componente no renderiza nada visual
};

export default AudioManager;
