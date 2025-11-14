/**
 * Advanced Team Section Component
 * Team profiles with social links and responsive layouts
 */

import React, { useState } from 'react';
import { Linkedin, Twitter, Mail, ExternalLink, Users, Grid, Carousel } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TeamSectionContent } from '../../../types/pageBuilder.ts';

interface TeamSectionProps {
  content: TeamSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<TeamSectionContent>) => void;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getGridColumns = (device: 'desktop' | 'tablet' | 'mobile') => {
    const cols = content.columns[device];
    return `repeat(${Math.min(cols, content.members.length)}, minmax(0, 1fr))`;
  };

  const renderSocialLink = (url: string | undefined, icon: React.ReactNode, platform: string) => {
    if (!url) return null;
    
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full transition-colors"
        title={platform}
      >
        {icon}
      </motion.a>
    );
  };

  const renderMemberCard = (member: typeof content.members[0], index: number) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      {/* Photo */}
      <div className="relative overflow-hidden">
        {member.photo ? (
          <motion.img
            src={member.photo}
            alt={member.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            whileHover={{ scale: 1.05 }}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay with social links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="flex space-x-3">
            {renderSocialLink(member.social?.linkedin, <Linkedin className="w-4 h-4" />, 'LinkedIn')}
            {renderSocialLink(member.social?.twitter, <Twitter className="w-4 h-4" />, 'Twitter')}
            {renderSocialLink(member.social?.email, <Mail className="w-4 h-4" />, 'Email')}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {member.name}
        </h3>
        <p className="text-blue-600 font-medium mb-3">
          {member.role}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          {member.bio}
        </p>

        {/* Social Links (visible on mobile) */}
        <div className="flex space-x-2 mt-4 sm:hidden">
          {renderSocialLink(member.social?.linkedin, <Linkedin className="w-4 h-4" />, 'LinkedIn')}
          {renderSocialLink(member.social?.twitter, <Twitter className="w-4 h-4" />, 'Twitter')}
          {renderSocialLink(member.social?.email, <Mail className="w-4 h-4" />, 'Email')}
        </div>
      </div>
    </motion.div>
  );

  const renderCarouselLayout = () => (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{
            x: `-${currentSlide * 100}%`
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {content.members.map((member, index) => (
            <div key={member.id} className="w-full flex-shrink-0 px-4">
              <div className="max-w-sm mx-auto">
                {renderMemberCard(member, index)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Dots */}
      {content.members.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {content.members.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {content.members.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => 
              prev > 0 ? prev - 1 : content.members.length - 1
            )}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 rotate-180" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => 
              prev < content.members.length - 1 ? prev + 1 : 0
            )}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  if (isEditing && content.members.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {content.title || 'Team Section'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add team members to display content
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div>Layout: {content.layout}</div>
            <div>Columns: {content.columns.desktop}×{content.columns.tablet}×{content.columns.mobile}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
      </motion.div>

      {/* Team Layout */}
      {content.layout === 'carousel' ? (
        renderCarouselLayout()
      ) : (
        <div 
          className="grid gap-8"
          style={{
            gridTemplateColumns: `
              ${window.innerWidth >= 1024 ? getGridColumns('desktop') :
                window.innerWidth >= 768 ? getGridColumns('tablet') :
                getGridColumns('mobile')
              }
            `
          }}
        >
          {content.members.map((member, index) => renderMemberCard(member, index))}
        </div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12 pt-8 border-t border-gray-200"
      >
        <p className="text-sm text-gray-600 mb-4">
          Want to join our amazing team?
        </p>
        <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          View Open Positions
          <ExternalLink className="w-4 h-4 ml-2" />
        </button>
      </motion.div>
    </div>
  );
};

export default TeamSection;