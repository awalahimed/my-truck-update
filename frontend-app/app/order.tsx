import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  X,
  Search,
  Lock,
  Calendar,
  Clock,
  Scale,
  Truck,
  Package,
  DollarSign,
  ShieldCheck,
  Check,
  ChevronDown,
  ExternalLink,
  Map as MapIcon,
} from 'lucide-react-native';
import { MapComponent } from '@/components/shared/MapComponent';
import { OrderStatusSheet } from '@/components/order/OrderStatusSheet-redesign';
import { showToast } from '@/hooks/useToast';
import { orpc } from '@/hooks/orpc';
import { useAuth } from '@/hooks/AuthContext';
import { useWallet } from '@/hooks/wallet/useWallet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Standard verified Ethiopian transport hubs
const DEFAULT_CITIES = [
  { id: 'city-addis', nameEn: 'Addis Ababa', nameAm: 'አዲስ አበባ', region: 'Finfinnee', lat: 9.03, lng: 38.74 },
  { id: 'city-adama', nameEn: 'Adama', nameAm: 'አዳማ', region: 'Oromia', lat: 8.54, lng: 39.27 },
  { id: 'city-nekemte', nameEn: 'Nekemte', nameAm: 'ነቀምቴ', region: 'Oromia', lat: 9.09, lng: 36.55 },
  { id: 'city-hawassa', nameEn: 'Hawassa', nameAm: 'ሐዋሳ', region: 'Sidama', lat: 7.05, lng: 38.47 },
  { id: 'city-diredawa', nameEn: 'Dire Dawa', nameAm: 'ድሬዳዋ', region: 'Dire Dawa', lat: 9.59, lng: 41.86 },
  { id: 'city-bahirdar', nameEn: 'Bahir Dar', nameAm: 'ባሕር ዳር', region: 'Amhara', lat: 11.59, lng: 37.39 },
  { id: 'city-gondar', nameEn: 'Gondar', nameAm: 'ጎንደር', region: 'Amhara', lat: 12.60, lng: 37.46 },
  { id: 'city-mekelle', nameEn: 'Mekelle', nameAm: 'መቐለ', region: 'Tigray', lat: 13.49, lng: 39.47 },
  { id: 'city-jimma', nameEn: 'Jimma', nameAm: 'ጅማ', region: 'Oromia', lat: 7.67, lng: 36.83 },
  { id: 'city-shashemene', nameEn: 'Shashemene', nameAm: 'ሻሸመኔ', region: 'Oromia', lat: 7.20, lng: 38.60 },
];

// Standard commodity categories
const COMMODITY_CATEGORIES = [
  { id: 'cat-agri', nameEn: 'Agricultural / Grain', nameAm: 'ግብርና / እህል', icon: '🌾' },
  { id: 'cat-comm', nameEn: 'Commercial Freight', nameAm: 'የንግድ ዕቃዎች', icon: '📦' },
  { id: 'cat-live', nameEn: 'Livestock', nameAm: 'የቁም እንስሳት', icon: '🐄' },
  { id: 'cat-ind', nameEn: 'Industrial / Construction', nameAm: 'የግንባታ / ኢንዱስትሪ', icon: '🏗️' },
];

// Standard goods by category
const DEFAULT_GOODS = [
  { id: 'good-teff', categoryId: 'cat-agri', nameEn: 'Teff', nameAm: 'ጤፍ', unit: 'QTL', icon: '🌾', handling: ['Dry Bulk (ደረቅ ጭነት)', 'Needs Tarp (ሽፋን ያስፈልገዋል)', 'Secure Loading (አስተማማኝ ጭነት)'] },
  { id: 'good-coffee', categoryId: 'cat-agri', nameEn: 'Coffee (Buna)', nameAm: 'ቡና', unit: 'QTL', icon: '☕', handling: ['Moisture Protected (ከእርጥበት የተጠበቀ)', 'Needs Tarp (ሽፋን ያስፈልገዋል)', 'Secure Loading (አስተማማኝ ጭነት)'] },
  { id: 'good-wheat', categoryId: 'cat-agri', nameEn: 'Wheat', nameAm: 'ስንዴ', unit: 'QTL', icon: '🌾', handling: ['Dry Bulk (ደረቅ ጭነት)', 'Needs Tarp (ሽፋን ያስፈልገዋል)'] },
  { id: 'good-maize', categoryId: 'cat-agri', nameEn: 'Maize / Corn', nameAm: 'በቆሎ', unit: 'QTL', icon: '🌽', handling: ['Dry Bulk (ደረቅ ጭነት)', 'Needs Tarp (ሽፋን ያስፈልገዋል)'] },
  { id: 'good-sesame', categoryId: 'cat-agri', nameEn: 'Oilseeds / Sesame', nameAm: 'ሰሊጥ', unit: 'QTL', icon: '🌱', handling: ['High Value Export (ከፍተኛ ዋጋ)', 'Sealed Covers (የታሸገ)'] },
  { id: 'good-cattle', categoryId: 'cat-live', nameEn: 'Cattle / Livestock', nameAm: 'የቁም ከብት', unit: 'HD', icon: '🐄', handling: ['Live Animal Transport (የቁም እንስሳ)', 'Ventilated Cages (አየር የሚያገኝ)', 'Special Attendant'] },
  { id: 'good-fertilizer', categoryId: 'cat-ind', nameEn: 'Fertilizer', nameAm: 'ማዳበሪያ', unit: 'QTL', icon: '🧪', handling: ['Waterproof Cover (ውሃ የማይገባው)', 'No Food Contamination'] },
  { id: 'good-cement', categoryId: 'cat-ind', nameEn: 'Cement', nameAm: 'ሲሚንቶ', unit: 'QTL', icon: '🧱', handling: ['Heavy Payload (ከባድ ጭነት)', 'Dry Protected (ደረቅ)'] },
  { id: 'good-general', categoryId: 'cat-comm', nameEn: 'General Commercial Freight', nameAm: 'ጠቅላላ የንግድ ዕቃዎች', unit: 'CTN', icon: '📦', handling: ['Handle with Care (ጥንቃቄ)', 'Secured Straps'] },
];

// Measurement Units
const MEASUREMENT_UNITS = [
  { id: 'unit-qtl', code: 'QTL', nameEn: 'Quintal (100 kg)', nameAm: 'ኩንታል', pill: 'Quintal (QTL)' },
  { id: 'unit-ton', code: 'TON', nameEn: 'Ton (1,000 kg)', nameAm: 'ቶን', pill: 'Ton (TON)' },
  { id: 'unit-hd', code: 'HD', nameEn: 'Head Count', nameAm: 'የቁም እንስሳት', pill: 'Head Count (HD)' },
  { id: 'unit-trp', code: 'TRP', nameEn: 'Flat Trip', nameAm: 'ሙሉ ጉዞ', pill: 'Flat Trip (TRP)' },
];

