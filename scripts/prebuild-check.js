/**
 * Generates the native iOS/Android projects in a scratch copy (never in your working tree) and asserts
 * the identity, URL scheme and permissions we expect. Run: npm run prebuild:check
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plink-prebuild-'));
const skip = new Set(['node_modules', 'dist', 'dist-native', '.git', 'ios', 'android', '.expo']);
fs.cpSync(root, tmp, { recursive: true, filter: (src) => !skip.has(path.basename(src)) });
fs.symlinkSync(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'));

try {
  execSync('npx expo prebuild --no-install --platform all', { cwd: tmp, stdio: 'pipe' });
  const manifest = fs.readFileSync(path.join(tmp, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  const gradle = fs.readFileSync(path.join(tmp, 'android/app/build.gradle'), 'utf8');
  const iosDir = fs.readdirSync(path.join(tmp, 'ios')).find((d) => fs.existsSync(path.join(tmp, 'ios', d, 'Info.plist')));
  const plist = fs.readFileSync(path.join(tmp, 'ios', iosDir, 'Info.plist'), 'utf8');

  // entries marked tools:node="remove" are blocked, not requested
  const perms = [...manifest.matchAll(/<uses-permission\s[^>]*>/g)].map((m) => m[0]).filter((tag) => !/tools:node="remove"/.test(tag)).map((tag) => /android:name="([^"]+)"/.exec(tag)[1]);
  const forbidden = ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_MEDIA_AUDIO', 'READ_MEDIA_VISUAL_USER_SELECTED', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'READ_CONTACTS'];
  for (const f of forbidden) assert.ok(!perms.some((p) => p.endsWith(f)), `unexpected Android permission ${f}`);
  assert.match(gradle, /applicationId 'app\.plink\.hydration'/);
  assert.match(manifest, /android:scheme="plink"/);
  assert.match(plist, /NSPhotoLibraryAddUsageDescription/);
  assert.doesNotMatch(plist, /<key>NSPhotoLibraryUsageDescription<\/key>/, 'iOS should not ask to read the photo library');
  for (const k of ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription', 'NSLocationWhenInUseUsageDescription', 'NSContactsUsageDescription', 'NSHealthShareUsageDescription']) assert.doesNotMatch(plist, new RegExp(k), `unexpected ${k}`);
  assert.match(plist, /ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/);
  console.log('prebuild check passed. Android permissions:', perms.map((p) => p.replace('android.permission.', '')).join(', '));
} catch (e) {
  console.error('prebuild check FAILED:', e.stderr?.toString() || e.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
