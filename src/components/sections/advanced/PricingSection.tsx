/**
 * Advanced Pricing Section Component
 * Feature-rich pricing tables with comparison and CTAs
 */

import React, { useState } from 'react';
import { Check, X, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PricingSectionContent } from '../../../types/pageBuilder';

interface PricingSectionProps {
  content: PricingSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<PricingSectionContent>) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  const getGridColumns = (device: 'desktop' | 'tablet' | 'mobile') => {
    const cols = content.columns[device];
    return `repeat(${Math.min(cols, content.plans.length)}, minmax(0, 1fr))`;
  };

  const formatPrice = (price: number, currency: string, period: string) => {
    if (price === 0) return 'Free';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });
    
    return `${formatter.format(price)}/${period}`;
  };

  const getPlanIcon = (plan: typeof content.plans[0]) => {
    if (plan.featured) return <Crown className="w-5 h-5" />;
    if (plan.price === 0) return <Star className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  const renderPlanCard = (plan: typeof content.plans[0], index: number) => (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300
        ${plan.featured 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-xl scale-105' 
          : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
        }
      `}
    >
      {/* Featured Badge */}
      {plan.featured && plan.badge && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Plan Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
            plan.featured 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {getPlanIcon(plan)}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {plan.description}
          </p>
          
          {/* Price Display */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {formatPrice(plan.price, plan.currency, plan.period)}
            </div>
            {plan.price > 0 && (
              <div className="text-sm text-gray-500">
                Billed {plan.period === 'month' ? 'monthly' : 'annually'}
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8">
          <ul className="space-y-3">
            {plan.features.map((feature, featureIndex) => (
              <motion.li
                key={featureIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                className="flex items-start"
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  plan.featured
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center group ${
            plan.featured
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          onClick={() => {
            if (isEditing) return;
            window.open(plan.ctaUrl, '_blank');
          }}
        >
          {plan.ctaText}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );

  if (content.layout === 'list') {
    return (
      <div className="max-w-4xl mx-auto">
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

        {/* List Layout */}
        <div className="space-y-4">
          {content.plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                flex items-center justify-between p-6 rounded-xl border transition-all duration-300
                ${plan.featured 
                  ? 'bg-blue-50 border-blue-200 shadow-lg' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  plan.featured 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getPlanIcon(plan)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {plan.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency, plan.period)}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-xs text-gray-500">
                      per {plan.period}
                    </div>
                  )}
                </div>
                
                <button
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    plan.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (isEditing) return;
                    window.open(plan.ctaUrl, '_blank');
                  }}
                >
                  {plan.ctaText}
                </button>
              </div>
            </motion.div>
          ))}
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {content.subtitle}
          </p>
        )}

        {/* Period Toggle (if plans have different periods) */}
        {content.plans.some(plan => plan.period === 'month') && 
         content.plans.some(plan => plan.period === 'year') && (
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedPeriod('month')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedPeriod('year')}
            >
              Annual
              <span className="ml-1 text-xs text-green-600 font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Grid Layout */}
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
        {content.plans
          .filter(plan => !selectedPeriod || plan.period === selectedPeriod)
          .map((plan, index) => renderPlanCard(plan, index))
        }
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12 pt-8 border-t border-gray-200"
      >
        <p className="text-sm text-gray-600">
          All plans include our standard features. Need something custom?{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact our sales team
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default PricingSection;