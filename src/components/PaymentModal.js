import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, DollarSign, Loader } from 'lucide-react';
import { APIService } from '../services/api';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, orderAmount, orderId, onPaymentSuccess }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentFee, setPaymentFee] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState('select'); // select, processing, confirm

  useEffect(() => {
    if (isOpen && orderAmount) {
      loadPaymentMethods();
    }
  }, [isOpen, orderAmount]);

  useEffect(() => {
    if (selectedMethod) {
      calculateFee();
    }
  }, [selectedMethod]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await APIService.getPaymentMethods(orderAmount);
      
      if (response.success) {
        setPaymentMethods(response.data);
        
        // Auto-select first available method
        if (response.data.length > 0) {
          setSelectedMethod(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = async () => {
    try {
      const response = await APIService.calculatePaymentFee(selectedMethod.id, orderAmount);
      
      if (response.success) {
        setPaymentFee(response.data.fee);
      }
    } catch (error) {
      console.error('Failed to calculate fee:', error);
    }
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'stripe':
        return <CreditCard className="w-6 h-6" />;
      case 'cod':
        return <DollarSign className="w-6 h-6" />;
      default:
        return <Smartphone className="w-6 h-6" />;
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setStep('processing');

    try {
      if (selectedMethod.id === 'cod') {
        // Handle Cash on Delivery
        const response = await APIService.confirmCODOrder(orderId);
        
        if (response.success) {
          setStep('confirm');
          setTimeout(() => {
            onPaymentSuccess(response.data.order);
            onClose();
          }, 2000);
        }
      } else if (selectedMethod.id === 'stripe') {
        // Handle Stripe payment
        const response = await APIService.createStripePaymentIntent(
          orderAmount + paymentFee, 
          orderId
        );
        
        if (response.success) {
          // In a real app, you'd integrate with Stripe Elements here
          toast.success('Redirecting to Stripe checkout...');
          
          // Simulate successful payment for demo
          setTimeout(() => {
            setStep('confirm');
            setTimeout(() => {
              onPaymentSuccess({ id: orderId, status: 'confirmed' });
              onClose();
            }, 2000);
          }, 3000);
        }
      } else {
        // Handle mobile banking (bKash, Nagad, etc.)
        if (!mobileNumber) {
          toast.error('Please enter your mobile number');
          setLoading(false);
          setStep('select');
          return;
        }

        const response = await APIService.initiateMobileBankingPayment(
          selectedMethod.id,
          orderAmount + paymentFee,
          orderId,
          mobileNumber
        );
        
        if (response.success) {
          toast.success(response.data.message);
          
          // Show instructions to user
          const userTrxId = prompt(
            `Payment initiated! Transaction ID: ${response.data.transactionId}\n\n` +
            'Instructions:\n' +
            response.data.instructions.join('\n') +
            '\n\nEnter your transaction ID from the app:'
          );

          if (userTrxId) {
            const confirmResponse = await APIService.confirmMobileBankingPayment(
              response.data.transactionId,
              userTrxId
            );
            
            if (confirmResponse.success) {
              setStep('confirm');
              setTimeout(() => {
                onPaymentSuccess(confirmResponse.data.order);
                onClose();
              }, 2000);
            } else {
              toast.error('Payment verification failed');
              setStep('select');
            }
          } else {
            setStep('select');
          }
        }
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <>
              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>৳{orderAmount}</span>
                </div>
                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Payment Fee</span>
                    <span>৳{paymentFee}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>৳{orderAmount + paymentFee}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select Payment Method</h3>
                
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMethod?.id === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedMethod?.id === method.id}
                          onChange={() => setSelectedMethod(method)}
                          className="sr-only"
                        />
                        
                        <div className="flex items-center space-x-3 flex-1">
                          {getMethodIcon(method.id)}
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-500">
                              Fee: ৳{method.fee || 0}
                            </div>
                          </div>
                        </div>
                        
                        {selectedMethod?.id === method.id && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Number for mobile banking */}
              {selectedMethod && ['bkash', 'nagad', 'rocket', 'upay'].includes(selectedMethod.id) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedMethod || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : `Pay ৳${orderAmount + paymentFee}`}
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your order has been confirmed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;