import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useResendVerificationEmail,
  useVerifyOTP,
} from "../../features/auth/hooks/useRegister";
import { toast } from "sonner";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const {
    mutate: verifyOTP,
    isLoading: isVerifying,
  } = useVerifyOTP();

  const { mutate: resendVerificationEmail } = useResendVerificationEmail();

  const [code, setCode] = useState("");

  // --------------------------
  // HANDLE VERIFY OTP
  // --------------------------
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    verifyOTP(code, {
      onSuccess: (data) => {
        toast.success(data.message || "Email verified successfully!");
        setTimeout(() => navigate("/login"), 1200);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Invalid or expired OTP"
        );
      },
    });
  };

  // --------------------------
  // HANDLE RESEND OTP
  // --------------------------
  const handleResendOTP = (e) => {
    e.preventDefault();

    const email = localStorage.getItem("userEmail");
    if (!email) {
      toast.error("Email not found — please register again.");
      return;
    }

    resendVerificationEmail(email, {
      onSuccess: (data) => {
        toast.success(data.message || "OTP resent successfully!");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to resend OTP"
        );
      },
    });
  };

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
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Enter Verification Code
            </CardTitle>
            <CardDescription>We sent a 6-digit code to your email</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="pl-10 text-center text-2xl tracking-widest font-semibold"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOTP}
                className="w-full"
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              onClick={handleResendOTP}
              className="text-sm text-blue-600 hover:cursor-pointer hover:text-white bg-white"
            >
              Resend OTP
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
