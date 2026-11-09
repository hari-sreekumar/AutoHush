import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import type { Rule } from '../types';

interface HushNative {
  getRules(): Promise<string>;
  saveRules(json: string): Promise<void>;
  hasPolicyAccess(): Promise<boolean>;
  openPolicySettings(): void;
  getStatus(): Promise<{ activeNames: string }>;
  getCurrentLocation(): Promise<{ lat: number; lng: number }>;
}

const native: HushNative | undefined = NativeModules.Hush;

/** The ringer can only be controlled programmatically on Android. */
export const isSupported = Platform.OS === 'android' && !!native;

export async function loadRules(): Promise<Rule[]> {
  if (!native) return [];
  return JSON.parse(await native.getRules());
}

export async function saveRules(rules: Rule[]): Promise<void> {
  if (native) await native.saveRules(JSON.stringify(rules));
}

export async function hasPolicyAccess(): Promise<boolean> {
  return native ? native.hasPolicyAccess() : false;
}

export function openPolicySettings() {
  native?.openPolicySettings();
}

export async function getActiveNames(): Promise<string> {
  return native ? (await native.getStatus()).activeNames : '';
}

export async function hasLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
}

/** Asks for the permissions the background service needs (location + notification on Android 13+). */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const loc = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (Number(Platform.Version) >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
  return loc === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getCurrentLocation() {
  if (!native) {
    throw new Error('Native module missing. Rebuild the app with `npm run android` (a Metro reload is not enough).');
  }
  if (!(await hasLocationPermission()) && !(await requestPermissions())) {
    throw new Error('Location permission is required');
  }
  return native.getCurrentLocation();
}