export default function OrderScreen() {
  const { refreshSession } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();

  // Wizard Step: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Master Data state
  const [dbCities, setDbCities] = useState<any[]>(DEFAULT_CITIES);
  const [dbGoods, setDbGoods] = useState<any[]>(DEFAULT_GOODS);
  const [dbUnits, setDbUnits] = useState<any[]>(MEASUREMENT_UNITS);
  const [dbTrucks, setDbTrucks] = useState<any[]>([]);

  // Step 1: Origin & Destination
  const [originCity, setOriginCity] = useState<any>(DEFAULT_CITIES[0]); // Addis Ababa
  const [destinationCity, setDestinationCity] = useState<any>(DEFAULT_CITIES[1]); // Adama
  const [showCityPicker, setShowCityPicker] = useState<'origin' | 'destination' | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string }>({
    distance: '92 km',
    duration: '1 hr 45 min',
  });

  // Map Picker Modal
  const [showFullMapModal, setShowFullMapModal] = useState<boolean>(false);
  const [mapSelectingFor, setMapSelectingFor] = useState<'origin' | 'destination'>('destination');

  // Step 2: Category & Cargo
  const [selectedCategory, setSelectedCategory] = useState<any>(COMMODITY_CATEGORIES[0]);
  const [selectedGood, setSelectedGood] = useState<any>(DEFAULT_GOODS[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [showGoodPicker, setShowGoodPicker] = useState<boolean>(false);

  // Step 3: Volume & Metric
  const [selectedUnit, setSelectedUnit] = useState<any>(MEASUREMENT_UNITS[0]);
  const [quantity, setQuantity] = useState<string>('100');

  // Step 4: Date & Deadline
  const [loadingDate, setLoadingDate] = useState<string>('Today, Oct 13, 2026 (ዛሬ፣ ጥቅምት 3 ቀን 2019 ዓ.ም.)');
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>('Thursday, Oct 15, 2026 (ሐሙስ፣ ጥቅምት 5 ቀን 2019 ዓ.ም.)');

  // Step 5: Price & Delala Benchmark
  const [pricingTier, setPricingTier] = useState<'economy' | 'market' | 'fast'>('market');
  const [proposedOffer, setProposedOffer] = useState<string>('6,000');
  const [ratePerUnit, setRatePerUnit] = useState<number>(60); // 60 ETB per QTL
  const [priceEstimate, setPriceEstimate] = useState<any>(null);

  // Step 6: Driver Offers
  const [allowDriverOffers, setAllowDriverOffers] = useState<boolean>(true);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string } | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);

  // Load master data on mount
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [citiesRes, goodsRes, unitsRes, trucksRes] = await Promise.all([
          (orpc as any).masterData.getCities().catch(() => null),
          (orpc as any).masterData.getGoods().catch(() => null),
          (orpc as any).masterData.getUnits().catch(() => null),
          (orpc as any).masterData.getTrucks().catch(() => null),
        ]);

        if (citiesRes?.data && citiesRes.data.length >= 2) {
          setDbCities(citiesRes.data);
          const addis = citiesRes.data.find((c: any) => c.nameEn?.toLowerCase().includes('addis')) || citiesRes.data[0];
          const adama = citiesRes.data.find((c: any) => c.nameEn?.toLowerCase().includes('adama')) || citiesRes.data[1];
          setOriginCity(addis);
          setDestinationCity(adama);
        }
        if (goodsRes?.data && goodsRes.data.length > 0) {
          setDbGoods(goodsRes.data);
        }
        if (unitsRes?.data && unitsRes.data.length > 0) {
          setDbUnits(unitsRes.data);
        }
        if (trucksRes?.data && trucksRes.data.length > 0) {
          setDbTrucks(trucksRes.data);
        }
      } catch (err) {
        console.warn('⚠️ Master data loading note:', err);
      }
    }
    loadMasterData();
    if (refetchWallet) refetchWallet();
  }, []);

  // Update Route Info when Origin or Destination changes
  useEffect(() => {
    if (!originCity || !destinationCity) return;
    const fetchRoute = async () => {
      try {
        const GEBETA_API_KEY = process.env.EXPO_PUBLIC_GEBETA_MAPS_API_KEY || '';
        const originCoord = `{${originCity.lat || 9.03},${originCity.lng || 38.74}}`;
        const destCoord = `{${destinationCity.lat || 8.54},${destinationCity.lng || 39.27}}`;
        const res = await fetch(
          `https://mapapi.gebeta.app/api/route/direction/?origin=${encodeURIComponent(originCoord)}&destination=${encodeURIComponent(destCoord)}&apiKey=${GEBETA_API_KEY}`
        );
        if (res.ok) {
          const data = await res.json();
          const dist = data.totalDistance || data.distance;
          const time = data.timetaken || data.totalTime || data.time || data.duration;
          if (dist) {
            const distanceKm = Math.round(dist / 1000);
            const durationMin = time ? Math.round(time / 60) : 105;
            const hours = Math.floor(durationMin / 60);
            const mins = durationMin % 60;
            const timeStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
            setRouteInfo({ distance: `${distanceKm} km`, duration: timeStr });
            return;
          }
        }
      } catch (e) {
        // Fallback calculations
      }
      const dLat = (destinationCity.lat - originCity.lat) * 111;
      const dLng = (destinationCity.lng - originCity.lng) * 111;
      const directKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1.25) || 92;
      const estHours = Math.floor(directKm / 55);
      const estMins = Math.round(((directKm % 55) / 55) * 60);
      setRouteInfo({
        distance: `${directKm} km`,
        duration: estHours > 0 ? `${estHours} hr ${estMins} min` : `${estMins} min`,
      });
    };
    fetchRoute();
  }, [originCity, destinationCity]);

  // Delala pricing calculation based on route & quantity
  useEffect(() => {
    const qty = parseFloat(quantity) || 100;
    const distNum = parseInt(routeInfo.distance) || 92;
    const calculatedRatePerUnit = Math.max(35, Math.round(distNum * 0.65));
    setRatePerUnit(calculatedRatePerUnit);

    const baseBenchmark = calculatedRatePerUnit * qty;
    let finalOffer = baseBenchmark;
    if (pricingTier === 'economy') finalOffer = Math.round(baseBenchmark * 0.9);
    else if (pricingTier === 'fast') finalOffer = Math.round(baseBenchmark * 1.1);

    setProposedOffer(finalOffer.toLocaleString());

    async function queryPricingEngine() {
      try {
        const res = await (orpc as any).pricing.getEstimate({
          originCityId: originCity?.id || 'city-addis',
          destinationCityId: destinationCity?.id || 'city-adama',
          pricingUnitId: selectedUnit?.id || 'unit-qtl',
          quantity: qty,
        });
        if (res?.success) {
          setPriceEstimate(res);
        }
      } catch (e) {
        // Quiet fallback
      }
    }
    queryPricingEngine();
  }, [originCity, destinationCity, quantity, selectedUnit, routeInfo, pricingTier]);

  // Recommended truck calculation
  const recommendedTruckInfo = useMemo(() => {
    const qty = parseFloat(quantity) || 100;
    if (qty <= 50) {
      return {
        name: 'Isuzu NPR (አይሱዙ)',
        capacity: '5 Tons max capacity',
        safeFit: `Safe fit for ${qty} ${selectedUnit.code} of ${selectedGood.nameEn}`,
        drivers: '3 Active drivers in corridor match',
      };
    } else if (qty <= 150) {
      return {
        name: 'FSR Truck (ኤፍ ኤስ አር)',
        capacity: '10 Tons max capacity',
        safeFit: `Safe fit for ${qty} ${selectedUnit.code} of ${selectedGood.nameEn} (${qty} ኩንታል ${selectedGood.nameAm} ይጭናል)`,
        drivers: '1 Active driver in Adama corridor matches',
      };
    } else {
      return {
        name: 'Sinotruk Heavy Carrier (ሲኖትራክ)',
        capacity: '40 Tons max capacity',
        safeFit: `Heavy freight fit for ${qty} ${selectedUnit.code} of ${selectedGood.nameEn}`,
        drivers: '5 Heavy haulers available on A1 corridor',
      };
    }
  }, [quantity, selectedUnit, selectedGood]);

  // Step Titles Definition
  const stepTitles = [
    { num: 1, title: 'Corridor Route', sub: 'መነሻ እና መድረሻ ከተሞች', nextLabel: 'Next: Commodity Class' },
    { num: 2, title: 'Commodity Class', sub: 'የጭነት ዓይነት', nextLabel: 'Next: Volume & Metric' },
    { num: 3, title: 'Volume & Metric', sub: 'መጠን እና መለኪያ', nextLabel: 'Next: Date & Deadline' },
    { num: 4, title: 'Date & Deadline', sub: 'ቀን እና የጊዜ ገደብ', nextLabel: 'Next: Price & Delala' },
    { num: 5, title: 'Price & Delala', sub: 'ዋጋ እና የደላላ መነሻ', nextLabel: 'Next: Driver Bids' },
    { num: 6, title: 'Driver Bids', sub: 'የአሽከርካሪዎች ጨረታ', nextLabel: 'Next: Summary & Escrow' },
    { num: 7, title: 'Summary & Escrow', sub: 'ማጠቃለያ እና የዋስትና ስምምነት', nextLabel: 'Post Load to Verified Freight Board' },
  ];

  // City selection handler
  const handleSelectCity = (city: any) => {
    if (showCityPicker === 'origin') {
      if (city.id === destinationCity?.id) {
        showToast({ type: 'error', message: 'Origin cannot be the same as Destination' });
        return;
      }
      setOriginCity(city);
    } else if (showCityPicker === 'destination') {
      if (city.id === originCity?.id) {
        showToast({ type: 'error', message: 'Destination cannot be the same as Origin' });
        return;
      }
      setDestinationCity(city);
    }
    setShowCityPicker(null);
    setCitySearchQuery('');
  };

  // Next step handler
  const handleNext = () => {
    if (currentStep === 1) {
      if (!originCity || !destinationCity) {
        showToast({ type: 'error', message: 'Please select both origin and destination' });
        return;
      }
      if (originCity.id === destinationCity.id) {
        showToast({ type: 'error', message: 'Destination must differ from origin' });
        return;
      }
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  // Back step handler
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/user/home');
    }
  };

  // Final submit to MySQL database via orpc.order.create
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await refreshSession();
      const budgetClean = parseFloat(proposedOffer.replace(/,/g, '')) || 6000;
      const res = await (orpc as any).order.create({
        pickupAddress: `${originCity.nameEn} (${originCity.nameAm || ''}), ${originCity.region || 'Ethiopia'}`,
        pickupLatitude: originCity.lat || 9.03,
        pickupLongitude: originCity.lng || 38.74,
        deliveryAddress: `${destinationCity.nameEn} (${destinationCity.nameAm || ''}), ${destinationCity.region || 'Ethiopia'}`,
        deliveryLatitude: destinationCity.lat || 8.54,
        deliveryLongitude: destinationCity.lng || 39.27,
        materials: [`${selectedGood.nameEn} (${quantity} ${selectedUnit.code})`],
        vehicleType: 'truck',
        notes: `Budget: ${budgetClean} ETB | Corridor: ${originCity.nameEn} -> ${destinationCity.nameEn} | Cargo: ${selectedGood.nameEn} (${quantity} ${selectedUnit.code}) | Truck: ${recommendedTruckInfo.name} | Loading: ${loadingDate} | Deadline: ${deliveryDeadline} | Allow Driver Bids: ${allowDriverOffers ? 'Yes' : 'No'}${specialInstructions ? ` | Notes: ${specialInstructions}` : ''}`,
      });

      if (res?.success) {
        showToast({ type: 'success', message: 'Freight order successfully published!' });
        setCreatedOrder({ id: res.orderId });
      } else {
        showToast({ type: 'error', message: res?.message || 'Failed to post load' });
      }
    } catch (e: any) {
      console.error('Error posting load order:', e);
      showToast({ type: 'error', message: e?.message || 'Order creation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return dbCities;
    const q = citySearchQuery.toLowerCase();
    return dbCities.filter(
      (c) =>
        c.nameEn?.toLowerCase().includes(q) ||
        c.nameAm?.includes(q) ||
        c.region?.toLowerCase().includes(q)
    );
  }, [dbCities, citySearchQuery]);

  // Filtered goods list by category
  const filteredGoods = useMemo(() => {
    return dbGoods.filter((g) => g.categoryId === selectedCategory.id || !g.categoryId);
  }, [dbGoods, selectedCategory]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header with Compact Margins */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Post a Load</Text>
            <Text style={styles.headerSubtitle}>
              Step {currentStep} of 7: {stepTitles[currentStep - 1].title}
            </Text>
          </View>
          <View style={styles.circularStepBadge}>
            <Text style={styles.circularStepText}>{currentStep}/7</Text>
          </View>
        </View>

        {/* Thin Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(currentStep / 7) * 100}%` }]} />
        </View>

        {/* Compact Horizontal Steps Pill Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
          contentContainerStyle={styles.stepsScroll}
        >
          {stepTitles.map((st) => {
            const isActive = st.num === currentStep;
            const isCompleted = st.num < currentStep;
            return (
              <TouchableOpacity
                key={st.num}
                onPress={() => st.num <= currentStep && setCurrentStep(st.num)}
                style={[
                  styles.stepPill,
                  isActive && styles.stepPillActive,
                  isCompleted && styles.stepPillCompleted,
                ]}
              >
                {isCompleted ? <Check size={12} color="#10B981" /> : null}
                <Text
                  style={[
                    styles.stepPillText,
                    isActive && styles.stepPillTextActive,
                    isCompleted && styles.stepPillTextCompleted,
                  ]}
                >
                  {isCompleted ? `${st.title}` : `${st.num} ${st.title}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main Step Body Scroll */}
        <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
          {/* ============================================================ */}
          {/* STEP 1: CORRIDOR ROUTE (መነሻ እና መድረሻ)                          */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Origin & Destination (መነሻ እና መድረሻ)</Text>
                  <Text style={styles.cardSub}>
                    Select standardized Ethiopian hubs or drop pins on the map.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cardActionIconBtn}
                  onPress={() => setShowFullMapModal(true)}
                >
                  <MapIcon size={18} color="#10B981" />
                </TouchableOpacity>
              </View>

              {/* Origin Hub Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Origin Hub (መነሻ ከተማ) *</Text>
                <TouchableOpacity
                  style={styles.selectDropdown}
                  onPress={() => {
                    setCitySearchQuery('');
                    setShowCityPicker('origin');
                  }}
                >
                  <View style={styles.selectDropdownLeft}>
                    <View style={styles.pinCircleGreen}>
                      <MapPin size={15} color="#10B981" />
                    </View>
                    <Text style={styles.selectDropdownValue}>
                      {originCity?.nameEn} ({originCity?.nameAm || ''})
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </TouchableOpacity>
                <View style={styles.helperRow}>
                  <Lock size={12} color="#6B7280" />
                  <Text style={styles.helperText}>Verified hub in your assigned territory.</Text>
                </View>
              </View>

              {/* Drop-off Hub Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Drop-off Hub (መድረሻ ከተማ) *</Text>
                <TouchableOpacity
                  style={styles.selectDropdown}
                  onPress={() => {
                    setCitySearchQuery('');
                    setShowCityPicker('destination');
                  }}
                >
                  <View style={styles.selectDropdownLeft}>
                    <Text style={styles.selectDropdownValue}>
                      {destinationCity?.nameEn} ({destinationCity?.nameAm || ''})
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Interactive Route Preview */}
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionHeader}>Interactive Preview</Text>
                <View style={styles.routePreviewCard}>
                  <Text style={styles.routePreviewTitle}>
                    {originCity?.nameEn} to {destinationCity?.nameEn} A1 corridor
                  </Text>
                  <Text style={styles.routePreviewSub}>Route Map</Text>

                  {/* Embedded Route Visual Map */}
                  <View style={styles.mapContainerPreview}>
                    <MapComponent
                      style={StyleSheet.absoluteFillObject}
                      markers={[
                        { lat: originCity?.lat || 9.03, lng: originCity?.lng || 38.74, type: 'pickup', title: originCity?.nameEn },
                        { lat: destinationCity?.lat || 8.54, lng: destinationCity?.lng || 39.27, type: 'delivery', title: destinationCity?.nameEn },
                      ]}
                      route={{
                        pickup: { lat: originCity?.lat || 9.03, lng: originCity?.lng || 38.74 },
                        delivery: { lat: destinationCity?.lat || 8.54, lng: destinationCity?.lng || 39.27 },
                      }}
                      showControls={false}
                    />

                    {/* Stats & Pin Badges */}
                    <View style={styles.routeFloatingStats}>
                      <View style={styles.routeDistanceBadge}>
                        <Text style={styles.routeDistanceBadgeText}>
                          📏 {routeInfo.distance} • {routeInfo.duration}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.mapPinActionBtn}
                        onPress={() => setShowFullMapModal(true)}
                      >
                        <MapPin size={13} color="#FFFFFF" />
                        <Text style={styles.mapPinActionText}>Map pin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 2: COMMODITY & CARGO CLASSIFICATION (የጭነት ዓይነት)        */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Select Category & Cargo (የጭነት ዓይነት)</Text>
                  <Text style={styles.cardSub}>
                    Choose your primary category and goods type. Options filter compatible trucks.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <Package size={18} color="#10B981" />
                </View>
              </View>

              {/* Commodity Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Commodity Category (የጭነት ዘርፍ) *</Text>
                <TouchableOpacity
                  style={styles.selectDropdown}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <View style={styles.selectDropdownLeft}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{selectedCategory.icon}</Text>
                    <Text style={styles.selectDropdownValue}>
                      {selectedCategory.nameEn} ({selectedCategory.nameAm})
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Cargo Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Cargo Type (የጭነት ዓይነት) *</Text>
                <TouchableOpacity
                  style={styles.selectDropdown}
                  onPress={() => setShowGoodPicker(true)}
                >
                  <View style={styles.selectDropdownLeft}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{selectedGood.icon || '🌾'}</Text>
                    <Text style={styles.selectDropdownValue}>
                      {selectedGood.nameEn} ({selectedGood.nameAm || ''})
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Handling Preview */}
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionHeader}>Interactive Preview</Text>
                <Text style={[styles.fieldLabel, { marginTop: 2 }]}>
                  Required Handling (የአያያዝ መስፈርቶች)
                </Text>
                <View style={styles.handlingBadgesRow}>
                  {(selectedGood.handling || ['Dry Bulk (ደረቅ ጭነት)', 'Needs Tarp (ሽፋን ያስፈልገዋል)', 'Secure Loading (አስተማማኝ ጭነት)']).map(
                    (h: string, idx: number) => {
                      const isTarp = h.includes('Tarp') || h.includes('ሽፋን');
                      const isSecure = h.includes('Secure') || h.includes('አስተማማኝ');
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.handlingBadge,
                            isTarp && styles.handlingBadgeAmber,
                            isSecure && styles.handlingBadgeBlue,
                          ]}
                        >
                          <Text
                            style={[
                              styles.handlingBadgeText,
                              isTarp && styles.handlingBadgeTextAmber,
                              isSecure && styles.handlingBadgeTextBlue,
                            ]}
                          >
                            {isTarp ? '🌧️ ' : isSecure ? '🔒 ' : '🌾 '}
                            {h}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 3: VOLUME & MEASUREMENT METRIC (መጠን እና መለኪያ)           */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Load Metrics & Capacity (መጠን እና መለኪያ)</Text>
                  <Text style={styles.cardSub}>
                    Define measurement unit and exact volume to identify valid vehicle types.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <Scale size={18} color="#10B981" />
                </View>
              </View>

              {/* Measurement Unit Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Measurement Unit (የመለኪያ ዓይነት) *</Text>
                <View style={styles.selectDropdown}>
                  <View style={styles.selectDropdownLeft}>
                    <Scale size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <Text style={styles.selectDropdownValue}>
                      {selectedUnit.nameEn} ({selectedUnit.nameAm})
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </View>

                {/* Quick Unit Pills */}
                <View style={styles.unitPillsRow}>
                  {MEASUREMENT_UNITS.map((u) => {
                    const isSelected = selectedUnit.id === u.id;
                    return (
                      <TouchableOpacity
                        key={u.id}
                        onPress={() => setSelectedUnit(u)}
                        style={[styles.unitPill, isSelected && styles.unitPillActive]}
                      >
                        <Text style={[styles.unitPillText, isSelected && styles.unitPillTextActive]}>
                          {u.pill}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Quantity Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Quantity (ብዛት) *</Text>
                <View style={styles.quantityInputBox}>
                  <Text style={styles.quantityIcon}>10=</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="100"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <Text style={styles.helperText}>
                  Quantity range for verified routes is up to 150 QTL.
                </Text>
              </View>

              {/* Vehicle Recommendation Preview */}
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionHeader}>Interactive Preview</Text>
                <View style={styles.recommendationCard}>
                  <Text style={styles.recommendationHeaderTitle}>
                    🚚 Recommended: {recommendedTruckInfo.name}
                  </Text>
                  <View style={styles.recommendationBoxInner}>
                    <Text style={styles.recWeightText}>
                      Weight: {recommendedTruckInfo.capacity}
                    </Text>
                    <Text style={styles.recSafeFitText}>
                      {recommendedTruckInfo.safeFit}
                    </Text>
                    <Text style={styles.recActiveDriversText}>
                      {recommendedTruckInfo.drivers}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 4: DATE & DEADLINE (ቀን እና የጊዜ ገደብ)                     */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>4</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Date & Deadline (ቀን እና የጊዜ ገደብ)</Text>
                  <Text style={styles.cardSub}>
                    Pick your target loading schedule and delivery deadline. Alerts broadcast accordingly.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <Calendar size={18} color="#10B981" />
                </View>
              </View>

              {/* Loading Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Loading Date (የመጫኛ ቀን) *</Text>
                <TouchableOpacity
                  style={styles.dateSelectorBtn}
                  onPress={() => {
                    setLoadingDate('Today, Oct 13, 2026 (ዛሬ፣ ጥቅምት 3 ቀን 2019 ዓ.ም.)');
                  }}
                >
                  <Calendar size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{loadingDate}</Text>
                </TouchableOpacity>
              </View>

              {/* Delivery Deadline */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Delivery Deadline (የማድረሻ ጊዜ ወሰን) *</Text>
                <TouchableOpacity
                  style={styles.dateSelectorBtn}
                  onPress={() => {
                    setDeliveryDeadline('Thursday, Oct 15, 2026 (ሐሙስ፣ ጥቅምት 5 ቀን 2019 ዓ.ም.)');
                  }}
                >
                  <Clock size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{deliveryDeadline}</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar Timeline Preview */}
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionHeader}>Interactive Preview</Text>
                <View style={styles.calendarScheduleBox}>
                  <Text style={styles.calendarScheduleTitle}>Calendar Schedule (የቀን መቁጠሪያ)</Text>

                  <View style={styles.timelineRow}>
                    <View style={styles.miniDaysGrid}>
                      <View style={styles.calendarDayCol}>
                        <Text style={styles.dayMonth}>Oct</Text>
                        <Text style={styles.dayNum}>11</Text>
                        <Text style={styles.dayNumFaint}>18</Text>
                      </View>
                      <View style={styles.calendarDayCol}>
                        <Text style={styles.dayMonth}>Fri</Text>
                        <View style={styles.dayHighlightFaint}>
                          <Text style={styles.dayNumActive}>12</Text>
                        </View>
                        <Text style={styles.dayNumFaint}>19</Text>
                      </View>
                      <View style={styles.calendarDayCol}>
                        <Text style={styles.dayMonth}>Oct</Text>
                        <View style={styles.dayHighlightActive}>
                          <Text style={styles.dayNumActive}>13</Text>
                        </View>
                        <Text style={styles.dayNumFaint}>20</Text>
                      </View>
                      <View style={styles.calendarDayCol}>
                        <Text style={styles.dayMonth}>Sa</Text>
                        <View style={styles.dayHighlightActive}>
                          <Text style={styles.dayNumActive}>14</Text>
                        </View>
                        <Text style={styles.dayNumFaint}>21</Text>
                      </View>
                      <View style={styles.calendarDayCol}>
                        <Text style={styles.dayMonth}>Oct</Text>
                        <View style={styles.dayHighlightActive}>
                          <Text style={styles.dayNumActive}>15</Text>
                        </View>
                        <Text style={styles.dayNumFaint}>22</Text>
                      </View>
                    </View>

                    <View style={styles.transitWindowBadgeWrapper}>
                      <View style={styles.transitWindowLine} />
                      <View>
                        <Text style={styles.transitWindowHours}>48 Hours Transit Window</Text>
                        <Text style={styles.transitWindowHoursAm}>(48 ሰዓት የመጓጓዣ ጊዜ)</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.smartNotificationRow}>
                    <Text style={{ fontSize: 13, marginRight: 6 }}>🔔</Text>
                    <Text style={styles.smartNotificationText}>
                      <Text style={{ fontWeight: '700', color: '#F59E0B' }}>Smart Notification: </Text>
                      Dispatch alerts will run 12 hours prior.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 5: PRICE & DELALA BENCHMARK (ዋጋ እና የደላላ መነሻ)            */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>5</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Price & Delala Benchmark (ዋጋ እና የደላላ መነሻ)</Text>
                  <Text style={styles.cardSub}>
                    Submit your final budget based on live Digital Delala (የደላላ) benchmark pricing on your route.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <DollarSign size={18} color="#10B981" />
                </View>
              </View>

              {/* Verified Ground Benchmark Badge */}
              <View style={styles.verifiedBenchmarkBadge}>
                <Check size={13} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.verifiedBenchmarkText}>
                  Verified Ground Benchmark (የወቅቱ መነሻ ዋጋ)
                </Text>
              </View>

              {/* Benchmark Value Header */}
              <View style={styles.benchmarkHeader}>
                <Text style={styles.benchmarkMainPrice}>
                  {(ratePerUnit * (parseFloat(quantity) || 100)).toLocaleString()} ETB (Recommended)
                </Text>
                <Text style={styles.benchmarkSubFormula}>
                  (የደላላው መነሻ ዋጋ — {ratePerUnit} ETB per {selectedUnit.code} × {quantity} {selectedUnit.code})
                </Text>
                <Text style={styles.benchmarkSubNote}>
                  based on the {quantity} {selectedUnit.nameEn} from Step 3.
                </Text>
              </View>

              {/* 3 Tier Rates */}
              <View style={styles.tierButtonsContainer}>
                <TouchableOpacity
                  style={[styles.tierRow, pricingTier === 'economy' && styles.tierRowSelected]}
                  onPress={() => setPricingTier('economy')}
                >
                  <Text style={styles.tierName}>Economy (ቀነሰኛ)</Text>
                  <Text style={styles.tierPrice}>
                    [{(Math.round(ratePerUnit * (parseFloat(quantity) || 100) * 0.9)).toLocaleString()} ETB]
                  </Text>
                  {pricingTier === 'economy' && (
                    <Text style={styles.tierSelectedTag}> - Selected</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierRow, pricingTier === 'market' && styles.tierRowSelected]}
                  onPress={() => setPricingTier('market')}
                >
                  <Text style={[styles.tierName, pricingTier === 'market' && styles.tierNameActive]}>
                    Market (መደበኛ)
                  </Text>
                  <Text style={[styles.tierPrice, pricingTier === 'market' && styles.tierPriceActive]}>
                    [{(ratePerUnit * (parseFloat(quantity) || 100)).toLocaleString()} ETB]
                  </Text>
                  {pricingTier === 'market' && (
                    <Text style={styles.tierSelectedTag}> - Selected</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierRow, pricingTier === 'fast' && styles.tierRowSelected]}
                  onPress={() => setPricingTier('fast')}
                >
                  <Text style={styles.tierName}>Fast Pickup (ፈጣን)</Text>
                  <Text style={styles.tierPrice}>
                    [{(Math.round(ratePerUnit * (parseFloat(quantity) || 100) * 1.1)).toLocaleString()} ETB]
                  </Text>
                  {pricingTier === 'fast' && (
                    <Text style={styles.tierSelectedTag}> - Selected</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Proposed Offer Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your Final Proposed Offer (የእርስዎ መነሻ ዋጋ) *</Text>
                <View style={styles.proposedOfferInputContainer}>
                  <TextInput
                    style={styles.proposedOfferInput}
                    keyboardType="numeric"
                    value={proposedOffer}
                    onChangeText={setProposedOffer}
                  />
                  <Text style={styles.proposedOfferCurrency}>ETB (ብር)</Text>
                </View>
                <View style={styles.helperRow}>
                  <Lock size={12} color="#D97706" />
                  <Text style={[styles.helperText, { color: '#D97706' }]}>
                    Offers below {(Math.round(ratePerUnit * (parseFloat(quantity) || 100) * 0.9)).toLocaleString()} ETB might cause delays in driver match.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 6: DRIVER BIDS & OFFERS (የአሽከርካሪዎች ጨረታ)                 */}
          {/* ============================================================ */}
          {currentStep === 6 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>6</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Driver Bidding (የአሽከርካሪዎች ጨረታ)</Text>
                  <Text style={styles.cardSub}>
                    Control whether drivers can place counter-offers against your proposed budget.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <Truck size={18} color="#10B981" />
                </View>
              </View>

              {/* Direct Bidding Toggle */}
              <View style={styles.toggleRowBox}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.toggleTitleText}>Allow Direct Driver Counter-Offers</Text>
                  <Text style={styles.toggleSubText}>
                    Verified drivers can propose competitive counter-bids within standard corridor boundaries.
                  </Text>
                </View>
                <Switch
                  value={allowDriverOffers}
                  onValueChange={setAllowDriverOffers}
                  trackColor={{ false: '#374151', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Special Handling Instructions */}
              <View style={[styles.fieldGroup, { marginTop: 14 }]}>
                <Text style={styles.fieldLabel}>Special Handling Instructions (አማራጭ ማስታወሻ)</Text>
                <TextInput
                  style={styles.textAreaBox}
                  multiline
                  numberOfLines={3}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  placeholder="e.g. Fragile cargo, waterproof tarpaulin required, warehouse bay #4"
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Escrow Guarantee Highlight */}
              <View style={styles.escrowCardNotice}>
                <ShieldCheck size={20} color="#10B981" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.escrowNoticeTitle}>MyTruck Escrow Protection (የዋስትና ጥበቃ)</Text>
                  <Text style={styles.escrowNoticeText}>
                    Funds are secured safely in platform escrow and only released upon verified OTP drop-off confirmation.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 7: SUMMARY & ESCROW REVIEW (ማጠቃለያ እና የዋስትና ስምምነት)       */}
          {/* ============================================================ */}
          {currentStep === 7 && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.stepNumIcon}>
                  <Text style={styles.stepNumText}>7</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Final Shipment Summary (የጭነት ማጠቃለያ)</Text>
                  <Text style={styles.cardSub}>
                    Review complete standardized load specifications before publishing.
                  </Text>
                </View>
                <View style={styles.cardActionIconBtn}>
                  <ShieldCheck size={18} color="#10B981" />
                </View>
              </View>

              {/* 7-Step Recap Summary Box */}
              <View style={styles.recapCard}>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>1. Corridor Route:</Text>
                  <Text style={styles.recapValue}>
                    {originCity?.nameEn} ➔ {destinationCity?.nameEn} ({routeInfo.distance})
                  </Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>2. Commodity Class:</Text>
                  <Text style={styles.recapValue}>
                    {selectedGood.nameEn} ({selectedGood.nameAm || ''})
                  </Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>3. Quantity & Metric:</Text>
                  <Text style={styles.recapValue}>
                    {quantity} {selectedUnit.code} ({selectedUnit.nameEn})
                  </Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>4. Assigned Truck:</Text>
                  <Text style={styles.recapValue}>{recommendedTruckInfo.name}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>5. Schedule Window:</Text>
                  <Text style={styles.recapValue}>48 Hours Transit (Oct 13 – Oct 15)</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>6. Escrow Budget:</Text>
                  <Text style={[styles.recapValue, { color: '#10B981', fontWeight: '800' }]}>
                    {proposedOffer} ETB
                  </Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>7. Driver Offers:</Text>
                  <Text style={styles.recapValue}>
                    {allowDriverOffers ? 'Allowed (የተፈቀደ)' : 'Fixed Price'}
                  </Text>
                </View>
              </View>

              {/* Wallet Escrow Balance Notice */}
              <View style={styles.walletBalanceNotice}>
                <Text style={styles.walletBalanceTitle}>
                  Available Wallet Balance: {parseFloat(wallet?.balance || '0').toLocaleString()} ETB
                </Text>
                <Text style={styles.walletBalanceSub}>
                  When an offer is accepted, {proposedOffer} ETB is held in reserved escrow.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Compact Sticky Bottom Action Button */}
        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={[styles.nextActionBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : null}
            <Text style={styles.nextActionBtnText}>
              {isSubmitting
                ? 'Publishing Load...'
                : `${stepTitles[currentStep - 1].nextLabel}`}
            </Text>
            {!isSubmitting && <ArrowRight size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ============================================================ */}
      {/* CITY PICKER MODAL (ORIGIN & DESTINATION)                     */}
      {/* ============================================================ */}
      <Modal
        visible={!!showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>
                {showCityPicker === 'origin' ? 'Select Origin Hub (መነሻ ከተማ)' : 'Select Drop-off Hub (መድረሻ ከተማ)'}
              </Text>
              <TouchableOpacity onPress={() => setShowCityPicker(null)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* City Search Input */}
            <View style={styles.citySearchBox}>
              <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.citySearchInput}
                placeholder="Search Ethiopian city or region..."
                placeholderTextColor="#9CA3AF"
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                autoFocus
              />
            </View>

            {/* Cities List */}
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {filteredCities.map((city) => {
                const isSelected =
                  (showCityPicker === 'origin' && originCity?.id === city.id) ||
                  (showCityPicker === 'destination' && destinationCity?.id === city.id);

                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.cityItemRow, isSelected && styles.cityItemRowSelected]}
                    onPress={() => handleSelectCity(city)}
                  >
                    <View style={styles.cityItemLeft}>
                      <MapPin size={16} color={isSelected ? '#10B981' : '#9CA3AF'} style={{ marginRight: 10 }} />
                      <View>
                        <Text style={[styles.cityNameText, isSelected && { color: '#10B981', fontWeight: '700' }]}>
                          {city.nameEn} {city.nameAm ? `(${city.nameAm})` : ''}
                        </Text>
                        <Text style={styles.cityRegionText}>{city.region || 'Ethiopia'}</Text>
                      </View>
                    </View>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* COMMODITY CATEGORY PICKER MODAL                              */}
      {/* ============================================================ */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Select Commodity Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8, marginTop: 8 }}>
              {COMMODITY_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryPickerRow, isSelected && styles.categoryPickerRowSelected]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryPicker(false);
                      const matching = dbGoods.find((g) => g.categoryId === cat.id);
                      if (matching) setSelectedGood(matching);
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 10 }}>{cat.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.categoryPickerTitle, isSelected && { color: '#10B981' }]}>
                        {cat.nameEn}
                      </Text>
                      <Text style={styles.categoryPickerSub}>{cat.nameAm}</Text>
                    </View>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* CARGO TYPE PICKER MODAL                                      */}
      {/* ============================================================ */}
      <Modal
        visible={showGoodPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoodPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Select Cargo Type</Text>
              <TouchableOpacity onPress={() => setShowGoodPicker(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350, marginTop: 8 }}>
              {filteredGoods.map((good) => {
                const isSelected = selectedGood.id === good.id;
                return (
                  <TouchableOpacity
                    key={good.id}
                    style={[styles.categoryPickerRow, isSelected && styles.categoryPickerRowSelected]}
                    onPress={() => {
                      setSelectedGood(good);
                      setShowGoodPicker(false);
                      if (good.unit) {
                        const matchedUnit = MEASUREMENT_UNITS.find((u) => u.code === good.unit);
                        if (matchedUnit) setSelectedUnit(matchedUnit);
                      }
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 10 }}>{good.icon || '🌾'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.categoryPickerTitle, isSelected && { color: '#10B981' }]}>
                        {good.nameEn}
                      </Text>
                      <Text style={styles.categoryPickerSub}>{good.nameAm || ''}</Text>
                    </View>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* FULL MAP PIN-DROP MODAL                                      */}
      {/* ============================================================ */}
      <Modal visible={showFullMapModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#111215' }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={styles.mapModalHeader}>
              <TouchableOpacity onPress={() => setShowFullMapModal(false)} style={styles.iconBtn}>
                <ArrowLeft size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Pinpoint Route on Map</Text>
              <TouchableOpacity
                onPress={() => setShowFullMapModal(false)}
                style={[styles.circularStepBadge, { backgroundColor: '#10B981' }]}
              >
                <Check size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <MapComponent
                style={StyleSheet.absoluteFillObject}
                markers={[
                  { lat: originCity?.lat || 9.03, lng: originCity?.lng || 38.74, type: 'pickup', title: originCity?.nameEn },
                  { lat: destinationCity?.lat || 8.54, lng: destinationCity?.lng || 39.27, type: 'delivery', title: destinationCity?.nameEn },
                ]}
                route={{
                  pickup: { lat: originCity?.lat || 9.03, lng: originCity?.lng || 38.74 },
                  delivery: { lat: destinationCity?.lat || 8.54, lng: destinationCity?.lng || 39.27 },
                }}
                onMapPress={(coord) => {
                  if (mapSelectingFor === 'origin') {
                    setOriginCity({
                      ...originCity,
                      nameEn: `Pin (${coord.latitude.toFixed(2)}, ${coord.longitude.toFixed(2)})`,
                      lat: coord.latitude,
                      lng: coord.longitude,
                    });
                    showToast({ type: 'success', message: 'Pickup pin set' });
                  } else {
                    setDestinationCity({
                      ...destinationCity,
                      nameEn: `Pin (${coord.latitude.toFixed(2)}, ${coord.longitude.toFixed(2)})`,
                      lat: coord.latitude,
                      lng: coord.longitude,
                    });
                    showToast({ type: 'success', message: 'Destination pin set' });
                  }
                }}
              />

              <View style={styles.mapModalToggleBar}>
                <TouchableOpacity
                  style={[
                    styles.mapToggleBtnItem,
                    mapSelectingFor === 'origin' && styles.mapToggleBtnItemActive,
                  ]}
                  onPress={() => setMapSelectingFor('origin')}
                >
                  <MapPin size={15} color={mapSelectingFor === 'origin' ? '#FFFFFF' : '#9CA3AF'} />
                  <Text style={[styles.mapToggleText, mapSelectingFor === 'origin' && { color: '#FFFFFF' }]}>
                    Pin Origin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mapToggleBtnItem,
                    mapSelectingFor === 'destination' && styles.mapToggleBtnItemActive,
                  ]}
                  onPress={() => setMapSelectingFor('destination')}
                >
                  <MapPin size={15} color={mapSelectingFor === 'destination' ? '#FFFFFF' : '#9CA3AF'} />
                  <Text style={[styles.mapToggleText, mapSelectingFor === 'destination' && { color: '#FFFFFF' }]}>
                    Pin Destination
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* SUCCESS CONFIRMATION MODAL                                   */}
      {/* ============================================================ */}
      <Modal visible={!!createdOrder} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconCircle}>
              <ShieldCheck size={36} color="#10B981" />
            </View>
            <Text style={styles.successModalTitle}>Load Successfully Posted!</Text>
            <Text style={styles.successModalDesc}>
              Your freight shipment has been registered in the database. Verified drivers along the {originCity?.nameEn} ➔ {destinationCity?.nameEn} corridor have been notified.
            </Text>

            <View style={styles.successDetailsBox}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Reference:</Text>
                <Text style={styles.successDetailVal}>{createdOrder?.id?.slice(0, 16)}...</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Corridor Route:</Text>
                <Text style={styles.successDetailVal}>
                  {originCity?.nameEn} ➔ {destinationCity?.nameEn}
                </Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Reserved Escrow:</Text>
                <Text style={[styles.successDetailVal, { color: '#10B981', fontWeight: '800' }]}>
                  {proposedOffer} ETB
                </Text>
              </View>
            </View>

            <View style={styles.successModalBtnsRow}>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => {
                  setCreatedOrder(null);
                  router.replace('/(tabs)/user/home');
                }}
              >
                <Text style={styles.modalDoneBtnText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalTrackBtn}
                onPress={() => {
                  const id = createdOrder?.id;
                  setCreatedOrder(null);
                  if (id) setShowOrderStatus(true);
                  else router.replace('/(tabs)/user/home');
                }}
              >
                <Text style={styles.modalTrackBtnText}>Track Order</Text>
                <ExternalLink size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Status Sheet integration */}
      {createdOrder?.id && (
        <OrderStatusSheet
          visible={showOrderStatus}
          orderId={createdOrder.id}
          onClose={() => {
            setShowOrderStatus(false);
            router.replace('/(tabs)/user/home');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
  circularStepBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  circularStepText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#262933',
    marginHorizontal: 16,
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  stepsScrollView: {
    flexGrow: 0,
    height: 42,
    marginVertical: 2,
  },
  stepsScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23252E',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    gap: 5,
    alignSelf: 'center',
  },
  stepPillActive: {
    backgroundColor: '#0D9488',
  },
  stepPillCompleted: {
    backgroundColor: '#1E242B',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  stepPillText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  stepPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepPillTextCompleted: {
    color: '#E5E7EB',
  },
  bodyScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#1C1E24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2D37',
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  stepNumIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  cardActionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#242833',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  selectDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252831',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  selectDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinCircleGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectDropdownValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 10.5,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  routePreviewCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 10,
    overflow: 'hidden',
  },
  routePreviewTitle: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '800',
  },
  routePreviewSub: {
    color: '#6B7280',
    fontSize: 10.5,
    marginBottom: 8,
  },
  mapContainerPreview: {
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  routeFloatingStats: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDistanceBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeDistanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
  },
  mapPinActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  mapPinActionText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  bottomBarContainer: {
    backgroundColor: '#16181F',
    borderTopWidth: 1,
    borderTopColor: '#252833',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nextActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    height: 46,
  },
  nextActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  handlingBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  handlingBadge: {
    backgroundColor: '#1E2D28',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  handlingBadgeAmber: {
    backgroundColor: '#352918',
    borderColor: '#D97706',
  },
  handlingBadgeBlue: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
  },
  handlingBadgeText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '600',
  },
  handlingBadgeTextAmber: {
    color: '#FBBF24',
  },
  handlingBadgeTextBlue: {
    color: '#9CA3AF',
  },
  unitPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  unitPill: {
    backgroundColor: '#252831',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  unitPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  unitPillText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    fontWeight: '600',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quantityInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252831',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  quantityIcon: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  quantityInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#2F333E',
    borderRadius: 10,
    padding: 10,
  },
  recommendationHeaderTitle: {
    color: '#F9FAFB',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  recommendationBoxInner: {
    backgroundColor: '#20232B',
    borderRadius: 6,
    padding: 8,
    gap: 3,
  },
  recWeightText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
  },
  recSafeFitText: {
    color: '#9CA3AF',
    fontSize: 10.5,
  },
  recActiveDriversText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  dateSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252831',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  dateSelectorText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  calendarScheduleBox: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#2F333E',
    borderRadius: 10,
    padding: 10,
  },
  calendarScheduleTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22252E',
    borderRadius: 8,
    padding: 8,
  },
  miniDaysGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  calendarDayCol: {
    alignItems: 'center',
    width: 22,
  },
  dayMonth: {
    color: '#6B7280',
    fontSize: 8.5,
    marginBottom: 2,
  },
  dayNum: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  dayNumFaint: {
    color: '#4B5563',
    fontSize: 9.5,
    marginTop: 2,
  },
  dayHighlightActive: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHighlightFaint: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumActive: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  transitWindowBadgeWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  transitWindowLine: {
    width: 10,
    height: 2,
    backgroundColor: '#0D9488',
    marginRight: 4,
  },
  transitWindowHours: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  transitWindowHoursAm: {
    color: '#9CA3AF',
    fontSize: 9.5,
  },
  smartNotificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  smartNotificationText: {
    color: '#D1D5DB',
    fontSize: 10.5,
  },
  verifiedBenchmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verifiedBenchmarkText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '700',
  },
  benchmarkHeader: {
    alignItems: 'center',
    marginVertical: 6,
  },
  benchmarkMainPrice: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  benchmarkSubFormula: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 3,
  },
  benchmarkSubNote: {
    color: '#6B7280',
    fontSize: 9.5,
    marginTop: 2,
  },
  tierButtonsContainer: {
    gap: 6,
    marginVertical: 10,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22252E',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tierRowSelected: {
    borderColor: '#0D9488',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  tierName: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '500',
    marginRight: 6,
  },
  tierNameActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  tierPrice: {
    color: '#D1D5DB',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tierPriceActive: {
    color: '#10B981',
  },
  tierSelectedTag: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '600',
  },
  proposedOfferInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22252E',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  proposedOfferInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  proposedOfferCurrency: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#22252E',
    borderRadius: 8,
    padding: 10,
  },
  toggleTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleSubText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  textAreaBox: {
    backgroundColor: '#22252E',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 11.5,
    textAlignVertical: 'top',
    height: 60,
  },
  escrowCardNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  escrowNoticeTitle: {
    color: '#34D399',
    fontSize: 11.5,
    fontWeight: '700',
  },
  escrowNoticeText: {
    color: '#A7F3D0',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  recapCard: {
    backgroundColor: '#22252E',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    color: '#9CA3AF',
    fontSize: 10.5,
  },
  recapValue: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  walletBalanceNotice: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1E232B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F333E',
  },
  walletBalanceTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  walletBalanceSub: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#1A1C22',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitleText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  citySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252831',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 8,
  },
  citySearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12.5,
  },
  cityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#262933',
  },
  cityItemRowSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 6,
  },
  cityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityNameText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  cityRegionText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 1,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#252831',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryPickerRowSelected: {
    borderColor: '#0D9488',
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
  },
  categoryPickerTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  categoryPickerSub: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 1,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#252833',
  },
  mapModalToggleBar: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    flexDirection: 'row',
    gap: 10,
  },
  mapToggleBtnItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2028',
    height: 42,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#374151',
  },
  mapToggleBtnItemActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  mapToggleText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  successModalCard: {
    backgroundColor: '#1C1E24',
    marginHorizontal: 18,
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2D37',
  },
  successIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  successModalDesc: {
    color: '#9CA3AF',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  successDetailsBox: {
    width: '100%',
    backgroundColor: '#22252E',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
    gap: 6,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successDetailLabel: {
    color: '#9CA3AF',
    fontSize: 10.5,
  },
  successDetailVal: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  successModalBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  modalDoneBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  modalTrackBtn: {
    flex: 2,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  modalTrackBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
