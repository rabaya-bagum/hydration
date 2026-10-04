import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { authService } from '@/services/auth';
import { useSettingsStore } from '@/store/settingsStore';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export default function AuthScreen() {
  const router = useRouter();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const emailError = email && !EMAIL.test(email) ? 'Enter a valid email address.' : undefined;
  const pwError = mode === 'up' && password && password.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : undefined;

  const submit = async () => {
    setBusy(true);
    setMessage(undefined);
    const res = mode === 'in' ? await authService.signIn(email.trim(), password) : await authService.signUp(email.trim(), password);
    setBusy(false);
    if (!res.ok) { setMessage(res.message); return; }
    if (mode === 'up') { setMessage('Check your email to confirm your account, then sign in.'); setMode('in'); return; }
    router.replace(onboarded ? '/today' : '/onboarding');
  };

  return (
    <Screen>
      <ScreenHeader back title={mode === 'in' ? 'Sign in' : 'Create account'} />
      {!authService.available ? (
        <Card flat><Text bold>Running locally</Text><Text muted>Cloud sync isn't set up in this build, so everything is saved on this device. You can still use every feature.</Text></Card>
      ) : null}
      <Segmented value={mode} onChange={setMode} options={[{ value: 'in', label: 'Sign in' }, { value: 'up', label: 'Create account' }]} />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" error={emailError} testID="auth-email" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'in' ? 'current-password' : 'new-password'} error={pwError} testID="auth-password" />
      {message ? <Text accessibilityLiveRegion="polite" muted>{message}</Text> : null}
      <Button label={mode === 'in' ? 'Sign in' : 'Create account'} onPress={submit} loading={busy} disabled={!EMAIL.test(email) || password.length < (mode === 'up' ? MIN_PASSWORD : 1)} />
      <Button label="Continue without an account" kind="ghost" onPress={() => router.replace(onboarded ? '/today' : '/onboarding')} />
    </Screen>
  );
}
