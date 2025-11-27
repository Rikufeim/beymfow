import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.multiplynow',
  appName: 'Multiply AI Prompts',
  webDir: 'dist',
  server: {
    url: 'https://6f9d48d7-fc4c-42a1-99c0-68e8795ad2f1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
