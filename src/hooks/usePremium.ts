import { useRouter } from 'expo-router';
import { useTier } from '@/store/subscriptionStore';

/** `gate(source)` returns true if the user is premium; otherwise it opens the paywall and returns false. */
export function usePremium() {
  const router = useRouter();
  const premium = useTier() === 'premium';
  const gate = (source: string): boolean => {
    if (premium) return true;
    router.push({ pathname: '/paywall', params: { source } });
    return false;
  };
  return { premium, gate };
}
