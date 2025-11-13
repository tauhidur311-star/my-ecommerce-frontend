import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings,
  Download,
  Filter,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

// Import glass UI components
import GlassCard, { AnalyticsGlassCard, DashboardGlassCard, MetricGlassCard } from '../ui/glass/GlassCard';
import GlassModal, { ConfirmationModal, InfoModal } from '../ui/glass/GlassModal';
import GlassSidebar, { NavigationSidebar, FilterSidebar } from '../ui/glass/GlassSidebar';
import GlassDropdown from '../ui/glass/GlassDropdown';
import GlassChartWrapper, { LineGlassChart, AreaGlassChart, BarGlassChart, PieGlassChart } from '../ui/glass/GlassChartWrapper';
import GlassDragDropProvider, { GlassGridContainer, GlassDropZone, useSortableItems } from '../ui/glass/GlassDragDropProvider';

/**
 * GlassUIShowcase - Comprehensive demonstration of glass UI components
 * 
 * Features:
 * - Interactive component demonstrations
 * - Real-world usage examples
 * - Drag and drop functionality
 * - Responsive design showcase
 * - Theme variations
 * - Animation examples
 */

const GlassUIShowcase = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [modals, setModals] = useState({
    basic: false,
    confirmation: false,
    info: false
  });
  const [sidebars, setSidebars] = useState({
    navigation: false,
    filters: false
  });
  const [selectedTheme, setSelectedTheme] = useState('analytics');
  const [dashboardLayout, setDashboardLayout] = useState('grid');

  // Sample data for charts
  const sampleData = {
    line: [
      { name: 'Jan', sales: 4000, revenue: 2400, users: 240 },
      { name: 'Feb', sales: 3000, revenue: 1398, users: 221 },
      { name: 'Mar', sales: 2000, revenue: 9800, users: 229 },
      { name: 'Apr', sales: 2780, revenue: 3908, users: 200 },
      { name: 'May', sales: 1890, revenue: 4800, users: 218 },
      { name: 'Jun', sales: 2390, revenue: 3800, users: 250 }
    ],
    pie: [
      { name: 'Desktop', value: 400, fill: '#3b82f6' },
      { name: 'Mobile', value: 300, fill: '#8b5cf6' },
      { name: 'Tablet', value: 200, fill: '#10b981' },
      { name: 'Other', value: 100, fill: '#f59e0b' }
    ]
  };

  // Dashboard items with drag and drop
  const { items, moveItem, addItem, removeItem } = useSortableItems([
    { id: '1', title: 'Revenue Analytics', type: 'chart', component: 'LineChart', theme: 'analytics' },
    { id: '2', title: 'User Growth', type: 'chart', component: 'AreaChart', theme: 'success' },
    { id: '3', title: 'Total Sales', type: 'metric', value: '$24,562', delta: 12.5, theme: 'analytics' },
    { id: '4', title: 'Active Users', type: 'metric', value: '2,847', delta: -3.2, theme: 'dashboard' },
    { id: '5', title: 'Traffic Sources', type: 'chart', component: 'PieChart', theme: 'warning' },
    { id: '6', title: 'Conversion Rate', type: 'metric', value: '3.24%', delta: 8.1, theme: 'success' }
  ]);

  // Navigation items for sidebar
  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp, badge: '5' },
    { href: '/users', label: 'Users', icon: Users, badge: null },
    { href: '/settings', label: 'Settings', icon: Settings, badge: null }
  ];

  // Dropdown options
  const dropdownOptions = [
    { value: 'analytics', label: 'Analytics Dashboard', description: 'View detailed analytics' },
    { value: 'users', label: 'User Management', description: 'Manage user accounts' },
    { value: 'settings', label: 'Settings', description: 'Configure application' },
    { value: 'reports', label: 'Reports', description: 'Generate reports' }
  ];

  // Theme options
  const themeOptions = [
    { value: 'analytics', label: 'Analytics Theme' },
    { value: 'dashboard', label: 'Dashboard Theme' },
    { value: 'success', label: 'Success Theme' },
    { value: 'warning', label: 'Warning Theme' },
    { value: 'danger', label: 'Danger Theme' }
  ];

  // Handle modal open/close
  const toggleModal = (type) => {
    setModals(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Handle sidebar open/close
  const toggleSidebar = (type) => {
    setSidebars(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Handle drag end for dashboard items
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveItem(active.id, over.id);
    }
  };

  // Section components
  const sections = {
    overview: <OverviewSection />,
    cards: <CardsSection selectedTheme={selectedTheme} />,
    charts: <ChartsSection sampleData={sampleData} selectedTheme={selectedTheme} />,
    modals: <ModalsSection modals={modals} toggleModal={toggleModal} />,
    dropdowns: <DropdownsSection dropdownOptions={dropdownOptions} selectedTheme={selectedTheme} />,
    dashboard: <DashboardSection 
      items={items} 
      onDragEnd={handleDragEnd}
      layout={dashboardLayout}
      setLayout={setDashboardLayout}
    />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleSidebar('navigation')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors md:hidden"
              >
                <Menu size={20} className="text-gray-700" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Glass UI Components
                </h1>
                <p className="text-gray-600 text-sm">
                  Modern glassmorphism design system
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <GlassDropdown
                options={themeOptions}
                value={themeOptions.find(t => t.value === selectedTheme)}
                onChange={(option) => setSelectedTheme(option.value)}
                placeholder="Select theme"
                size="small"
                theme={selectedTheme}
              />
              
              <button
                onClick={() => toggleModal('info')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors relative"
              >
                <Bell size={20} className="text-gray-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <NavigationSidebar
        isOpen={sidebars.navigation}
        onClose={() => toggleSidebar('navigation')}
        navigationItems={navigationItems}
        currentPath="/dashboard"
        theme={selectedTheme}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
            {Object.keys(sections).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${activeSection === section 
                    ? 'bg-white/20 text-gray-900 shadow-md' 
                    : 'text-gray-600 hover:bg-white/10'
                  }
                `}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Section */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sections[activeSection]}
        </motion.div>
      </div>

      {/* Modals */}
      <GlassModal
        isOpen={modals.basic}
        onClose={() => toggleModal('basic')}
        title="Glass Modal Example"
        subtitle="This is a subtitle"
        theme={selectedTheme}
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This is a glass modal with backdrop blur effects and smooth animations.
            It supports keyboard navigation and gesture controls on mobile.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <GlassCard theme={selectedTheme} size="small">
              <h4 className="font-semibold text-gray-900 dark:text-white">Feature 1</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Description</p>
            </GlassCard>
            <GlassCard theme={selectedTheme} size="small">
              <h4 className="font-semibold text-gray-900 dark:text-white">Feature 2</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Description</p>
            </GlassCard>
          </div>
        </div>
      </GlassModal>

      <ConfirmationModal
        isOpen={modals.confirmation}
        onClose={() => toggleModal('confirmation')}
        onConfirm={() => {
          console.log('Action confirmed');
          toggleModal('confirmation');
        }}
        message="Are you sure you want to perform this action? This cannot be undone."
        theme={selectedTheme}
      />

      <InfoModal
        isOpen={modals.info}
        onClose={() => toggleModal('info')}
        title="Glass UI Information"
        theme={selectedTheme}
        content={
          <div className="space-y-4">
            <p>This showcase demonstrates the complete Glass UI component library:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Glass morphism effects with backdrop blur</li>
              <li>Drag and drop functionality</li>
              <li>Advanced animations and transitions</li>
              <li>Mobile-optimized gesture support</li>
              <li>Accessibility compliant components</li>
              <li>Multiple theme variations</li>
            </ul>
          </div>
        }
      />
    </div>
  );
};

// Overview Section
const OverviewSection = () => (
  <div className="space-y-8">
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Glass UI Component Library
      </h2>
      <p className="text-lg text-gray-600 leading-relaxed">
        A comprehensive collection of glassmorphism components with advanced interactions,
        drag & drop functionality, and beautiful data visualizations. Built with React,
        Tailwind CSS, and Framer Motion.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnalyticsGlassCard size="large">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Advanced Charts
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Interactive data visualizations with glass styling
          </p>
        </div>
      </AnalyticsGlassCard>

      <DashboardGlassCard size="large">
        <div className="text-center">
          <Users size={48} className="mx-auto text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Drag & Drop
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Intuitive dashboard reorganization with gestures
          </p>
        </div>
      </DashboardGlassCard>

      <GlassCard theme="success" size="large">
        <div className="text-center">
          <TrendingUp size={48} className="mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Responsive Design
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Mobile-first with touch gesture support
          </p>
        </div>
      </GlassCard>
    </div>
  </div>
);

// Cards Section
const CardsSection = ({ selectedTheme }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-900">Glass Cards</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['default', 'analytics', 'dashboard', 'success', 'warning', 'danger'].map((theme) => (
        <GlassCard
          key={theme}
          theme={theme}
          interactive={true}
          className="h-40"
        >
          <div className="h-full flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Glass card with {theme} styling and hover effects
            </p>
          </div>
        </GlassCard>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricGlassCard
        title="Total Revenue"
        value="$24,562"
        delta={12.5}
        icon={TrendingUp}
        theme={selectedTheme}
      />
      <MetricGlassCard
        title="Active Users"
        value="2,847"
        delta={-3.2}
        icon={Users}
        theme={selectedTheme}
      />
      <MetricGlassCard
        title="Conversion Rate"
        value="3.24%"
        delta={8.1}
        icon={BarChart3}
        theme={selectedTheme}
      />
      <MetricGlassCard
        title="Growth Rate"
        value="18.2%"
        delta={5.4}
        icon={TrendingUp}
        theme={selectedTheme}
      />
    </div>
  </div>
);

// Charts Section
const ChartsSection = ({ sampleData, selectedTheme }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-900">Glass Charts</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineGlassChart
        title="Revenue Trends"
        subtitle="Monthly overview"
        data={sampleData.line}
        theme={selectedTheme}
        exportable={true}
        refreshable={true}
      />

      <AreaGlassChart
        title="User Growth"
        data={sampleData.line}
        theme="success"
        gradient={true}
      />

      <BarGlassChart
        title="Sales Performance"
        data={sampleData.line}
        theme="dashboard"
        filterable={true}
      />

      <PieGlassChart
        title="Traffic Sources"
        data={sampleData.pie}
        theme="warning"
        showGrid={false}
      />
    </div>
  </div>
);

// Modals Section
const ModalsSection = ({ modals, toggleModal }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-900">Glass Modals</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard interactive={true} onClick={() => toggleModal('basic')}>
        <div className="text-center p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Basic Modal
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Click to open a basic glass modal with content
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Open Modal →
          </button>
        </div>
      </GlassCard>

      <GlassCard interactive={true} onClick={() => toggleModal('confirmation')}>
        <div className="text-center p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Confirmation Modal
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Modal with confirmation actions
          </p>
          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
            Open Confirmation →
          </button>
        </div>
      </GlassCard>

      <GlassCard interactive={true} onClick={() => toggleModal('info')}>
        <div className="text-center p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Info Modal
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Informational modal with rich content
          </p>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            Open Info →
          </button>
        </div>
      </GlassCard>
    </div>
  </div>
);

// Dropdowns Section
const DropdownsSection = ({ dropdownOptions, selectedTheme }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-900">Glass Dropdowns</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Dropdown</h3>
        <GlassDropdown
          options={dropdownOptions}
          placeholder="Select an option"
          theme={selectedTheme}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Searchable</h3>
        <GlassDropdown
          options={dropdownOptions}
          placeholder="Search options"
          theme={selectedTheme}
          searchable={true}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-select</h3>
        <GlassDropdown
          options={dropdownOptions}
          placeholder="Select multiple"
          theme={selectedTheme}
          multiSelect={true}
        />
      </div>
    </div>
  </div>
);

// Dashboard Section
const DashboardSection = ({ items, onDragEnd, layout, setLayout }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Interactive Dashboard</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
        >
          {layout === 'grid' ? 'List View' : 'Grid View'}
        </button>
      </div>
    </div>

    <GlassDragDropProvider onDragEnd={onDragEnd}>
      <GlassGridContainer 
        items={items.map(item => item.id)} 
        columns={layout === 'grid' ? 3 : 1}
      >
        {items.map((item) => (
          <DashboardItem key={item.id} item={item} />
        ))}
      </GlassGridContainer>
    </GlassDragDropProvider>
  </div>
);

// Dashboard Item Component
const DashboardItem = ({ item }) => (
  <GlassCard
    theme={item.theme}
    draggable={true}
    dragId={item.id}
    size="large"
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {item.title}
        </h4>
        <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-gray-600">
          {item.type}
        </span>
      </div>
      
      {item.type === 'metric' ? (
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {item.value}
          </p>
          {item.delta && (
            <p className={`text-sm ${item.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.delta > 0 ? '+' : ''}{item.delta}% from last month
            </p>
          )}
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center">
          <span className="text-gray-600">{item.component}</span>
        </div>
      )}
    </div>
  </GlassCard>
);

export default GlassUIShowcase;