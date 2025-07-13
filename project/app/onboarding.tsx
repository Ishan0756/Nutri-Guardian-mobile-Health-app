import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  subtitle: string;
  image: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    title: 'Scan food. Stay safe.',
    subtitle: 'Smart Health Scanning',
    image: 'https://images.pexels.com/photos/4099236/pexels-photo-4099236.jpeg',
    description: 'Simply scan any Indian packaged food barcode to instantly know if it\'s right for your health',
  },
  {
    title: 'Smart health grades',
    subtitle: 'Personalized Analysis',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    description: 'Get A-F grades based on nutrition facts and personalized warnings for your health conditions',
  },
  {
    title: 'Food choices personalized for you',
    subtitle: 'Better Alternatives',
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
    description: 'Discover healthier alternatives and make informed decisions about what you eat',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.replace('/auth/login');
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.slideContainer}>
          <Image source={{ uri: currentSlideData.image }} style={styles.image} />
          
          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
            <Text style={styles.title}>{currentSlideData.title}</Text>
            <Text style={styles.description}>{currentSlideData.description}</Text>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentSlide && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.navigation}>
            {currentSlide > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={previousSlide}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <View style={styles.navSpacer} />

            {currentSlide < slides.length - 1 ? (
              <TouchableOpacity style={styles.navButton} onPress={nextSlide}>
                <ChevronRight size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.getStartedButton} onPress={completeOnboarding}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E6FFFA',
    fontWeight: '500',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navSpacer: {
    flex: 1,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  getStartedText: {
    color: '#14B8A6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});