import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { RefreshCcw } from 'lucide-react';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function EnhancedOTPForm({ onSubmit, onResendOTP, isLoading, error, email }) {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  // Countdown timer for resend functionality
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (data) => {
    onSubmit(data.pin);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResendOTP();
      setCountdown(60); // 60 second cooldown
      form.reset(); // Clear the OTP input
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            One-Time Password
          </label>
          <Controller
            control={form.control}
            name="pin"
            render={({ field }) => (
              <InputOTP 
                maxLength={6} 
                value={field.value} 
                onChange={field.onChange}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {form.formState.errors.pin && (
            <p className="mt-2 text-sm text-red-600">
              {form.formState.errors.pin.message}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-600">
            Please enter the one-time password sent to {email}.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !form.formState.isValid}
          className="w-full text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      {/* Resend OTP Section */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-gray-600">
            Didn't receive the code? Resend in <span className="font-medium text-blue-600">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isResending ? 'animate-spin' : ''} />
            {isResending ? 'Sending new code...' : 'Resend OTP'}
          </button>
        )}
      </div>

      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Check your spam folder if you don't see the email.</p>
        <p>OTP expires in 10 minutes.</p>
      </div>
    </div>
  );
}