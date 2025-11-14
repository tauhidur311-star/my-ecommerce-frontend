/**
 * Advanced Video Section Component
 * Supports YouTube, Vimeo, uploaded videos, and background videos
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeOff as VolumeX, Maximize, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VideoSectionContent } from '../../../types/pageBuilder.ts';

interface VideoSectionProps {
  content: VideoSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<VideoSectionContent>) => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(content.autoplay);
  const [isMuted, setIsMuted] = useState(content.muted);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle video state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (showControls) {
      timeout = setTimeout(() => {
        if (!isEditing) {
          setShowControls(false);
        }
      }, 3000);
    }
    
    return () => clearTimeout(timeout);
  }, [showControls, isEditing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const getVideoUrl = () => {
    switch (content.videoType) {
      case 'youtube':
        return `https://www.youtube.com/embed/${content.videoId}?autoplay=${content.autoplay ? 1 : 0}&mute=${content.muted ? 1 : 0}&controls=${content.controls ? 1 : 0}&loop=${content.loop ? 1 : 0}`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${content.videoId}?autoplay=${content.autoplay ? 1 : 0}&muted=${content.muted ? 1 : 0}&controls=${content.controls ? 1 : 0}&loop=${content.loop ? 1 : 0}`;
      case 'upload':
      case 'background':
        return content.videoUrl;
      default:
        return '';
    }
  };

  const getAspectRatio = () => {
    if (content.aspectRatio === 'custom' && content.customAspectRatio) {
      return `${content.customAspectRatio.width}/${content.customAspectRatio.height}`;
    }
    return content.aspectRatio.replace(':', '/');
  };

  const renderIframeVideo = () => (
    <iframe
      src={getVideoUrl()}
      className="absolute inset-0 w-full h-full"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={content.title}
    />
  );

  const renderNativeVideo = () => (
    <div className="relative">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={getVideoUrl()}
        poster={content.poster}
        autoPlay={content.autoplay}
        loop={content.loop}
        muted={content.muted}
        playsInline
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isEditing && setShowControls(false)}
      />
      
      {/* Custom Controls Overlay */}
      {(content.controls || isEditing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls || isEditing ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
        >
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing && (
                <button
                  onClick={() => onContentChange?.({ controls: !content.controls })}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderOverlay = () => {
    if (!content.overlay?.enabled) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`absolute inset-0 flex items-${content.overlay.position === 'center' ? 'center' : content.overlay.position === 'top' ? 'start' : 'end'} justify-center text-white z-10`}
      >
        <div className="text-center px-6 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {content.subtitle}
            </p>
          )}
          {content.overlay.content && (
            <p className="text-lg md:text-xl opacity-80">
              {content.overlay.content}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  if (isEditing && !getVideoUrl()) {
    return (
      <div 
        className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        style={{ aspectRatio: getAspectRatio() }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {content.title || 'Video Section'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure video settings to display content
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div>Type: {content.videoType}</div>
              <div>Aspect Ratio: {content.aspectRatio}</div>
              {content.videoType !== 'upload' && content.videoType !== 'background' && (
                <div>Video ID: {content.videoId || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={{ aspectRatio: getAspectRatio() }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background overlay for better text readability */}
      {content.videoType === 'background' && content.overlay?.enabled && (
        <div className="absolute inset-0 bg-black/30 z-0" />
      )}
      
      {/* Video Content */}
      {content.videoType === 'youtube' || content.videoType === 'vimeo' 
        ? renderIframeVideo()
        : renderNativeVideo()
      }
      
      {/* Overlay Content */}
      {renderOverlay()}
      
      {/* Non-overlay Title for regular videos */}
      {!content.overlay?.enabled && (content.title || content.subtitle) && (
        <div className="absolute top-4 left-4 right-4 text-white z-10">
          {content.title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-lg opacity-90">
              {content.subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Loading State */}
      {isEditing && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          {content.videoType.toUpperCase()}
        </div>
      )}
    </motion.div>
  );
};

export default VideoSection;