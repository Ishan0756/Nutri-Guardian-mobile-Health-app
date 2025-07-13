import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { getUser } from '@/services/auth';
import { getHealthWarningsForUser } from '@/services/productService';

export default function ProductResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [personalizedWarnings, setPersonalizedWarnings] = useState<string[]>([]);

  const product = params.productData ? JSON.parse(params.productData as string) : null;

  useEffect(() => {
    loadUserAndGenerateWarnings();
  }, []);

  const loadUserAndGenerateWarnings = async () => {
    const userData = await getUser();
    setUser(userData);
    
    if (product && userData?.conditions) {
      const warnings = getHealthWarningsForUser(product, userData.conditions);
      setPersonalizedWarnings(warnings);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#84CC16';
      case 'C': return '#F59E0B';
      case 'D': return '#F97316';
      case 'F': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getGradeMessage = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellent choice!';
      case 'B': return 'Good choice';
      case 'C': return 'Okay choice';
      case 'D': return 'Poor choice';
      case 'F': return 'Avoid this product';
      default: return 'Unknown grade';
    }
  };

  const formatNutrition = (value: number | undefined, unit: string = 'g') => {
    return value ? `${value}${unit}` : 'N/A';
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient 
        colors={[getGradeColor(product.grade), `${getGradeColor(product.grade)}80`]} 
        style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeText}>{product.grade}</Text>
          <Text style={styles.gradeMessage}>{getGradeMessage(product.grade)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.productInfo}>
          {product.image_url && (
            <Image source={{ uri: product.image_url }} style={styles.productImage} />
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.product_name}</Text>
            {product.brands && (
              <Text style={styles.productBrand}>{product.brands}</Text>
            )}
            <Text style={styles.barcode}>#{product.code}</Text>
          </View>
        </View>

        {(personalizedWarnings.length > 0 || product.healthWarnings.length > 0) && (
          <View style={styles.warningsSection}>
            <Text style={styles.sectionTitle}>Health Warnings</Text>
            {personalizedWarnings.map((warning, index) => (
              <View key={`personal-${index}`} style={styles.personalWarning}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={styles.personalWarningText}>{warning}</Text>
              </View>
            ))}
            {product.healthWarnings.map((warning: string, index: number) => (
              <View key={`general-${index}`} style={styles.warning}>
                <XCircle size={16} color="#F97316" />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Energy</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.energy_100g, ' kcal')}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.fat_100g)}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Saturated Fat</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.saturated_fat_100g)}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Sugar</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.sugars_100g)}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.proteins_100g)}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Sodium</Text>
              <Text style={styles.nutritionValue}>
                {formatNutrition(product.nutriments.sodium_100g, ' mg')}
              </Text>
            </View>
          </View>
        </View>

        {product.alternatives && product.alternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <Text style={styles.sectionTitle}>Better Alternatives</Text>
            {product.alternatives.map((alternative: string, index: number) => (
              <View key={index} style={styles.alternative}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.alternativeText}>{alternative}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.scanAgainButton}
          onPress={() => router.push('/scanner')}>
          <Text style={styles.scanAgainText}>Scan Another Product</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gradeContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  gradeText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradeMessage: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  productDetails: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
  },
  barcode: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  warningsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  personalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  personalWarningText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    color: '#F97316',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  nutritionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    width: '48%',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  alternativesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  alternative: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeText: {
    color: '#10B981',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  scanAgainButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});