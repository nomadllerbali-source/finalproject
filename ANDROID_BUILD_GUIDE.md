# Android App Build Guide - Nomadller Solutions

Your React web application has been successfully converted to an Android app using Capacitor!

## What's Been Set Up

- **App Name**: Nomadller Solutions
- **Package ID**: com.nomadller.travelagency
- **Platform**: Android (native)
- **Technology**: Capacitor 7.4.4
- **Android Project**: `/android` folder

## Project Structure

```
project/
├── android/                 # Native Android project
├── dist/                    # Built web assets
├── src/                     # Your React source code
├── capacitor.config.ts      # Capacitor configuration
└── package.json            # NPM scripts for Android
```

---

## Quick Start Commands

### 1. Build and Sync Web Assets
```bash
npm run android:sync
```
This builds your React app and copies it to the Android project.

### 2. Open Android Studio
```bash
npm run android:open
```
This opens your Android project in Android Studio.

### 3. Build + Sync + Open (All-in-One)
```bash
npm run android:run
```

---

## Building Your Android APK

### Prerequisites

You need to install:
1. **Android Studio** - https://developer.android.com/studio
2. **Java Development Kit (JDK)** - Version 17 or higher

### Step-by-Step Build Process

#### Option 1: Using Android Studio (Recommended)

1. **Open Android Studio**
   ```bash
   npm run android:open
   ```

2. **Wait for Gradle Sync**
   - Android Studio will automatically sync and download dependencies
   - This may take 5-10 minutes on first run

3. **Connect Device or Start Emulator**
   - Physical Device: Enable USB debugging and connect via USB
   - Emulator: Tools → Device Manager → Create/Start Virtual Device

4. **Build APK**
   - Click: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be created in: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Install on Device**
   - Click the green "Run" button in Android Studio
   - Or manually install: `adb install app-debug.apk`

#### Option 2: Command Line Build

1. **Navigate to Android folder**
   ```bash
   cd android
   ```

2. **Build Debug APK**
   ```bash
   ./gradlew assembleDebug
   ```

3. **Build Release APK (for production)**
   ```bash
   ./gradlew assembleRelease
   ```

4. **Find Your APK**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Creating a Signed Release APK (For Play Store)

### 1. Generate Keystore

```bash
cd android/app
keytool -genkey -v -keystore nomadller-release.keystore -alias nomadller -keyalg RSA -keysize 2048 -validity 10000
```

Enter strong passwords and keep them safe!

### 2. Configure Signing

Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=nomadller
storeFile=app/nomadller-release.keystore
```

### 3. Update `android/app/build.gradle`

Add before `android {}` block:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android {}` block, add:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

Signed APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## Customizing Your Android App

### Change App Icon

1. Create icons at different sizes (48x48, 72x72, 96x96, 144x144, 192x192)
2. Place in: `android/app/src/main/res/mipmap-*/ic_launcher.png`
3. Or use Android Studio: Right-click `res` → New → Image Asset

### Change App Name

Edit: `android/app/src/main/res/values/strings.xml`
```xml
<string name="app_name">Nomadller Solutions</string>
```

### Change Package ID

Edit: `capacitor.config.ts`
```typescript
appId: 'com.nomadller.travelagency'
```

Then sync: `npm run android:sync`

### Splash Screen

Install plugin:
```bash
npm install @capacitor/splash-screen
```

Configure in `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#ffffff",
    showSpinner: false
  }
}
```

---

## Publishing to Google Play Store

### 1. Create Developer Account
- Go to: https://play.google.com/console
- Pay one-time $25 fee
- Complete registration

### 2. Prepare App Listing
- App name, description, screenshots
- Privacy policy URL
- Content rating questionnaire
- Target audience

### 3. Upload APK
- Create new app in Play Console
- Go to Release → Production → Create new release
- Upload your signed APK (`app-release.apk`)
- Fill in release notes
- Submit for review

### 4. Review Process
- Usually takes 1-3 days
- Fix any issues Google identifies
- Once approved, app goes live!

---

## Development Workflow

### Making Changes to Your App

1. **Edit React Code** in `src/` folder
2. **Test in Browser** first: `npm run dev`
3. **Build for Android**: `npm run android:sync`
4. **Test on Device**: Open Android Studio and run

### Live Reload (Optional)

For faster development, you can enable live reload:

1. Start dev server: `npm run dev`
2. Note the local IP (e.g., `http://192.168.1.5:5173`)
3. Edit `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.5:5173',
     cleartext: true
   }
   ```
4. Run: `npx cap sync android`
5. Run app on device - it will connect to dev server

**Remember**: Remove the `server.url` before building production APK!

---

## Troubleshooting

### Gradle Build Failed
```bash
cd android
./gradlew clean
./gradlew build
```

### App Crashes on Launch
- Check logs: `adb logcat`
- Verify Supabase URLs are set in `.env`
- Ensure all environment variables are accessible

### White Screen on Android
- Check if assets are properly synced: `npm run android:sync`
- Verify `dist/` folder exists with built files
- Check `capacitor.config.ts` has correct `webDir: 'dist'`

### Network Requests Failing
- Add internet permission in `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  ```

### Cannot Install APK
- Enable "Install from Unknown Sources" on device
- Or use: `adb install -r app-debug.apk` (force reinstall)

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build React app |
| `npm run android:sync` | Build and sync to Android |
| `npm run android:open` | Open in Android Studio |
| `npm run android:run` | Build, sync, and open |
| `npx cap sync` | Sync without building |
| `cd android && ./gradlew assembleDebug` | Build debug APK |
| `cd android && ./gradlew assembleRelease` | Build release APK |
| `adb devices` | List connected devices |
| `adb install app.apk` | Install APK on device |
| `adb logcat` | View device logs |

---

## Additional Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Guide**: https://developer.android.com/guide
- **Play Store Publishing**: https://play.google.com/console/about/guides/
- **Capacitor Android Config**: https://capacitorjs.com/docs/android/configuration

---

## Support

For issues specific to:
- **Capacitor**: Check Capacitor documentation or GitHub issues
- **Android Build**: Check Android Studio logs and Stack Overflow
- **React App**: Check your source code and browser console

---

**Congratulations!** Your travel agency management system is now a native Android app! 🎉
