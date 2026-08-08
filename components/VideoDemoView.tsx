import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, ChefHat, Flame, Award, Clock, ArrowRight, ShieldCheck, Heart, Volume1, RefreshCw, Maximize, Music } from 'lucide-react';
import { playSound } from '../utils/audio';

interface VideoDemoViewProps {
  onNavigateToMenu: () => void;
  onNavigateToTraiteur: () => void;
}

export const VideoDemoView: React.FC<VideoDemoViewProps> = ({ onNavigateToMenu, onNavigateToTraiteur }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioBgRef = useRef<HTMLAudioElement>(null);

  // Video Demo Sources with Audio
  const videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const bgMusicSource = "https://assets.mixkit.co/music/preview/mixkit-afrobeat-chill-624.mp3";

  const chapters = [
    { title: "L'art de la Grillade Suya", timeSec: 0, timeStr: "00:00", desc: "Maintien de la tradition saharienne au charbon de bois." },
    { title: "Cuisine & Chef Khady", timeSec: 5, timeStr: "00:05", desc: "Sélection des épices et herbes fraîches du Niger." },
    { title: "Service Traiteur VIP", timeSec: 10, timeStr: "00:10", desc: "Présentation royale pour mariages et réceptions à Niamey." }
  ];

  // Handle Play / Pause with Audio
  const togglePlay = () => {
    playSound('pop');
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      if (audioBgRef.current) audioBgRef.current.pause();
      setIsPlaying(false);
    } else {
      // Unmute video & ambient audio on explicit play click
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
      
      if (audioBgRef.current) {
        audioBgRef.current.muted = isMuted;
        audioBgRef.current.volume = volume * 0.4; // Soft background music blend
        audioBgRef.current.play().catch(() => {});
      }

      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Autoplay blocked, retrying with user gesture", err);
        // Fallback: retry with muted then user unmutes
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().then(() => setIsPlaying(true));
        }
      });
    }
  };

  // Toggle Mute / Unmute Sound
  const toggleMute = () => {
    playSound('pop');
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (audioBgRef.current) {
      audioBgRef.current.muted = newMuted;
    }
  };

  // Change Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);

    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    if (audioBgRef.current) {
      audioBgRef.current.volume = val * 0.4;
      audioBgRef.current.muted = val === 0;
    }
  };

  // Seek Time
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Chapter Jump
  const handleChapterClick = (chapterIdx: number) => {
    playSound('pop');
    setActiveChapter(chapterIdx);
    const targetSec = chapters[chapterIdx].timeSec;

    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    if (audioBgRef.current && !isMuted) {
      audioBgRef.current.play().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pb-36 max-w-2xl mx-auto space-y-8">
      {/* Background Audio Soundtrack for Rich Culinary Vibe */}
      <audio 
        ref={audioBgRef} 
        src={bgMusicSource} 
        loop 
        preload="auto"
      />

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black uppercase text-brand-orange tracking-[0.3em] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="animate-pulse" /> Immersion Vidéo HD + Audio
          </span>
          <h2 className="text-3xl font-black italic uppercase text-brand-brown leading-none">
            L'EXPÉRIENCE <span className="text-brand-orange">KHADY'S</span>
          </h2>
        </div>
        <div className="bg-brand-brown text-brand-gold px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-gold/20 flex items-center gap-1">
          <Award size={12} /> Niamey Elite
        </div>
      </header>

      {/* Audio Status Alert Banner */}
      <div className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
        isMuted 
          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900' 
          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${isMuted ? 'bg-amber-600' : 'bg-emerald-600'}`}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-bounce" />}
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight">
              {isMuted ? '🔇 Le son est désactivé' : '🔊 Audio Haute Fidélité Actif'}
            </h4>
            <p className="text-[10px] font-medium opacity-80">
              {isMuted ? 'Cliquez sur le bouton "Activer le son" pour profiter de la bande son culinaire !' : 'Musique d\'ambiance et sons de cuisson en direct.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 ${
            isMuted 
              ? 'bg-brand-orange text-white hover:bg-brand-brown' 
              : 'bg-white text-emerald-800 border border-emerald-300'
          }`}
        >
          {isMuted ? 'Activer le Son 🔊' : 'Coupure 🔇'}
        </button>
      </div>

      {/* Video Player Container */}
      <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-brand-brown/10 bg-black group">
        <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-black flex items-center justify-center">
          
          {/* Real HTML5 Video */}
          <video
            ref={videoRef}
            src={videoSource}
            playsInline
            className="w-full h-full object-cover"
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (audioBgRef.current) audioBgRef.current.pause();
            }}
            onClick={togglePlay}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none"></div>

          {/* Equalizer Sound Waves Animation when Playing & Sound On */}
          {isPlaying && !isMuted && (
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 z-20">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold flex items-center gap-1">
                <Music size={12} /> Audio HD
              </span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-brand-gold rounded-full h-full animate-pulse"></span>
                <span className="w-1 bg-brand-orange rounded-full h-2/3 animate-ping"></span>
                <span className="w-1 bg-brand-gold rounded-full h-full animate-pulse"></span>
                <span className="w-1 bg-white rounded-full h-1/2 animate-bounce"></span>
              </div>
            </div>
          )}

          {/* Playing overlay pill */}
          {isPlaying && (
            <div className="absolute top-6 right-20 bg-red-600 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-lg z-20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> EN DIRECT 4K
            </div>
          )}

          {/* Center Big Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 bg-brand-orange/90 hover:bg-brand-orange text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,111,0,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white z-30"
            title={isPlaying ? "Mettre en pause" : "Lancer la vidéo avec son"}
          >
            {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" className="ml-1.5" />}
          </button>

          {/* Sound Toggle Button Top Right */}
          <button 
            onClick={toggleMute}
            className="absolute top-6 right-6 w-11 h-11 bg-black/60 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20 z-30 hover:bg-black transition-all active:scale-90"
            title={isMuted ? "Activer le son" : "Désactiver le son"}
          >
            {isMuted ? <VolumeX size={20} className="text-amber-400" /> : <Volume2 size={20} className="text-emerald-400" />}
          </button>

          {/* Video Footer Controls overlay */}
          <div className="absolute bottom-4 left-6 right-6 z-30 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-gold text-[9px] font-black uppercase tracking-widest mb-0.5">
                  <ChefHat size={14} /> Cuisines Khady's Food Niamey
                </div>
                <h3 className="text-base font-black italic uppercase tracking-tight text-white drop-shadow-md">
                  Passions, Saveurs & Authenticité
                </h3>
              </div>
              <div className="text-[10px] font-mono font-bold text-white/80 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {formatTime(currentTime)} / {formatTime(duration || 12)}
              </div>
            </div>

            {/* Time Scrubber / Progress bar */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="0"
                max={duration || 12}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-brand-orange bg-white/20 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Volume Control bar */}
            <div className="flex items-center justify-between text-[10px] font-bold text-white/70 pt-1">
              <div className="flex items-center gap-2">
                {volume === 0 || isMuted ? <VolumeX size={14} /> : <Volume1 size={14} />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-emerald-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] font-mono">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>

              <button 
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
                  }
                }}
                className="hover:text-white flex items-center gap-1 text-[9px] uppercase tracking-wider"
              >
                <Maximize size={12} /> Plein Écran
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Highlights */}
      <div className="bg-white p-6 sm:p-8 rounded-[3rem] shadow-xl border border-gray-100 space-y-4">
        <h3 className="font-black italic uppercase text-xs text-brand-brown tracking-wider flex items-center gap-2">
          <Clock size={16} className="text-brand-orange" /> Séquences Fortes du Restaurant (Accès Direct)
        </h3>
        <div className="space-y-3">
          {chapters.map((chap, idx) => (
            <button
              key={idx}
              onClick={() => handleChapterClick(idx)}
              className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all border ${
                activeChapter === idx 
                  ? 'bg-brand-brown text-white border-brand-brown shadow-lg' 
                  : 'bg-gray-50 text-brand-brown border-gray-100 hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                activeChapter === idx ? 'bg-brand-orange text-white' : 'bg-white text-brand-brown shadow-sm'
              }`}>
                {chap.timeStr}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-xs uppercase italic flex items-center gap-2">
                  {chap.title}
                  {activeChapter === idx && <span className="text-[9px] text-brand-gold font-normal">▶ En lecture</span>}
                </h4>
                <p className={`text-[9px] font-bold ${activeChapter === idx ? 'text-white/70' : 'text-gray-400'}`}>
                  {chap.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick CTAs */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onNavigateToMenu}
          className="bg-brand-orange text-white p-6 rounded-[2.5rem] font-black uppercase italic shadow-xl flex flex-col justify-between h-32 active:scale-95 transition-all text-left"
        >
          <span className="text-[8px] tracking-widest text-white/80">COMMANDE EXPRESS</span>
          <span className="text-sm tracking-tight flex items-center justify-between">
            Voir le Menu <ArrowRight size={18} />
          </span>
        </button>

        <button 
          onClick={onNavigateToTraiteur}
          className="bg-brand-brown text-brand-gold p-6 rounded-[2.5rem] font-black uppercase italic shadow-xl flex flex-col justify-between h-32 active:scale-95 transition-all text-left border-2 border-brand-gold/20"
        >
          <span className="text-[8px] tracking-widest text-brand-gold/80">ÉVÉNEMENTS & MARIAGES</span>
          <span className="text-sm tracking-tight flex items-center justify-between">
            Réserver Traiteur <Sparkles size={18} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default VideoDemoView;

