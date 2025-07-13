import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Clock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOTP, sendOTP, signup } from '@/services/auth';

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { email, password, name, type } = params as {
    email: string;
    password: string;
    name: string;
    type: string;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOTP(email, otpToVerify);
      
      if (isValid) {
        if (type === 'signup') {
          // Complete the signup process
          await signup(email, password, name);
          router.replace('/(tabs)');
        } else {
          // Handle other OTP verification scenarios
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect or expired. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Verification Failed', 'Unable to verify OTP. Please check your code and try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const sent = await sendOTP(email);
      if (sent) {
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        
        // Restart timer
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.header}>
        <Mail size={48} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Verify Your Email</Text>
        <Text style={styles.headerSubtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Enter the 6-digit verification code
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputs.current[index] = ref!}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                loading && styles.otpInputDisabled
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              editable={!loading}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={() => handleVerifyOTP()}
          disabled={loading || otp.some(digit => !digit)}>
          <Text style={styles.verifyButtonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={resendLoading}>
              <Text style={styles.resendText}>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerContainer}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.timerText}>
                Resend in {formatTimer(timer)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.changeEmailButton}
          onPress={() => router.back()}>
          <Text style={styles.changeEmailText}>Change Email Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E6FFFA',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  instructionText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  changeEmailButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeEmailText: {
    color: '#6B7280',
    fontSize: 16,
  },
});