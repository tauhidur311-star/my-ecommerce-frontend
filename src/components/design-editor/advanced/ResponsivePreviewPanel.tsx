/**
 * Responsive Preview Panel
 * Advanced device simulation with performance controls and real-time switching
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Rotate3D, 
  Wifi, 
  WifiOff, 
  Zap, 
  Settings,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DevicePreview, PerformanceSettings } from '../../../types/pageBuilder.ts';
import { devicePresets } from '../../../stores/advancedPageBuilderStore';

interface ResponsivePreviewPanelProps {
  activeDevice: DevicePreview;
  onDeviceChange: (device: DevicePreview) => void;
  children: React.ReactNode;
  performanceSettings: PerformanceSettings;
  onPerformanceChange: (settings: PerformanceSettings) => void;
}

const ResponsivePreviewPanel: React.FC<ResponsivePreviewPanelProps> = ({
  activeDevice,
  onDeviceChange,
  children,
  performanceSettings,
  onPerformanceChange,
}) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touchSimulation, setTouchSimulation] = useState(false);
  const [networkThrottling, setNetworkThrottling] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'desktop': return Monitor;
      case 'tablet': return Tablet;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  const getDeviceDimensions = () => {
    if (isLandscape && activeDevice.category !== 'desktop') {
      return {
        width: activeDevice.height,
        height: activeDevice.width,
      };
    }
    return {
      width: activeDevice.width,
      height: activeDevice.height,
    };
  };

  const getZoomToFit = () => {
    if (!previewRef.current) return 1;
    
    const container = previewRef.current;
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = container.clientHeight - 120; // Account for controls
    const dimensions = getDeviceDimensions();
    
    const widthScale = containerWidth / dimensions.width;
    const heightScale = containerHeight / dimensions.height;
    
    return Math.min(widthScale, heightScale, 1);
  };

  useEffect(() => {
    const handleResize = () => {
      if (zoom === 'fit') {
        setZoom(getZoomToFit());
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [activeDevice, isLandscape]);

  const handleZoomChange = (newZoom: number | string) => {
    if (newZoom === 'fit') {
      setZoom(getZoomToFit());
    } else {
      setZoom(newZoom as number);
    }
  };

  const simulateNetworkDelay = async () => {
    if (!networkThrottling) return;
    
    setIsLoading(true);
    const delay = performanceSettings.networkSpeed === '2g' ? 2000 :
                  performanceSettings.networkSpeed === '3g' ? 1000 :
                  performanceSettings.networkSpeed === '4g' ? 300 : 0;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsLoading(false);
  };

  const handleDeviceSwitch = async (device: DevicePreview) => {
    onDeviceChange(device);
    setIsLandscape(false);
    await simulateNetworkDelay();
  };

  const dimensions = getDeviceDimensions();

  const renderDeviceSelector = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {devicePresets.map((device) => {
        const DeviceIcon = getDeviceIcon(device.category);
        return (
          <button
            key={device.id}
            onClick={() => handleDeviceSwitch(device)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeDevice.id === device.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title={device.name}
          >
            <DeviceIcon className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{device.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );

  const renderZoomControls = () => (
    <div className="flex items-center space-x-2">
      <select
        value={zoom}
        onChange={(e) => handleZoomChange(e.target.value === 'fit' ? 'fit' : parseFloat(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 rounded"
      >
        <option value="fit">Fit</option>
        <option value={0.25}>25%</option>
        <option value={0.5}>50%</option>
        <option value={0.75}>75%</option>
        <option value={1}>100%</option>
        <option value={1.25}>125%</option>
        <option value={1.5}>150%</option>
        <option value={2}>200%</option>
      </select>
      
      <button
        onClick={() => handleZoomChange(getZoomToFit())}
        className="p-2 hover:bg-gray-100 rounded"
        title="Zoom to fit"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );

  const renderDeviceControls = () => (
    <div className="flex items-center space-x-2">
      {activeDevice.category !== 'desktop' && (
        <button
          onClick={() => setIsLandscape(!isLandscape)}
          className={`p-2 rounded transition-colors ${
            isLandscape ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Rotate device"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={() => setShowDeviceFrame(!showDeviceFrame)}
        className={`p-2 rounded transition-colors ${
          showDeviceFrame ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Toggle device frame"
      >
        {showDeviceFrame ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {activeDevice.touch && (
        <button
          onClick={() => setTouchSimulation(!touchSimulation)}
          className={`p-2 rounded transition-colors ${
            touchSimulation ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Touch simulation"
        >
          <Rotate3D className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const renderPerformanceControls = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setNetworkThrottling(!networkThrottling)}
        className={`p-2 rounded transition-colors ${
          networkThrottling ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'
        }`}
        title="Network throttling"
      >
        {networkThrottling ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
      </button>

      <button
        onClick={() => setShowPerformancePanel(!showPerformancePanel)}
        className={`p-2 rounded transition-colors ${
          showPerformancePanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Performance settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      <button
        onClick={() => window.location.reload()}
        className="p-2 hover:bg-gray-100 rounded"
        title="Refresh preview"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );

  const renderPerformancePanel = () => (
    <AnimatePresence>
      {showPerformancePanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-64"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Performance Settings
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Network Speed
              </label>
              <select
                value={performanceSettings.networkSpeed}
                onChange={(e) => onPerformanceChange({
                  ...performanceSettings,
                  networkSpeed: e.target.value as any
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="wifi">WiFi</option>
                <option value="4g">4G</option>
                <option value="3g">3G</option>
                <option value="2g">2G</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                CPU Throttling ({performanceSettings.cpuThrottling}x slower)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={performanceSettings.cpuThrottling}
                onChange={(e) => onPerformanceChange({
                  ...performanceSettings,
                  cpuThrottling: Number(e.target.value)
                })}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                Disable Cache
              </span>
              <input
                type="checkbox"
                checked={performanceSettings.cacheDisabled}
                onChange={(e) => onPerformanceChange({
                  ...performanceSettings,
                  cacheDisabled: e.target.checked
                })}
                className="rounded"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDeviceInfo = () => (
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex items-center justify-between">
        <span>Resolution:</span>
        <span>{dimensions.width}×{dimensions.height}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Pixel Ratio:</span>
        <span>{activeDevice.pixelRatio}x</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Touch:</span>
        <span>{activeDevice.touch ? 'Yes' : 'No'}</span>
      </div>
      {zoom !== 1 && (
        <div className="flex items-center justify-between">
          <span>Zoom:</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Controls */}
      <div className="relative bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {renderDeviceSelector()}
            {renderZoomControls()}
          </div>
          
          <div className="flex items-center space-x-4">
            {renderDeviceControls()}
            {renderPerformanceControls()}
          </div>
        </div>

        {renderPerformancePanel()}
      </div>

      {/* Preview Area */}
      <div 
        ref={previewRef}
        className="flex-1 overflow-auto p-4 bg-gray-100"
        style={{
          background: showDeviceFrame 
            ? 'radial-gradient(ellipse at center, #f3f4f6 0%, #e5e7eb 100%)'
            : '#f9fafb'
        }}
      >
        <div className="flex items-center justify-center h-full">
          <motion.div
            layout
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
            }}
          >
            {/* Device Frame */}
            {showDeviceFrame && (
              <div 
                className={`absolute inset-0 bg-gray-800 rounded-lg shadow-2xl ${
                  activeDevice.category === 'mobile' ? 'rounded-3xl' : 
                  activeDevice.category === 'tablet' ? 'rounded-xl' : 'rounded-lg'
                }`}
                style={{
                  width: dimensions.width + 20,
                  height: dimensions.height + 40,
                  top: -20,
                  left: -10,
                }}
              >
                {/* Device Details */}
                <div className="absolute -top-8 left-0 right-0 flex items-center justify-between text-xs text-gray-600">
                  <span>{activeDevice.name}</span>
                  {isLoading && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                </div>
                
                {/* Home indicator for mobile devices */}
                {activeDevice.category === 'mobile' && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
                )}
              </div>
            )}

            {/* Preview Content */}
            <div 
              className="relative bg-white overflow-hidden shadow-lg"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: showDeviceFrame ? (
                  activeDevice.category === 'mobile' ? '20px' : 
                  activeDevice.category === 'tablet' ? '12px' : '8px'
                ) : '0px',
              }}
            >
              {/* Loading Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
                  >
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                      <div className="text-sm text-gray-600">
                        Loading {performanceSettings.networkSpeed.toUpperCase()}...
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Touch Simulation Overlay */}
              {touchSimulation && (
                <div 
                  className="absolute inset-0 z-40 cursor-pointer touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                />
              )}

              {/* Actual Content */}
              <div 
                className="h-full w-full overflow-auto"
                style={{
                  userAgent: activeDevice.userAgent,
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Device Info Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getDeviceIcon(activeDevice.category)({ className: "w-4 h-4" })}
              <span>{activeDevice.name}</span>
              {isLandscape && <span className="text-blue-600">(Landscape)</span>}
            </div>
            
            {networkThrottling && (
              <div className="flex items-center space-x-1 text-xs text-yellow-600">
                <WifiOff className="w-3 h-3" />
                <span>{performanceSettings.networkSpeed.toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            {renderDeviceInfo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivePreviewPanel;