import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Mail, MessageCircle, Settings, 
  Bell, Clock, Users, CheckCircle, XCircle
} from 'lucide-react';
import { useInventoryAlerts } from '../../hooks/useInventory';
import GlassModal from '../ui/glass/GlassModal';
import EnhancedButton from '../ui/EnhancedButton';
import toast from 'react-hot-toast';

const StockAlertModal = ({ isOpen, onClose, lowStockItems = [] }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [alertType, setAlertType] = useState('email');
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const { alertSettings, updateAlertSettings, sendLowStockAlert } = useInventoryAlerts();

  useEffect(() => {
    if (lowStockItems.length > 0) {
      setSelectedItems(lowStockItems.map(item => item._id));
    }
  }, [lowStockItems]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === lowStockItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(lowStockItems.map(item => item._id));
    }
  };

  const addRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSendAlert = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    const alertData = {
      productIds: selectedItems,
      alertType,
      customMessage,
      recipients: alertType === 'email' ? recipients : [],
      scheduled: isScheduled,
      scheduleTime: isScheduled ? scheduleTime : null
    };

    try {
      await sendLowStockAlert(alertData);
      onClose();
      setSelectedItems([]);
      setCustomMessage('');
      setRecipients([]);
      setScheduleTime('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <MessageCircle className="w-5 h-5" />;
      case 'push': return <Bell className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const AlertTypeCard = ({ type, title, description, isSelected, onClick, disabled = false }) => (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {getAlertIcon(type)}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {isSelected && (
          <CheckCircle className="w-5 h-5 text-blue-600" />
        )}
      </div>
    </motion.div>
  );

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Low Stock Alerts"
      size="lg"
    >
      <div className="space-y-6">
        {/* Alert Summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-900">
                {lowStockItems.length} items need attention
              </h3>
              <p className="text-sm text-yellow-700">
                These products are running low on stock and may need restocking soon.
              </p>
            </div>
          </div>
        </div>

        {/* Items Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Select Items</h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedItems.length === lowStockItems.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {lowStockItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="rounded border-gray-300"
                />
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.stock} / Threshold: {item.lowStockThreshold}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.stock === 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Type Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Alert Method</h3>
          <div className="grid grid-cols-1 gap-3">
            <AlertTypeCard
              type="email"
              title="Email Notification"
              description="Send detailed email alerts to team members"
              isSelected={alertType === 'email'}
              onClick={() => setAlertType('email')}
            />
            <AlertTypeCard
              type="sms"
              title="SMS Alert"
              description="Quick SMS notifications for urgent alerts"
              isSelected={alertType === 'sms'}
              onClick={() => setAlertType('sms')}
              disabled={!alertSettings.smsAlerts}
            />
            <AlertTypeCard
              type="push"
              title="Push Notification"
              description="Browser push notifications for immediate attention"
              isSelected={alertType === 'push'}
              onClick={() => setAlertType('push')}
            />
          </div>
        </div>

        {/* Email Recipients (if email is selected) */}
        {alertType === 'email' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recipients</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <EnhancedButton
                  variant="outline"
                  onClick={addRecipient}
                  disabled={!newRecipient.trim()}
                >
                  Add
                </EnhancedButton>
              </div>
              
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipients.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Message */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Custom Message (Optional)</h3>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a custom message to include with the alert..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Schedule Options */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="schedule" className="text-lg font-medium text-gray-900">
              Schedule Alert
            </label>
          </div>
          
          {isScheduled && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <EnhancedButton
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            onClick={handleSendAlert}
            disabled={selectedItems.length === 0 || (alertType === 'email' && recipients.length === 0)}
          >
            {isScheduled ? 'Schedule Alert' : 'Send Alert'}
          </EnhancedButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default StockAlertModal;