import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Server, Database, Clock, HardDrive, 
  Cpu, AlertTriangle, CheckCircle, TrendingUp,
  RefreshCw, BarChart3, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';
import EnhancedButton from '../ui/EnhancedButton';
import GlassCard from '../ui/glass/GlassCard';
import toast from 'react-hot-toast';

const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, metricsRes] = await Promise.all([
        api.get('/admin/performance/summary'),
        api.get('/admin/performance/metrics')
      ]);
      
      setPerformanceData(summaryRes.data.data);
      setRealTimeMetrics(metricsRes.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabasePerformance = async () => {
    try {
      const response = await api.post('/admin/performance/test-db');
      toast.success(`Database test completed in ${response.data.data.totalTime}`);
      fetchPerformanceData(); // Refresh data
    } catch (error) {
      toast.error('Database performance test failed');
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchPerformanceData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', status = 'good', delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon size={24} className={`text-${color}-600`} />
          </div>
          {status === 'good' ? (
            <CheckCircle size={16} className="text-green-500" />
          ) : status === 'warning' ? (
            <AlertTriangle size={16} className="text-yellow-500" />
          ) : (
            <AlertTriangle size={16} className="text-red-500" />
          )}
        </div>
      </div>
    </motion.div>
  );

  const getMemoryStatus = () => {
    if (!realTimeMetrics) return 'good';
    const usage = realTimeMetrics.memory.usagePercentage;
    if (usage > 80) return 'critical';
    if (usage > 60) return 'warning';
    return 'good';
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const generateMemoryChartData = () => {
    if (!realTimeMetrics) return [];
    
    const { memory } = realTimeMetrics;
    return [
      { name: 'Heap Used', value: memory.heapUsedMB, color: '#3b82f6' },
      { name: 'Heap Free', value: memory.heapTotalMB - memory.heapUsedMB, color: '#e5e7eb' },
    ];
  };

  if (isLoading && !performanceData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Real-time system performance and health metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </EnhancedButton>
          
          <EnhancedButton
            variant="primary"
            size="sm"
            onClick={testDatabasePerformance}
          >
            <Database size={16} />
            Test DB
          </EnhancedButton>
        </div>
      </div>

      {/* System Metrics */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="System Uptime"
            value={formatUptime(realTimeMetrics.uptime)}
            subtitle="Continuous operation"
            icon={Server}
            color="green"
            status="good"
            delay={0.1}
          />
          
          <MetricCard
            title="Memory Usage"
            value={`${realTimeMetrics.memory.usagePercentage}%`}
            subtitle={`${realTimeMetrics.memory.heapUsedMB}MB / ${realTimeMetrics.memory.heapTotalMB}MB`}
            icon={HardDrive}
            color={getMemoryStatus() === 'good' ? 'blue' : getMemoryStatus() === 'warning' ? 'yellow' : 'red'}
            status={getMemoryStatus()}
            delay={0.2}
          />
          
          <MetricCard
            title="Active Connections"
            value={realTimeMetrics.activeConnections}
            subtitle="Current connections"
            icon={Activity}
            color="purple"
            status="good"
            delay={0.3}
          />
          
          <MetricCard
            title="Database Status"
            value={performanceData?.database?.connected ? 'Connected' : 'Disconnected'}
            subtitle={performanceData?.database?.name}
            icon={Database}
            color={performanceData?.database?.connected ? 'green' : 'red'}
            status={performanceData?.database?.connected ? 'good' : 'critical'}
            delay={0.4}
          />
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Usage Chart */}
        <GlassCard title="Memory Usage Distribution" className="h-80">
          {realTimeMetrics && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={generateMemoryChartData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, value}) => `${name}: ${value}MB`}
                >
                  {generateMemoryChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        {/* Endpoint Performance */}
        <GlassCard title="Endpoint Performance" className="h-80">
          {performanceData?.endpoints && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Object.entries(performanceData.endpoints).slice(0, 8).map(([endpoint, stats]) => (
                <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{endpoint}</p>
                    <p className="text-xs text-gray-500">
                      {stats.totalRequests} requests • {stats.errorRate} error rate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{stats.averageTime}</p>
                    <p className="text-xs text-gray-500">avg time</p>
                  </div>
                </div>
              ))}
              
              {Object.keys(performanceData.endpoints).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="mx-auto w-12 h-12 mb-2 opacity-50" />
                  <p>No performance data available</p>
                  <p className="text-xs">Make some API calls to see metrics</p>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* System Information */}
      <GlassCard title="System Information">
        {performanceData?.system && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Runtime Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version</span>
                  <span className="font-medium">{performanceData.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-medium">{performanceData.system.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Process ID</span>
                  <span className="font-medium">{performanceData.system.pid}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Memory Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">RSS</span>
                  <span className="font-medium">{performanceData.system.memory.rss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heap Total</span>
                  <span className="font-medium">{performanceData.system.memory.heapTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">External</span>
                  <span className="font-medium">{performanceData.system.memory.external}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Database Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Host</span>
                  <span className="font-medium">{performanceData.database.host}:{performanceData.database.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="font-medium">{performanceData.database.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      performanceData.database.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      {performanceData.database.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default PerformanceMonitor;