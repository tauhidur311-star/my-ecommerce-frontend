import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Download, 
  Maximize2, 
  RefreshCw,
  Filter,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * GlassChartWrapper Component - Advanced chart container with glass effects
 * 
 * Features:
 * - Glass morphism design with multiple themes
 * - Drag and drop support for dashboard reorganization
 * - Interactive tooltips and legends
 * - Data export functionality
 * - Real-time data updates with animations
 * - Responsive design with mobile optimizations
 * - Custom chart configurations
 * - Loading states and error handling
 * 
 * Usage:
 * <GlassChartWrapper
 *   title="Sales Analytics"
 *   chartType="line"
 *   data={chartData}
 *   theme="analytics"
 *   draggable={true}
 *   exportable={true}
 * />
 */

const GlassChartWrapper = ({
  title,
  subtitle,
  chartType = 'line',
  data = [],
  theme = 'analytics',
  size = 'medium',
  draggable = false,
  dragId = null,
  exportable = false,
  refreshable = false,
  filterable = false,
  resizable = false,
  collapsible = false,
  loading = false,
  error = null,
  className = '',
  headerClassName = '',
  chartClassName = '',
  onRefresh,
  onExport,
  onFilter,
  onResize,
  customConfig = {},
  colors = [],
  animationDuration = 1000,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  gradient = false,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // Glass theme configurations
  const themes = {
    analytics: {
      background: 'bg-gradient-to-br from-blue-500/5 to-purple-600/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-blue-300/20',
      shadow: 'shadow-xl shadow-blue-500/10',
      accent: '#3b82f6',
      gradient: ['#3b82f6', '#8b5cf6']
    },
    dashboard: {
      background: 'bg-gradient-to-br from-indigo-500/5 to-cyan-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-indigo-300/20',
      shadow: 'shadow-xl shadow-indigo-500/10',
      accent: '#6366f1',
      gradient: ['#6366f1', '#06b6d4']
    },
    success: {
      background: 'bg-gradient-to-br from-green-500/5 to-emerald-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-green-300/20',
      shadow: 'shadow-xl shadow-green-500/10',
      accent: '#10b981',
      gradient: ['#10b981', '#34d399']
    },
    warning: {
      background: 'bg-gradient-to-br from-yellow-500/5 to-orange-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-yellow-300/20',
      shadow: 'shadow-xl shadow-yellow-500/10',
      accent: '#f59e0b',
      gradient: ['#f59e0b', '#fb923c']
    },
    danger: {
      background: 'bg-gradient-to-br from-red-500/5 to-pink-500/10',
      backdrop: 'backdrop-blur-xl',
      border: 'border border-red-300/20',
      shadow: 'shadow-xl shadow-red-500/10',
      accent: '#ef4444',
      gradient: ['#ef4444', '#f97316']
    }
  };

  // Size configurations
  const sizes = {
    small: 'h-64',
    medium: 'h-80',
    large: 'h-96',
    xlarge: 'h-[32rem]'
  };

  // Default color palettes
  const defaultColors = colors.length > 0 ? colors : [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', 
    '#06b6d4', '#8b5cf6', '#84cc16', '#f97316', '#ec4899'
  ];

  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging
  } = useDraggable({
    id: dragId || `chart-${title}`,
    disabled: !draggable
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto'
  } : {};

  // Handle refresh
  const handleRefresh = async () => {
    if (!refreshable || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!exportable) return;
    
    if (onExport) {
      onExport(data, title);
    } else {
      // Default CSV export
      const csvData = data.map(item => 
        Object.values(item).join(',')
      ).join('\n');
      
      const headers = Object.keys(data[0] || {}).join(',');
      const csv = `${headers}\n${csvData}`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'chart-data'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          ${themes[theme].background}
          ${themes[theme].backdrop}
          ${themes[theme].border}
          ${themes[theme].shadow}
          rounded-lg p-3 max-w-xs
        `}
      >
        {label && (
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
      ...customConfig
    };

    const axisProps = {
      axisLine: { stroke: themes[theme].accent, strokeWidth: 0.5 },
      tickLine: { stroke: themes[theme].accent, strokeWidth: 0.5 },
      tick: { fill: '#6b7280', fontSize: 12 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
            <XAxis {...axisProps} />
            <YAxis {...axisProps} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'name' && key !== 'date').map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={animationDuration}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
            <XAxis {...axisProps} />
            <YAxis {...axisProps} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'name' && key !== 'date').map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={defaultColors[index % defaultColors.length]}
                fill={gradient ? `url(#gradient${index})` : defaultColors[index % defaultColors.length]}
                fillOpacity={gradient ? 1 : 0.3}
                animationDuration={animationDuration}
              />
            ))}
            {gradient && (
              <defs>
                {Object.keys(data[0] || {}).filter(key => key !== 'name' && key !== 'date').map((key, index) => (
                  <linearGradient key={key} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={defaultColors[index % defaultColors.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={defaultColors[index % defaultColors.length]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
            <XAxis {...axisProps} />
            <YAxis {...axisProps} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'name' && key !== 'date').map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={defaultColors[index % defaultColors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={animationDuration}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: defaultColors[index % defaultColors.length]
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              animationDuration={animationDuration}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      scale: draggable ? 1.02 : 1.01,
      y: draggable ? -2 : -1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const currentTheme = themes[theme] || themes.analytics;

  // Loading state
  if (loading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className={`
          ${currentTheme.background}
          ${currentTheme.backdrop}
          ${currentTheme.border}
          ${currentTheme.shadow}
          ${sizes[size]}
          rounded-xl p-6 flex items-center justify-center
          ${className}
        `}
        style={dragStyle}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading chart data...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className={`
          ${currentTheme.background}
          ${currentTheme.backdrop}
          border border-red-300/20
          shadow-xl shadow-red-500/10
          ${sizes[size]}
          rounded-xl p-6 flex items-center justify-center
          ${className}
        `}
        style={dragStyle}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load chart</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{error}</p>
          {refreshable && (
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={!isDragging ? "hover" : "animate"}
      className={`
        relative
        ${currentTheme.background}
        ${currentTheme.backdrop}
        ${currentTheme.border}
        ${currentTheme.shadow}
        rounded-xl overflow-hidden
        ${isFullscreen ? 'fixed inset-4 z-50' : sizes[size]}
        ${className}
      `}
      style={dragStyle}
      {...props}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <div 
        className={`
          relative z-10 flex items-center justify-between p-4 border-b border-white/10
          ${headerClassName}
        `}
        ref={draggable ? setDragRef : null}
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
          
          {/* Quick stats */}
          {data.length > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Total: {data.length} records</span>
              {/* Calculate trend if applicable */}
              {data.length > 1 && chartType === 'line' && (
                <span className="flex items-center gap-1">
                  {data[data.length - 1].value > data[0].value ? (
                    <>
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-green-500">Trending up</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown size={14} className="text-red-500" />
                      <span className="text-red-500">Trending down</span>
                    </>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {filterable && (
            <motion.button
              onClick={() => onFilter?.(currentFilter)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Filter data"
            >
              <Filter size={16} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}
          
          {refreshable && (
            <motion.button
              onClick={handleRefresh}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              title="Refresh data"
            >
              <RefreshCw size={16} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}
          
          {exportable && (
            <motion.button
              onClick={handleExport}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export data"
            >
              <Download size={16} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}

          {collapsible && (
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
            </motion.button>
          )}

          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={16} className="text-gray-600 dark:text-gray-300" />
          </motion.button>

          {draggable && (
            <div className="p-2 opacity-30 hover:opacity-70 transition-opacity cursor-grab">
              <MoreVertical size={16} className="text-gray-600 dark:text-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative z-10 p-4 ${chartClassName}`}
          >
            {data.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    📊
                  </div>
                  <p>No data available</p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Specialized chart components
export const LineGlassChart = ({ data, ...props }) => (
  <GlassChartWrapper chartType="line" data={data} {...props} />
);

export const AreaGlassChart = ({ data, ...props }) => (
  <GlassChartWrapper chartType="area" data={data} gradient={true} {...props} />
);

export const BarGlassChart = ({ data, ...props }) => (
  <GlassChartWrapper chartType="bar" data={data} {...props} />
);

export const PieGlassChart = ({ data, ...props }) => (
  <GlassChartWrapper chartType="pie" data={data} showGrid={false} {...props} />
);

// Example usage component
export const GlassChartShowcase = () => {
  const sampleLineData = [
    { name: 'Jan', sales: 4000, revenue: 2400 },
    { name: 'Feb', sales: 3000, revenue: 1398 },
    { name: 'Mar', sales: 2000, revenue: 9800 },
    { name: 'Apr', sales: 2780, revenue: 3908 },
    { name: 'May', sales: 1890, revenue: 4800 },
    { name: 'Jun', sales: 2390, revenue: 3800 }
  ];

  const samplePieData = [
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 300 },
    { name: 'Other', value: 200 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glass Chart Showcase</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineGlassChart
          title="Sales Analytics"
          subtitle="Monthly overview"
          data={sampleLineData}
          theme="analytics"
          draggable={true}
          exportable={true}
          refreshable={true}
          onRefresh={() => console.log('Refreshing data...')}
        />

        <AreaGlassChart
          title="Revenue Trends"
          data={sampleLineData}
          theme="success"
          gradient={true}
          draggable={true}
          collapsible={true}
        />

        <BarGlassChart
          title="Performance Metrics"
          data={sampleLineData}
          theme="dashboard"
          draggable={true}
          filterable={true}
        />

        <PieGlassChart
          title="Traffic Sources"
          data={samplePieData}
          theme="warning"
          draggable={true}
          exportable={true}
        />
      </div>

      {/* Loading and error states */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassChartWrapper
          title="Loading Chart"
          loading={true}
          theme="analytics"
          size="small"
        />

        <GlassChartWrapper
          title="Error Chart"
          error="Failed to fetch data from server"
          theme="danger"
          size="small"
          refreshable={true}
        />
      </div>

      <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features Demonstrated</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• Glass morphism effects with themed color schemes</li>
          <li>• Drag and drop support for dashboard reorganization</li>
          <li>• Interactive tooltips with custom styling</li>
          <li>• Data export functionality (CSV format)</li>
          <li>• Refresh and filter capabilities</li>
          <li>• Collapsible content with smooth animations</li>
          <li>• Fullscreen mode for detailed analysis</li>
          <li>• Responsive design with mobile optimizations</li>
        </ul>
      </div>
    </div>
  );
};

export default GlassChartWrapper;