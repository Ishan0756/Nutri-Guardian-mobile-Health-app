import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, TrendingUp, Shield, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getUser } from '@/services/auth';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const quickActions = [
    {
      title: 'Scan Product',
      icon: Camera,
      color: '#14B8A6',
      action: () => router.push('/scanner'),
    },
    {
      title: 'View History',
      icon: Clock,
      color: '#8B5CF6',
      action: () => router.push('/history'),
    },
    {
      title: 'Health Profile',
      icon: Shield,
      color: '#F59E0B',
      action: () => router.push('/profile'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#14B8A6', '#0D9488']}
        style={styles.header}>
        <Text style={styles.appName}>NutriGuardian</Text>
        <Text style={styles.tagline}>Scan Smart. Eat Safe.</Text>
        {user && (
          <Text style={styles.welcome}>Welcome back, {user.name || 'User'}!</Text>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.action}>
                <action.icon size={24} color={action.color} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Indian Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productCard}>
              <Text style={styles.productName}>Maggi Noodles</Text>
              <Text style={styles.productGrade}>Grade: C</Text>
            </View>
            <View style={styles.productCard}>
              <Text style={styles.productName}>Parle-G Biscuits</Text>
              <Text style={styles.productGrade}>Grade: D</Text>
            </View>
            <View style={styles.productCard}>
              <Text style={styles.productName}>Amul Milk</Text>
              <Text style={styles.productGrade}>Grade: A</Text>
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/scanner')}>
          <Camera size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#E6FFFA',
    textAlign: 'center',
    marginTop: 5,
  },
  welcome: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  actionGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 5,
  },
  productGrade: {
    fontSize: 12,
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});