import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function OTPForm({ onSubmit, isLoading, error }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const handleSubmit = (data) => {
    onSubmit(data.pin);
  };

  return (
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
          Please enter the one-time password sent to your email.
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
  );
}