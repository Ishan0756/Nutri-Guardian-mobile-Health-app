import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Save } from 'lucide-react-native';
import { saveToHistory } from '@/services/historyService';

export default function ManualEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const barcode = params.barcode as string;

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [energy, setEnergy] = useState('');
  const [fat, setFat] = useState('');
  const [sugar, setSugar] = useState('');
  const [protein, setProtein] = useState('');
  const [sodium, setSodium] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateGrade = () => {
    let score = 0;
    
    const energyVal = parseFloat(energy) || 0;
    const fatVal = parseFloat(fat) || 0;
    const sugarVal = parseFloat(sugar) || 0;
    const sodiumVal = parseFloat(sodium) || 0;
    
    if (energyVal > 500) score += 3;
    else if (energyVal > 350) score += 2;
    else if (energyVal > 200) score += 1;
    
    if (fatVal > 20) score += 3;
    else if (fatVal > 10) score += 2;
    else if (fatVal > 5) score += 1;
    
    if (sugarVal > 25) score += 3;
    else if (sugarVal > 15) score += 2;
    else if (sugarVal > 5) score += 1;
    
    if (sodiumVal > 1000) score += 3;
    else if (sodiumVal > 500) score += 2;
    else if (sodiumVal > 200) score += 1;
    
    if (score <= 2) return 'A';
    if (score <= 5) return 'B';
    if (score <= 8) return 'C';
    if (score <= 12) return 'D';
    return 'F';
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    setLoading(true);
    try {
      const grade = calculateGrade();
      
      // Create mock product data
      const productData = {
        code: barcode || 'manual_' + Date.now(),
        product_name: productName,
        brands: brand,
        categories: category,
        nutriments: {
          energy_100g: parseFloat(energy) || 0,
          fat_100g: parseFloat(fat) || 0,
          sugars_100g: parseFloat(sugar) || 0,
          proteins_100g: parseFloat(protein) || 0,
          sodium_100g: parseFloat(sodium) || 0,
        },
        grade,
        healthWarnings: [],
        alternatives: [],
      };

      // Save to history
      await saveToHistory({
        barcode: productData.code,
        productName: productData.product_name,
        grade: productData.grade,
        timestamp: new Date().toISOString(),
      });

      // Navigate to result screen
      router.replace({
        pathname: '/product-result',
        params: {
          barcode: productData.code,
          productData: JSON.stringify(productData)
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save product information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#14B8A6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Entry</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Enter product information manually
        </Text>

        {barcode && (
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeLabel}>Barcode:</Text>
            <Text style={styles.barcodeValue}>{barcode}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Enter brand name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Snacks, Beverages"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
          <Text style={styles.sectionSubtitle}>
            Enter nutritional information from the product label
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Energy (kcal)</Text>
              <TextInput
                style={styles.input}
                value={energy}
                onChangeText={setEnergy}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Sugar (g)</Text>
              <TextInput
                style={styles.input}
                value={sugar}
                onChangeText={setSugar}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sodium (mg)</Text>
            <TextInput
              style={styles.input}
              value={sodium}
              onChangeText={setSodium}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.gradePreview}>
          <Text style={styles.gradePreviewLabel}>Estimated Grade:</Text>
          <View style={[styles.gradePreviewBadge, { backgroundColor: getGradeColor(calculateGrade()) }]}>
            <Text style={styles.gradePreviewText}>{calculateGrade()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || !productName.trim()}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Product'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 10,
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14B8A6',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  gradePreview: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradePreviewLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  gradePreviewBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gradePreviewText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});