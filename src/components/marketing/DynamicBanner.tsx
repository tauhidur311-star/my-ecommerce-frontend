import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Star, 
  Gift, 
  Truck, 
  Percent,
  ArrowRight,
  Bell,
  Fire,
  Zap
} from 'lucide-react';

interface Banner {
  id: string;
  type: 'promotional' | 'announcement' | 'offer' | 'seasonal' | 'urgent';
  title: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  discount?: number;
  expiresAt?: string;
  startAt?: string;
  isActive: boolean;
  priority: number;
  position: 'top' | 'bottom' | 'floating';
  dismissible: boolean;
  showTimer?: boolean;
  animation?: 'slide' | 'fade' | 'bounce' | 'pulse';
  conditions?: {
    minCartValue?: number;
    userType?: 'all' | 'new' | 'returning';
    deviceType?: 'all' | 'mobile' | 'desktop';
    location?: string[];
  };
}

interface DynamicBannerProps {
  banners: Banner[];
  cartValue?: number;
  userType?: 'new' | 'returning';
  onBannerClick?: (banner: Banner) => void;
  onBannerDismiss?: (bannerId: string) => void;
  className?: string;
}

const DynamicBanner = memo(({
  banners,
  cartValue = 0,
  userType = 'new',
  onBannerClick,
  onBannerDismiss,
  className = ''
}: DynamicBannerProps) => {
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load dismissed banners from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedBanners');
    if (dismissed) {
      setDismissedBanners(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const handleDismiss = (bannerId: string) => {
    const newDismissed = new Set(dismissedBanners);
    newDismissed.add(bannerId);
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissedBanners', JSON.stringify([...newDismissed]));
    onBannerDismiss?.(bannerId);
  };

  const handleClick = (banner: Banner) => {
    if (banner.ctaLink) {
      window.open(banner.ctaLink, '_blank');
    }
    onBannerClick?.(banner);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = currentTime.getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getIcon = (type: Banner['type'], iconName?: string) => {
    if (iconName) {
      const icons: Record<string, React.ReactNode> = {
        star: <Star size={20} />,
        gift: <Gift size={20} />,
        truck: <Truck size={20} />,
        percent: <Percent size={20} />,
        bell: <Bell size={20} />,
        fire: <Fire size={20} />,
        zap: <Zap size={20} />
      };
      return icons[iconName] || <Bell size={20} />;
    }

    const typeIcons = {
      promotional: <Percent size={20} />,
      announcement: <Bell size={20} />,
      offer: <Gift size={20} />,
      seasonal: <Star size={20} />,
      urgent: <Fire size={20} />
    };

    return typeIcons[type];
  };

  const shouldShowBanner = (banner: Banner) => {
    // Check if banner is dismissed
    if (dismissedBanners.has(banner.id)) return false;

    // Check if banner is active
    if (!banner.isActive) return false;

    // Check time constraints
    if (banner.startAt && new Date(banner.startAt) > currentTime) return false;
    if (banner.expiresAt && new Date(banner.expiresAt) < currentTime) return false;

    // Check conditions
    if (banner.conditions) {
      const { minCartValue, userType: requiredUserType, deviceType } = banner.conditions;

      if (minCartValue && cartValue < minCartValue) return false;
      if (requiredUserType && requiredUserType !== 'all' && requiredUserType !== userType) return false;
      
      if (deviceType && deviceType !== 'all') {
        const isMobile = window.innerWidth < 768;
        if ((deviceType === 'mobile' && !isMobile) || (deviceType === 'desktop' && isMobile)) {
          return false;
        }
      }
    }

    return true;
  };

  const getAnimationVariants = (animation: Banner['animation']) => {
    switch (animation) {
      case 'slide':
        return {
          initial: { y: -100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 }
        };
      case 'bounce':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0, opacity: 0 }
        };
      case 'pulse':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const getPositionClasses = (position: Banner['position']) => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'floating':
        return 'top-20 left-4 right-4 md:left-auto md:right-4 md:w-80';
      default:
        return 'top-0 left-0 right-0';
    }
  };

  const activeBanners = banners
    .filter(shouldShowBanner)
    .sort((a, b) => b.priority - a.priority);

  const topBanners = activeBanners.filter(b => b.position === 'top');
  const bottomBanners = activeBanners.filter(b => b.position === 'bottom');
  const floatingBanners = activeBanners.filter(b => b.position === 'floating');

  const renderBanner = (banner: Banner) => {
    const timeRemaining = banner.expiresAt ? getTimeRemaining(banner.expiresAt) : null;
    const isExpired = timeRemaining === null && banner.expiresAt;
    const variants = getAnimationVariants(banner.animation);

    if (isExpired) return null;

    return (
      <motion.div
        key={banner.id}
        className={`relative z-40 ${getPositionClasses(banner.position)} ${
          banner.position === 'floating' ? 'fixed' : 'sticky'
        }`}
        {...variants}
        transition={{ duration: 0.5, type: "spring" }}
        layout
      >
        <div
          className="px-4 py-3 shadow-lg"
          style={{
            backgroundColor: banner.backgroundColor || '#3b82f6',
            color: banner.textColor || '#ffffff'
          }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getIcon(banner.type, banner.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {banner.title}
                    </h3>
                    <p className="text-sm opacity-90 line-clamp-2">
                      {banner.message}
                    </p>
                  </div>

                  {/* Timer */}
                  {banner.showTimer && timeRemaining && (
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <Clock size={16} />
                      <div className="flex items-center space-x-1 font-mono text-sm">
                        {timeRemaining.days > 0 && (
                          <span>{timeRemaining.days}d</span>
                        )}
                        <span>{timeRemaining.hours.toString().padStart(2, '0')}</span>
                        <span>:</span>
                        <span>{timeRemaining.minutes.toString().padStart(2, '0')}</span>
                        <span>:</span>
                        <span>{timeRemaining.seconds.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  {banner.ctaText && (
                    <button
                      onClick={() => handleClick(banner)}
                      className="mt-2 sm:mt-0 flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dismiss Button */}
            {banner.dismissible && (
              <button
                onClick={() => handleDismiss(banner.id)}
                className="flex-shrink-0 ml-4 p-1 hover:bg-white/20 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar for Timed Offers */}
        {banner.showTimer && timeRemaining && banner.expiresAt && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <motion.div
              className="h-full bg-white/40"
              initial={{ width: '100%' }}
              animate={{
                width: `${
                  Math.max(0, 
                    (new Date(banner.expiresAt).getTime() - currentTime.getTime()) /
                    (new Date(banner.expiresAt).getTime() - new Date(banner.startAt || Date.now()).getTime()) * 100
                  )
                }%`
              }}
              transition={{ duration: 1 }}
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={className}>
      {/* Top Banners */}
      <AnimatePresence>
        {topBanners.map(renderBanner)}
      </AnimatePresence>

      {/* Floating Banners */}
      <AnimatePresence>
        {floatingBanners.map(renderBanner)}
      </AnimatePresence>

      {/* Bottom Banners */}
      <AnimatePresence>
        {bottomBanners.map(renderBanner)}
      </AnimatePresence>
    </div>
  );
});

DynamicBanner.displayName = 'DynamicBanner';

export default DynamicBanner;