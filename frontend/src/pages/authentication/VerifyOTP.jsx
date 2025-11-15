import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Lock, CheckCircle2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResendVerificationEmail, useVerifyOTP } from '../../features/auth/hooks/useRegister';
import { toast } from 'sonner';
const VerifyOTP = () => {
  const {mutate : verifyOTP ,isLoading,isError,error} = useVerifyOTP();
  const {mutate : resendVerificationEmail} = useResendVerificationEmail();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

 

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    verifyOTP(code, {
        onSuccess: (data) => {
        toast.success(data.message || 'Email verified successfully!');
        setLoading(false);
        setTimeout(() => navigate('/dashboard'), 1500);
      },
    });  };
    const handleResendOTP = async (e) => {
    e.preventDefault();
    resendVerificationEmail(localStorage.getItem("userEmail"),{
      onSuccess: (data) => {
        toast.success(data.message || 'OTP resent successfully!');
      }
    });


    }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Email</h1>
          <p className="text-gray-600 mt-2">Enter the code sent to your email</p>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
            <CardDescription>We sent a 6-digit code to your email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    name="code"
                    type="text"
                    placeholder="123456"
                    className="pl-10 text-center text-2xl tracking-widest font-semibold"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {message.text && (
                <Alert className={message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}>
                  {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleVerifyOTP} 
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleResendOTP}
              className="text-sm text-blue-600 hover:cursor-pointer hover:text-white bg-white flex items-center gap-1"
            >
              {/* <Send /> */}
              Resend OTP
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;