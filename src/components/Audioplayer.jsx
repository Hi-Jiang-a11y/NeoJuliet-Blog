// src/components/AudioPlayer.jsx
import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="player-container">
      <audio ref={audioRef} src="/assets/music/test.wav" preload="auto" />
      <button onClick={togglePlay} className="player-button">
        {playing ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}

