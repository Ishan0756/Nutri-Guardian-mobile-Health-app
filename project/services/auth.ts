import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  conditions?: string[];
}

interface AuthResponse {
  user: User;
  token: string;
}

// OTP storage (mocked in-memory store)
const otpStorage = new Map<string, { otp: string; timestamp: number }>();

export const sendOTP = async (email: string): Promise<boolean> => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, {
      otp,
      timestamp: Date.now() + 10 * 60 * 1000, // 10 min expiry
    });

    console.log(`🔐 OTP for ${email} is: ${otp}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
    return true;
  } catch (error) {
    console.error('OTP send error:', error);
    return false;
  }
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const stored = otpStorage.get(email);

    if (!stored) {
      console.warn(`❌ No OTP stored for ${email}`);
      return false;
    }

    if (Date.now() > stored.timestamp) {
      otpStorage.delete(email);
      console.warn(`❌ OTP expired for ${email}`);
      return false;
    }

    const isValid = stored.otp === otp;
    if (isValid) {
      console.log(`✅ OTP verified for ${email}`);
      otpStorage.delete(email); // Clear OTP after successful use
    } else {
      console.warn(`❌ Invalid OTP attempt for ${email}`);
    }

    return isValid;
  } catch (error) {
    console.error('OTP verify error:', error);
    return false;
  }
};

export const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const userId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      email + Date.now()
    );

    const mockUser: User = {
      id: userId,
      email,
      name,
    };

    const mockResponse: AuthResponse = {
      user: mockUser,
      token: 'auth_token_' + Date.now(),
    };

    const existingUsers = await AsyncStorage.getItem('allUsers');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    users.push(mockUser);

    await AsyncStorage.setItem('allUsers', JSON.stringify(users));
    await AsyncStorage.setItem('authToken', mockResponse.token);
    await AsyncStorage.setItem('userData', JSON.stringify(mockUser));

    return mockResponse;
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error('Signup failed');
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const existingUsers = await AsyncStorage.getItem('allUsers');
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    const user = users.find((u: any) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const mockResponse: AuthResponse = {
      user,
      token: 'auth_token_' + Date.now(),
    };

    await AsyncStorage.setItem('authToken', mockResponse.token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return mockResponse;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid login credentials');
  }
};

export const loginWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const mockGoogleUser: User = {
      id: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'google_user_' + Date.now()
      ),
      email: 'demo@gmail.com',
      name: 'Demo Google User',
    };

    const mockResponse: AuthResponse = {
      user: mockGoogleUser,
      token: 'google_auth_token_' + Date.now(),
    };

    await AsyncStorage.setItem('authToken', mockResponse.token);
    await AsyncStorage.setItem('userData', JSON.stringify(mockGoogleUser));

    return mockResponse;
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error('Google sign-in failed');
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const updateUser = async (userData: Partial<User>): Promise<void> => {
  try {
    const currentUser = await getUser();
    if (!currentUser) throw new Error('No user found');

    const updatedUser = { ...currentUser, ...userData };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

    const existingUsers = await AsyncStorage.getItem('allUsers');
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    const index = users.findIndex((u: User) => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      await AsyncStorage.setItem('allUsers', JSON.stringify(users));
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('userData');
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};
