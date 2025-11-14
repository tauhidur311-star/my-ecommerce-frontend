/**
 * Advanced Timeline Section Component
 * Process steps, company history, or milestone timeline
 */

import React from 'react';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimelineSectionContent } from '../../../types/pageBuilder.ts';

interface TimelineSectionProps {
  content: TimelineSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<TimelineSectionContent>) => void;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {

  const renderVerticalTimeline = () => (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300" />
      
      <div className="space-y-12">
        {content.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: content.alternating && index % 2 === 1 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={`relative flex items-start ${
              content.alternating && index % 2 === 1 ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Timeline Dot */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <Clock className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${content.alternating && index % 2 === 1 ? 'pr-12 text-right' : 'pl-12'}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {item.date && (
                  <div className="flex items-center text-sm text-blue-600 font-medium mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {item.date}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
                
                {item.image && (
                  <div className="mt-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHorizontalTimeline = () => (
    <div className="relative overflow-x-auto pb-6">
      <div className="flex space-x-8 min-w-max px-4">
        {content.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative flex flex-col items-center min-w-[300px]"
          >
            {/* Timeline Dot */}
            <div className="relative mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {index + 1}
              </div>
              
              {/* Connecting Line */}
              {index < content.items.length - 1 && (
                <div className="absolute top-6 left-12 w-[calc(300px-3rem)] h-0.5 bg-gradient-to-r from-blue-500 to-blue-300" />
              )}
            </div>

            {/* Content Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all w-full"
            >
              {item.date && (
                <div className="text-sm text-blue-600 font-medium mb-2">
                  {item.date}
                </div>
              )}
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
              
              {item.image && (
                <div className="mt-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (isEditing && content.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {content.title || 'Timeline Section'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add timeline items to display content
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div>Layout: {content.layout}</div>
            <div>Alternating: {content.alternating ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
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

      {/* Timeline Content */}
      {content.layout === 'vertical' ? renderVerticalTimeline() : renderHorizontalTimeline()}
    </div>
  );
};

export default TimelineSection;