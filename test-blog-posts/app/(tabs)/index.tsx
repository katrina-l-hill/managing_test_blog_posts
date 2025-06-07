import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import PostList from '@/components/PostList';



const queryClient = new QueryClient();

export default function HomeScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <PostList />
      </ParallaxScrollView>
      </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
