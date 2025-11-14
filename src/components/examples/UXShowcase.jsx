import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, Users, Sparkles, Volume2, VolumeX } from 'lucide-react';

// Import our enhanced components
import EnhancedButton from '../ui/EnhancedButton';
import AnimatedCard, { ProductCard, ProfileCard, FeatureCard } from '../ui/AnimatedCard';
import PageTransition, { StaggerContainer } from '../animations/PageTransition';
import SwipeableContainer, { HorizontalSwipe, SwipeableCard } from '../gestures/SwipeableContainer';
import AnimatedOnboarding, { useOnboarding } from '../onboarding/AnimatedOnboarding';
import soundManager from '../../utils/soundManager';
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from '../../utils/animationUtils';

/**
 * UX Showcase Component
 * Demonstrates all the enhanced UX features in action
 * 
 * This component serves as both a demo and integration guide
 * showing how to use each enhanced component effectively
 */

const UXShowcase = () => {
  const [currentSection, setCurrentSection] = useState('buttons');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { resetOnboarding } = useOnboarding();

  // Toggle sound settings
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
  };

  // Sample data for demonstrations
  const sampleProducts = [
    {
      id: 1,
      name: 'Premium Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      image: 'https://via.placeholder.com/300x300?text=Headphones',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Smart Watch',
      description: 'Advanced fitness tracking and smart notifications',
      price: 299.99,
      image: 'https://via.placeholder.com/300x300?text=Smart+Watch',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Laptop Stand',
      description: 'Ergonomic adjustable laptop stand for better posture',
      price: 79.99,
      image: 'https://via.placeholder.com/300x300?text=Laptop+Stand',
      rating: 4.9
    }
  ];

  const sampleUser = {
    name: 'Alex Thompson',
    bio: 'UX Designer & Developer',
    avatar: 'https://via.placeholder.com/80x80?text=AT',
    followers: 1234,
    following: 567
  };

  const sampleFeatures = [
    {
      title: 'Fast Delivery',
      description: 'Get your products delivered in 24 hours',
      icon: <Star className="w-full h-full" />
    },
    {
      title: 'Secure Payments',
      description: 'Your payments are protected with bank-level security',
      icon: <Heart className="w-full h-full" />
    },
    {
      title: 'Premium Support',
      description: '24/7 customer support for all your needs',
      icon: <Users className="w-full h-full" />
    }
  ];

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to UX Showcase!',
      description: 'Experience the power of smooth animations and interactive design.',
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'features',
      title: 'Enhanced Components',
      description: 'Discover buttons, cards, and gestures that respond beautifully to your touch.',
      icon: <Heart className="w-12 h-12 text-red-500" />,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'sounds',
      title: 'Immersive Audio',
      description: 'Subtle sound effects enhance every interaction (can be disabled).',
      icon: <Volume2 className="w-12 h-12 text-blue-500" />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'ready',
      title: 'You\'re Ready!',
      description: 'Explore the showcase and see how these features can enhance your app.',
      icon: <ShoppingBag className="w-12 h-12 text-green-500" />,
      color: 'from-green-500 to-teal-500'
    }
  ];

  const sections = [
    { key: 'buttons', label: '🎯 Enhanced Buttons' },
    { key: 'cards', label: '🎴 Animated Cards' },
    { key: 'gestures', label: '👆 Swipe Gestures' },
    { key: 'transitions', label: '✨ Page Transitions' },
    { key: 'sounds', label: '🔊 Sound Effects' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Onboarding Flow */}
      {showOnboarding && (
        <AnimatedOnboarding
          steps={onboardingSteps}
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Header */}
      <motion.header
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Enhanced UX Showcase
              </h1>
              <p className="text-gray-600 text-sm">
                Experience smooth animations, gestures, and sound effects
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sound toggle */}
              <EnhancedButton
                variant={soundEnabled ? "primary" : "secondary"}
                size="sm"
                onClick={toggleSound}
                soundEnabled={false} // Don't play sound for sound toggle button
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </EnhancedButton>

              {/* Onboarding trigger */}
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={() => {
                  resetOnboarding();
                  setShowOnboarding(true);
                }}
              >
                Start Tour
              </EnhancedButton>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation */}
      <motion.nav
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {sections.map((section) => (
              <motion.button
                key={section.key}
                variants={staggerItem}
                onClick={() => setCurrentSection(section.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                  ${currentSection === section.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition type="slideUp" key={currentSection}>
          
          {/* Enhanced Buttons Section */}
          {currentSection === 'buttons' && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Buttons</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Experience buttons that respond with smooth animations, sound effects, and visual feedback.
                  Each button includes hover effects, loading states, and accessibility features.
                </p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Button Variants */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
                  <div className="space-y-3">
                    <EnhancedButton variant="primary" soundEnabled={soundEnabled}>Primary</EnhancedButton>
                    <EnhancedButton variant="secondary" soundEnabled={soundEnabled}>Secondary</EnhancedButton>
                    <EnhancedButton variant="success" soundEnabled={soundEnabled}>Success</EnhancedButton>
                    <EnhancedButton variant="danger" soundEnabled={soundEnabled}>Danger</EnhancedButton>
                    <EnhancedButton variant="warning" soundEnabled={soundEnabled}>Warning</EnhancedButton>
                  </div>
                </div>

                {/* Button Sizes */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
                  <div className="space-y-3">
                    <EnhancedButton size="sm" soundEnabled={soundEnabled}>Small</EnhancedButton>
                    <EnhancedButton size="md" soundEnabled={soundEnabled}>Medium</EnhancedButton>
                    <EnhancedButton size="lg" soundEnabled={soundEnabled}>Large</EnhancedButton>
                    <EnhancedButton size="xl" soundEnabled={soundEnabled}>Extra Large</EnhancedButton>
                  </div>
                </div>

                {/* Button States */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Button States</h3>
                  <div className="space-y-3">
                    <EnhancedButton loading soundEnabled={soundEnabled}>Loading</EnhancedButton>
                    <EnhancedButton disabled soundEnabled={soundEnabled}>Disabled</EnhancedButton>
                    <EnhancedButton variant="ghost" soundEnabled={soundEnabled}>Ghost</EnhancedButton>
                    <EnhancedButton variant="outline" soundEnabled={soundEnabled}>Outline</EnhancedButton>
                  </div>
                </div>
              </StaggerContainer>
            </section>
          )}

          {/* Animated Cards Section */}
          {currentSection === 'cards' && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Animated Cards</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Cards that come alive with hover effects, loading states, and interactive elements.
                  Perfect for product displays, user profiles, and feature highlights.
                </p>
              </div>

              <StaggerContainer className="space-y-8">
                {/* Product Cards */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Product Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={(product) => console.log('Added to cart:', product)}
                        onViewDetails={(product) => console.log('View details:', product)}
                        soundEnabled={soundEnabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Profile Card */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Profile Card</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProfileCard user={sampleUser} soundEnabled={soundEnabled} />
                    <ProfileCard loading={true} />
                    <div className="flex items-center justify-center bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">More profiles...</p>
                    </div>
                  </div>
                </div>

                {/* Feature Cards */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Feature Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sampleFeatures.map((feature, index) => (
                      <FeatureCard
                        key={index}
                        feature={feature}
                        soundEnabled={soundEnabled}
                      />
                    ))}
                  </div>
                </div>
              </StaggerContainer>
            </section>
          )}

          {/* Swipe Gestures Section */}
          {currentSection === 'gestures' && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Swipe Gestures</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Interactive components that respond to touch gestures and swipe actions.
                  Perfect for mobile interfaces and touch-friendly interactions.
                </p>
              </div>

              <StaggerContainer className="space-y-8">
                {/* Basic Swipe */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Basic Swipe Container</h3>
                  <SwipeableContainer
                    onSwipeLeft={() => console.log('Swiped left!')}
                    onSwipeRight={() => console.log('Swiped right!')}
                    onSwipeUp={() => console.log('Swiped up!')}
                    onSwipeDown={() => console.log('Swiped down!')}
                    soundEnabled={soundEnabled}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center"
                  >
                    <p className="text-gray-700 font-medium">Swipe me in any direction!</p>
                    <p className="text-sm text-gray-500 mt-2">Try swiping left, right, up, or down</p>
                  </SwipeableContainer>
                </div>

                {/* Horizontal Swipe Navigation */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Horizontal Navigation</h3>
                  <HorizontalSwipe
                    onSwipeLeft={() => console.log('Next item')}
                    onSwipeRight={() => console.log('Previous item')}
                    soundEnabled={soundEnabled}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 text-center"
                  >
                    <p className="font-medium">Swipe left or right to navigate</p>
                    <p className="text-sm opacity-90 mt-2">Perfect for image galleries or content carousels</p>
                  </HorizontalSwipe>
                </div>

                {/* Swipeable Cards */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Swipeable Cards</h3>
                  <div className="space-y-4 max-w-md mx-auto">
                    {[1, 2, 3].map((item) => (
                      <SwipeableCard
                        key={item}
                        onDismiss={() => console.log(`Dismissed card ${item}`)}
                        onAccept={() => console.log(`Accepted card ${item}`)}
                        soundEnabled={soundEnabled}
                        className="p-6"
                      >
                        <h4 className="font-semibold text-gray-900">Card {item}</h4>
                        <p className="text-gray-600 mt-2">
                          Swipe left to dismiss or right to accept this card.
                        </p>
                      </SwipeableCard>
                    ))}
                  </div>
                </div>
              </StaggerContainer>
            </section>
          )}

          {/* Page Transitions Section */}
          {currentSection === 'transitions' && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Transitions</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Smooth transitions between pages and sections create a cohesive user experience.
                  These examples show different animation types you can use.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <p className="text-gray-700 mb-4">
                  Page transitions are automatically applied when you navigate between sections in this showcase.
                </p>
                <p className="text-sm text-gray-500">
                  Try switching between different sections in the navigation above to see the smooth slide-up transition effect.
                </p>
              </div>
            </section>
          )}

          {/* Sound Effects Section */}
          {currentSection === 'sounds' && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Sound Effects</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Subtle audio feedback enhances user interactions and provides confirmation for actions.
                  All sounds can be disabled in user preferences.
                </p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Sound Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Sound Effects</span>
                      <EnhancedButton
                        variant={soundEnabled ? "success" : "secondary"}
                        size="sm"
                        onClick={toggleSound}
                        soundEnabled={false}
                      >
                        {soundEnabled ? "Enabled" : "Disabled"}
                      </EnhancedButton>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="0.3"
                        onChange={(e) => soundManager.setVolume(parseFloat(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Test Sounds</h3>
                  <div className="space-y-3">
                    <EnhancedButton
                      variant="primary"
                      size="sm"
                      onClick={() => soundManager.play('click')}
                      soundEnabled={false}
                    >
                      Test Click Sound
                    </EnhancedButton>
                    <EnhancedButton
                      variant="success"
                      size="sm"
                      onClick={() => soundManager.play('success')}
                      soundEnabled={false}
                    >
                      Test Success Sound
                    </EnhancedButton>
                    <EnhancedButton
                      variant="secondary"
                      size="sm"
                      onClick={() => soundManager.play('notification')}
                      soundEnabled={false}
                    >
                      Test Notification Sound
                    </EnhancedButton>
                  </div>
                </div>
              </StaggerContainer>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  🔊 Sound Implementation Note
                </h3>
                <p className="text-yellow-700 text-sm">
                  To use sound effects in production, add audio files to your <code>public/sounds/</code> directory.
                  The sound manager will automatically load and play them. Ensure you have proper licensing for any audio files used.
                </p>
              </div>
            </section>
          )}

        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Enhanced UX features powered by Framer Motion, Howler.js, and custom React components
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All animations respect user preferences for reduced motion
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UXShowcase;