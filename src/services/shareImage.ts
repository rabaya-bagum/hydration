import { Platform } from 'react-native';
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';

export interface ActionResult { ok: boolean; message: string }

const OUT_W = 1080;
const OUT_H = 1350;
const FILE_NAME = 'plink-share.png';

type Viewable = RefObject<unknown>;

async function toUri(ref: Viewable): Promise<string> {
  return Platform.OS === 'web'
    ? captureRef(ref as never, { format: 'png', result: 'data-uri' })
    : captureRef(ref as never, { format: 'png', quality: 1, result: 'tmpfile', width: OUT_W, height: OUT_H });
}

function webDownload(dataUri: string) {
  const a = document.createElement('a');
  a.href = dataUri;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function dataUriToBlob(uri: string): Promise<Blob> {
  return (await fetch(uri)).blob();
}

export async function shareCard(ref: Viewable): Promise<ActionResult> {
  try {
    const uri = await toUri(ref);
    if (Platform.OS === 'web') {
      const blob = await dataUriToBlob(uri);
      const file = new File([blob], FILE_NAME, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return { ok: true, message: 'Shared.' }; }
      webDownload(uri);
      return { ok: true, message: 'Sharing is not supported here, so the image was downloaded.' };
    }
    const Sharing = await import('expo-sharing'); // native-only modules are loaded lazily so web never imports them
    if (!(await Sharing.isAvailableAsync())) return { ok: false, message: 'Sharing is not available on this device.' };
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your Plink card' });
    return { ok: true, message: 'Shared.' };
  } catch {
    return { ok: false, message: 'Could not share the image.' };
  }
}

export async function saveCard(ref: Viewable): Promise<ActionResult> {
  try {
    const uri = await toUri(ref);
    if (Platform.OS === 'web') { webDownload(uri); return { ok: true, message: 'Image downloaded.' }; }
    const MediaLibrary = await import('expo-media-library');
    const perm = await MediaLibrary.requestPermissionsAsync(true);
    if (!perm.granted) return { ok: false, message: 'Allow photo access to save the image.' };
    await MediaLibrary.saveToLibraryAsync(uri);
    return { ok: true, message: 'Saved to your photos.' };
  } catch {
    return { ok: false, message: 'Could not save the image.' };
  }
}

export async function copyCard(ref: Viewable): Promise<ActionResult> {
  try {
    if (Platform.OS === 'web') {
      const blob = await dataUriToBlob(await toUri(ref));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return { ok: true, message: 'Image copied.' };
    }
    const base64 = await captureRef(ref as never, { format: 'png', quality: 1, result: 'base64', width: OUT_W, height: OUT_H });
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setImageAsync(base64);
    return { ok: true, message: 'Image copied.' };
  } catch {
    return { ok: false, message: 'Could not copy the image.' };
  }
}
