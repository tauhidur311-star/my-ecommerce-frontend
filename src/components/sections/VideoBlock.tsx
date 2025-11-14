import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoBlockProps {
  settings?: {
    title?: string;
    subtitle?: string;
    description?: string;
    videoUrl?: string;
    posterUrl?: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    layout?: 'full-width' | 'contained' | 'background';
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'custom';
    customHeight?: string;
    overlay?: boolean;
    overlayOpacity?: number;
    playButtonStyle?: 'default' | 'minimal' | 'large';
  };
  styles?: {
    container?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    videoWrapper?: string;
    video?: string;
    controls?: string;
    overlay?: string;
  };
  isEditing?: boolean;
}

const VideoBlock: React.FC<VideoBlockProps> = ({
  settings = {},
  styles = {},
  isEditing = false
}) => {
  const {
    title = 'Watch Our Story',
    subtitle = 'Behind the scenes',
    description = 'Get an inside look at how we create amazing products and deliver exceptional experiences.',
    videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&h=675&fit=crop',
    autoplay = false,
    muted = true,
    loop = false,
    controls = true,
    backgroundColor = '#000000',
    textColor = '#FFFFFF',
    padding = '4rem 1rem',
    margin = '0',
    layout = 'contained',
    aspectRatio = '16:9',
    customHeight = '500px',
    overlay = false,
    overlayOpacity = 0.4,
    playButtonStyle = 'default'
  } = settings;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAspectRatioClass = () => {
    const ratios = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '1:1': 'aspect-square',
      'custom': ''
    };
    return ratios[aspectRatio] || ratios['16:9'];
  };

  const renderCustomControls = () => {
    if (!controls || !showControls) return null;

    return (
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 ${styles.controls || ''}`}>
        <div className="flex items-center space-x-4 text-white">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => videoRef.current?.requestFullscreen()}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderPlayButton = () => {
    if (isPlaying || (controls && showControls)) return null;

    const buttonSizes = {
      default: 'w-16 h-16',
      minimal: 'w-12 h-12',
      large: 'w-24 h-24'
    };

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className={`${buttonSizes[playButtonStyle]} bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300`}
        >
          <Play className="w-1/3 h-1/3 text-gray-800 ml-1" />
        </button>
      </div>
    );
  };

  if (layout === 'background') {
    return (
      <section
        className={`relative ${styles.container || ''}`}
        style={{
          backgroundColor,
          color: textColor,
          padding,
          margin,
          minHeight: aspectRatio === 'custom' ? customHeight : '100vh'
        }}
      >
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          playsInline
          poster={posterUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        {overlay && (
          <div 
            className={`absolute inset-0 bg-black ${styles.overlay || ''}`}
            style={{ opacity: overlayOpacity }}
          />
        )}

        {/* Content */}
        <div className={`relative z-10 flex items-center justify-center h-full ${styles.content || ''}`}>
          <div className="text-center max-w-4xl mx-auto">
            {title && (
              <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${styles.title || ''}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <h3 className={`text-xl md:text-2xl mb-4 opacity-90 ${styles.subtitle || ''}`}>
                {subtitle}
              </h3>
            )}
            {description && (
              <p className={`text-lg md:text-xl opacity-80 ${styles.description || ''}`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Play button for background videos */}
        {!autoplay && renderPlayButton()}
      </section>
    );
  }

  return (
    <section
      className={`${styles.container || ''}`}
      style={{
        backgroundColor,
        color: textColor,
        padding,
        margin
      }}
    >
      <div className={`max-w-7xl mx-auto ${layout === 'full-width' ? '!max-w-none' : ''}`}>
        <div className={`${styles.content || ''}`}>
          {/* Header */}
          {(title || subtitle || description) && (
            <div className="text-center mb-8">
              {title && (
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.title || ''}`}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <h3 className={`text-xl mb-4 opacity-80 ${styles.subtitle || ''}`}>
                  {subtitle}
                </h3>
              )}
              {description && (
                <p className={`text-lg opacity-80 max-w-2xl mx-auto ${styles.description || ''}`}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Video */}
          <div className={`relative ${styles.videoWrapper || ''}`}>
            <div 
              className={`relative bg-gray-900 rounded-lg overflow-hidden ${getAspectRatioClass()}`}
              style={aspectRatio === 'custom' ? { height: customHeight } : {}}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${styles.video || ''}`}
                autoPlay={autoplay}
                muted={muted}
                loop={loop}
                controls={!controls} // Use browser controls if custom controls are disabled
                playsInline
                poster={posterUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Custom Play Button */}
              {renderPlayButton()}

              {/* Custom Controls */}
              {renderCustomControls()}

              {/* Loading State for Editing */}
              {isEditing && !videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm opacity-60">Video Player</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoBlock;