import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { notificationsSupported, requestPermission } from '@/services/notifications';
import { StepFrame } from './StepFrame';
import type { StepProps } from './draft';

/** Permission is requested only here, on an explicit tap. */
export function RemindersStep({ draft, set }: StepProps) {
  const [note, setNote] = useState<string | undefined>();
  const enable = async () => {
    if (!notificationsSupported) { setNote('Reminders work on iOS and Android. You can set them up on your phone.'); return; }
    const ok = await requestPermission();
    set({ remindersOn: ok });
    setNote(ok ? 'Reminders are on. We keep them gentle: a few a day, never during quiet hours.' : 'No problem. You can turn reminders on later in Profile.');
  };
  return (
    <StepFrame title="Gentle reminders?" subtitle="A few friendly nudges, timed around your wake-up and bedtime. We stop once you reach your goal.">
      <Card style={{ gap: 8 }}>
        <Text bold>Smart reminders</Text>
        <Text muted>"Quick hydration check." "A small sip still counts." No more than 6 a day, quiet at night. Change anything later.</Text>
      </Card>
      <Button label={draft.remindersOn ? 'Reminders on ✓' : 'Turn on reminders'} onPress={enable} disabled={draft.remindersOn} testID="enable-reminders" />
      {note ? <Text muted accessibilityLiveRegion="polite">{note}</Text> : null}
    </StepFrame>
  );
}
