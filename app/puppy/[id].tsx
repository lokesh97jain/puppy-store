import React, { useLayoutEffect } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
// If TypeScript complains about JSON imports, ensure tsconfig has "resolveJsonModule": true
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import data from '../../data/puppies.json';

type Puppy = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  age?: number;
  location?: string;
};

export default function PuppyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const puppies = (data as unknown) as Puppy[];
  const puppy = puppies.find((p) => p.id === id);

  useLayoutEffect(() => {
    // Set a clean, human title and hide long back text
    navigation.setOptions({
      title: puppy?.name ?? 'Puppy',
      headerBackTitleVisible: false,
    });
  }, [navigation, puppy]);

  if (!puppy) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Puppy Not Found</Text>
        <Text style={styles.subtle}>We couldn't find that puppy.</Text>
        {/* <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity> */}
      </SafeAreaView>
    );
  }

  const ageMonths =
    typeof puppy.age === 'number' && !isNaN(puppy.age) ? Math.round(puppy.age * 12) : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {puppy.imageUrl ? (
          <Image source={{ uri: puppy.imageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroInitial}>{puppy.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{puppy.name}</Text>
        {(ageMonths || puppy.location) && (
          <Text style={styles.meta}>
            {ageMonths ? `${ageMonths} months` : ''}
            {ageMonths && puppy.location ? ' • ' : ''}
            {puppy.location ?? ''}
          </Text>
        )}
        <Text style={styles.desc}>{puppy.description}</Text>
      </ScrollView>
      {/* <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: { paddingBottom: 24 },
  hero: { width: '100%', height: 240, backgroundColor: '#f3f4f6' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroInitial: { fontSize: 42, fontWeight: '800', color: '#6b7280' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 16, paddingHorizontal: 16 },
  meta: { fontSize: 14, color: '#555', marginTop: 6, paddingHorizontal: 16 },
  desc: { fontSize: 16, color: '#444', marginTop: 8, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  subtle: { marginTop: 8, color: '#666' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  button: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
