import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchPuppiesPage, Puppy, setSimulateError } from '../api/puppies';

type LoadState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export default function PuppyListScreen() {
  const router = useRouter();
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPuppies = useCallback(async () => {
    setState('loading');
    setErrorMsg(null);
    try {
      const page = await fetchPuppiesPage({ limit: 12 });
      if (!page.data || page.data.length === 0) {
        setPuppies([]);
        setState('empty');
      } else {
        setPuppies(page.data);
        setNextCursor(page.nextCursor);
        setState('success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Something went wrong.');
      setState('error');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const page = await fetchPuppiesPage({ limit: 12 });
      if (!page.data || page.data.length === 0) {
        setPuppies([]);
        setState('empty');
      } else {
        setPuppies(page.data);
        setNextCursor(page.nextCursor);
        setState('success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Something went wrong.');
      setState('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || state !== 'success') return;
    setLoadingMore(true);
    try {
      const page = await fetchPuppiesPage({ cursor: nextCursor, limit: 12 });
      setPuppies((prev) => [...prev, ...(page.data || [])]);
      setNextCursor(page.nextCursor);
    } catch (err) {
      // keep silent; user can pull to refresh
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, state]);

  useEffect(() => {
    loadPuppies();
  }, [loadPuppies]);

  const renderItem = ({ item }: { item: Puppy }) => (
    <Pressable style={styles.card} onPress={() => router.push(`/puppy/${item.id}`)}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="contain" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={styles.thumbInitial}>{item.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
    </Pressable>
  );

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.title}>Available Puppies </Text>
        <Text style={styles.subtle}>Loading puppies...</Text>
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Available Puppies </Text>
        <Text style={styles.error}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSimulateError(false);
            loadPuppies();
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (state === 'empty') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Available Puppies </Text>
        <Text style={styles.subtle}>No puppies available right now.</Text>
        <TouchableOpacity style={styles.button} onPress={onRefresh}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Available Puppies </Text>
      <FlatList
        data={puppies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.gridContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}><ActivityIndicator /></View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  thumb: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInitial: {
    fontWeight: '700',
    color: '#6b7280',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 10,
  },
  desc: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  subtle: {
    marginTop: 8,
    color: '#666',
  },
  error: {
    marginTop: 12,
    color: '#c00',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



