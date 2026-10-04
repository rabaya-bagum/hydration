import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';

export default function Index() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  return <Redirect href={onboarded ? '/today' : '/welcome'} />;
}
