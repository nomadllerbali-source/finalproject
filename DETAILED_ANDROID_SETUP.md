# Complete Android App Setup Guide - Step by Step
## Nomadller Solutions Travel Agency Management System

This is a **COMPLETE, DETAILED guide** from start to finish. Follow every step carefully.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Setting Up Android Studio](#setting-up-android-studio)
4. [Building Your First APK](#building-your-first-apk)
5. [Testing on Physical Device](#testing-on-physical-device)
6. [Testing with Android Emulator](#testing-with-android-emulator)
7. [Creating Production APK](#creating-production-apk)
8. [Publishing to Google Play Store](#publishing-to-google-play-store)
9. [Customization Guide](#customization-guide)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements:
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: 8 GB minimum (16 GB recommended)
- **Storage**: 10 GB free space minimum
- **Processor**: Intel i5 or equivalent (i7 recommended)
- **Internet**: Stable connection for downloads

### Software Versions:
- **Node.js**: v16 or higher (already installed)
- **npm**: v8 or higher (already installed)
- **Android Studio**: Latest stable version
- **JDK**: Version 17 (bundled with Android Studio)

---

## Installing Prerequisites

### Step 1: Verify Node.js Installation

Open your terminal/command prompt and run:

```bash
node --version
npm --version
```

**Expected Output:**
```
v18.x.x (or higher)
9.x.x (or higher)
```

If not installed, download from: https://nodejs.org/

---

### Step 2: Download Android Studio

#### For Windows:

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Accept the terms and conditions
4. Download will start (approximately 1 GB)
5. Save the `.exe` file to your Downloads folder

#### For macOS:

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Download the `.dmg` file (approximately 1 GB)
4. Wait for download to complete

#### For Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install -y wget unzip
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.x.x.xx/android-studio-2023.x.x.xx-linux.tar.gz
sudo tar -xzf android-studio-*.tar.gz -C /opt/
cd /opt/android-studio/bin
./studio.sh
```

---

## Setting Up Android Studio

### Part 1: Installing Android Studio

#### Windows Installation:

1. **Run the installer**
   - Double-click `android-studio-xxxx-windows.exe`
   - Click "Yes" if prompted by User Account Control

2. **Setup Wizard**
   - Welcome screen → Click "Next"
   - Choose components:
     - ☑ Android Studio
     - ☑ Android Virtual Device
   - Click "Next"

3. **Installation Location**
   - Default location is fine: `C:\Program Files\Android\Android Studio`
   - Click "Next"

4. **Start Menu Folder**
   - Keep default: "Android Studio"
   - Click "Install"

5. **Wait for installation** (5-10 minutes)

6. **Complete Installation**
   - ☑ Start Android Studio
   - Click "Finish"

#### macOS Installation:

1. **Open the DMG file**
   - Double-click `android-studio-xxxx-mac.dmg`

2. **Drag to Applications**
   - Drag "Android Studio" icon to "Applications" folder
   - Wait for copy to complete

3. **Launch Android Studio**
   - Open Applications folder
   - Double-click "Android Studio"
   - Click "Open" if security warning appears

#### Linux Installation:

Already covered above. Continue to Part 2.

---

### Part 2: Android Studio First Launch Setup

1. **Import Settings**
   - "Do not import settings" (for first-time users)
   - Click "OK"

2. **Data Sharing**
   - Choose "Don't send" or "Send" (your preference)
   - Click "Next"

3. **Welcome Screen**
   - Click "Next"

4. **Install Type**
   - Select: **"Standard"** (recommended)
   - Click "Next"

5. **UI Theme**
   - Choose "Light" or "Darcula" (dark theme)
   - Click "Next"

6. **Verify Settings**
   - Review the components to be installed:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
   - Note the SDK location (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Click "Next"

7. **License Agreement**
   - Click each license item
   - Click "Accept" for each
   - Click "Finish"

8. **Downloading Components** (15-30 minutes)
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - System images
   - **Do not close** - let it complete

9. **Finish Setup**
   - Click "Finish" when downloads complete

---

### Part 3: Configure Android SDK

1. **Open SDK Manager**
   - Click "More Actions" (or three dots menu)
   - Select "SDK Manager"

2. **SDK Platforms Tab**
   - ☑ Android 14.0 ("UpsideDownCake") - API Level 34
   - ☑ Android 13.0 ("Tiramisu") - API Level 33
   - ☑ Show Package Details (bottom right)
   - Expand Android 13.0:
     - ☑ Android SDK Platform 33
     - ☑ Sources for Android 33
     - ☑ Google APIs Intel x86 Atom System Image

3. **SDK Tools Tab**
   - ☑ Android SDK Build-Tools
   - ☑ Android Emulator
   - ☑ Android SDK Platform-Tools
   - ☑ Google Play services
   - ☑ Intel x86 Emulator Accelerator (HAXM installer) - Windows/Mac only

4. **Apply Changes**
   - Click "Apply"
   - Review download size
   - Click "OK"
   - Wait for downloads (10-20 minutes)
   - Click "Finish"

---

### Part 4: Set Environment Variables

#### Windows:

1. **Open System Environment Variables**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Click "Advanced" tab
   - Click "Environment Variables"

2. **Add ANDROID_HOME**
   - Under "User variables", click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - Click "OK"

3. **Update PATH**
   - Find "Path" in "User variables"
   - Click "Edit"
   - Click "New"
   - Add: `%ANDROID_HOME%\platform-tools`
   - Click "New"
   - Add: `%ANDROID_HOME%\tools`
   - Click "OK" on all dialogs

4. **Verify Setup**
   - Open NEW command prompt
   - Run: `adb --version`
   - Should show ADB version

#### macOS/Linux:

1. **Edit Shell Profile**
   ```bash
   # For bash
   nano ~/.bash_profile

   # For zsh (macOS default)
   nano ~/.zshrc
   ```

2. **Add These Lines**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # OR
   export ANDROID_HOME=$HOME/Android/Sdk  # Linux

   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

3. **Save and Apply**
   - Press `Ctrl + X`, then `Y`, then `Enter`
   - Run: `source ~/.bash_profile` or `source ~/.zshrc`

4. **Verify**
   ```bash
   adb --version
   ```

---

## Building Your First APK

### Step 1: Navigate to Project Directory

Open terminal/command prompt:

```bash
# Navigate to your project folder
cd /path/to/your/project

# For example:
# Windows: cd C:\Users\YourName\nomadller-project
# Mac/Linux: cd ~/nomadller-project
```

**Verify you're in the right place:**
```bash
# You should see package.json and android folder
ls
# or on Windows:
dir
```

---

### Step 2: Install All Dependencies

```bash
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

**If you see errors:**
- Check internet connection
- Try: `npm cache clean --force`
- Then: `npm install` again

---

### Step 3: Configure Environment Variables

1. **Check if .env file exists:**
   ```bash
   # Mac/Linux:
   cat .env

   # Windows:
   type .env
   ```

2. **It should contain your Supabase credentials:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **If missing, create it:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase details

---

### Step 4: Build the Web Application

```bash
npm run build
```

**What happens:**
- Vite compiles your React app
- Creates optimized production files
- Output goes to `dist/` folder

**Expected Output:**
```
✓ 1950 modules transformed.
✓ built in 8.28s
```

**Check the output:**
```bash
# Mac/Linux:
ls dist/

# Windows:
dir dist\
```

You should see `index.html` and `assets` folder.

---

### Step 5: Sync to Android Project

```bash
npm run android:sync
```

**What happens:**
- Runs `npm run build` first
- Copies `dist/` contents to `android/app/src/main/assets/public`
- Updates Capacitor configuration
- Syncs Android plugins

**Expected Output:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Creating capacitor.config.json
✔ Sync finished in 0.126s
```

---

### Step 6: Open in Android Studio

```bash
npm run android:open
```

**What happens:**
- Opens Android Studio
- Loads your `android/` project

**First Time Opening:**

1. **Trust Project**
   - Click "Trust Project"

2. **Gradle Sync Started Automatically**
   - Bottom right: "Gradle sync in progress..."
   - **This takes 5-15 minutes first time**
   - Downloads dependencies (can be 1-2 GB)

3. **Wait for completion:**
   - Watch bottom status bar
   - When done: "Gradle sync finished"

4. **If Gradle Sync Fails:**
   - Click "Try Again"
   - Or go to: File → Sync Project with Gradle Files

---

### Step 7: Build Debug APK in Android Studio

#### Method A: Using Menu (Easiest)

1. **Menu Bar**
   - Click "Build" (top menu)
   - Click "Build Bundle(s) / APK(s)"
   - Click "Build APK(s)"

2. **Building Process**
   - Bottom panel shows progress
   - "BUILD SUCCESSFUL" appears when done
   - Notification appears: "APK(s) generated successfully"

3. **Locate APK**
   - Click "locate" in the notification
   - OR manually go to:
     ```
     android/app/build/outputs/apk/debug/app-debug.apk
     ```

4. **APK Size**
   - Approximately 30-60 MB

#### Method B: Using Gradle (Command Line)

1. **Open terminal in project root:**
   ```bash
   cd android
   ```

2. **Run Gradle build:**
   ```bash
   # Mac/Linux:
   ./gradlew assembleDebug

   # Windows:
   gradlew.bat assembleDebug
   ```

3. **Wait for build** (5-10 minutes first time)

4. **Expected Output:**
   ```
   BUILD SUCCESSFUL in 3m 45s
   ```

5. **Find APK:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Testing on Physical Device

### Step 1: Prepare Your Android Phone

#### Enable Developer Options:

1. **Open Settings** on your phone
2. **Go to "About Phone"**
3. **Find "Build Number"**
   - Might be under "Software Information"
4. **Tap "Build Number" 7 times rapidly**
5. **Enter PIN/Password if prompted**
6. **Message appears:** "You are now a developer!"

#### Enable USB Debugging:

1. **Go back to main Settings**
2. **Find "Developer Options"**
   - Usually in "System" or "Additional Settings"
3. **Turn ON "Developer Options"**
4. **Scroll down and enable:**
   - ☑ USB Debugging
   - ☑ Install via USB (if available)

---

### Step 2: Connect Device to Computer

1. **Connect USB Cable**
   - Use original cable if possible
   - Connect phone to computer

2. **Phone Notification**
   - "USB Debugging Connected" or similar
   - Or "Allow USB Debugging?"
   - Check "Always allow from this computer"
   - Tap "Allow" or "OK"

3. **Select USB Mode**
   - Swipe down notification panel
   - Tap "USB for file transfer"
   - Select "File Transfer" or "MTP"

---

### Step 3: Verify Device Connection

1. **Open terminal/command prompt:**
   ```bash
   adb devices
   ```

2. **Expected Output:**
   ```
   List of devices attached
   ABC123XYZ    device
   ```

3. **If shows "unauthorized":**
   - Check phone screen for dialog
   - Tap "Allow"
   - Run `adb devices` again

4. **If no devices shown:**
   - Try different USB cable
   - Try different USB port
   - Restart ADB:
     ```bash
     adb kill-server
     adb start-server
     adb devices
     ```

---

### Step 4: Install APK on Device

#### Method A: From Android Studio

1. **Device dropdown** (top toolbar)
   - Should show your device name
   - If not, click dropdown and select it

2. **Click Green "Run" Button** (▶️)
   - Or press `Shift + F10` (Windows/Linux)
   - Or press `Control + R` (Mac)

3. **App Installing**
   - Status: "Installing APK on [device name]"
   - Watch device screen

4. **App Launches Automatically**
   - Should open on your phone

#### Method B: Using ADB Command

1. **Navigate to APK location:**
   ```bash
   cd android/app/build/outputs/apk/debug
   ```

2. **Install APK:**
   ```bash
   adb install app-debug.apk
   ```

3. **Expected Output:**
   ```
   Performing Streamed Install
   Success
   ```

4. **Launch App Manually:**
   - Open app drawer on phone
   - Find "Nomadller Solutions"
   - Tap to open

#### Method C: Manual Transfer

1. **Copy APK to phone:**
   - Copy `app-debug.apk` to phone's Download folder

2. **On phone:**
   - Open "Files" or "Downloads" app
   - Tap `app-debug.apk`
   - Tap "Install"
   - Tap "Open" when done

---

## Testing with Android Emulator

### Step 1: Create Virtual Device

1. **Open Device Manager**
   - In Android Studio
   - Three dots menu → "Device Manager"
   - Or "Tools" → "Device Manager"

2. **Create Device**
   - Click "Create Device"

3. **Choose Device Definition**
   - Select "Phone" category
   - Choose "Pixel 6" (recommended)
   - Click "Next"

4. **Select System Image**
   - Click "Recommended" tab
   - Select "UpsideDownCake" (API 34)
   - Click "Download" next to it
   - Wait for download (800 MB - 1.5 GB)
   - Click "Finish" when done
   - Click "Next"

5. **Verify Configuration**
   - AVD Name: "Pixel 6 API 34"
   - Startup orientation: Portrait
   - Click "Finish"

---

### Step 2: Launch Emulator

1. **In Device Manager**
   - Find your created device
   - Click "Play" button (▶️)

2. **Emulator Starting**
   - New window opens
   - Shows Android boot animation
   - Takes 1-3 minutes first time

3. **Emulator Ready**
   - Shows Android home screen
   - Leave it running

**Tip:** Keep emulator running between builds to save time!

---

### Step 3: Install App on Emulator

1. **In Android Studio**
   - Device dropdown should show "Pixel 6 API 34"
   - Click green "Run" button (▶️)

2. **App Installing**
   - Watch emulator screen
   - App icon appears

3. **App Launches**
   - Should open automatically

**If app doesn't launch:**
- Open app drawer in emulator
- Find "Nomadller Solutions"
- Click to open

---

### Step 4: Test App Functionality

**Test Checklist:**

- ☐ App opens without crashing
- ☐ Login screen appears
- ☐ Can enter email/password
- ☐ Login works (test with real account)
- ☐ Navigation works
- ☐ Data loads from Supabase
- ☐ Forms can be filled
- ☐ Buttons respond to clicks
- ☐ Screen rotation works
- ☐ Back button works correctly

**View Logs:**
- Bottom panel → "Logcat" tab
- Filter: "Show only selected application"

---

## Creating Production APK

### Step 1: Generate Signing Key

**What is this?**
- Every Android app must be digitally signed
- Signing key proves you're the app owner
- Required for Play Store
- **Keep this VERY secure - if lost, you can't update your app!**

#### Generate Keystore:

1. **Navigate to android/app folder:**
   ```bash
   cd android/app
   ```

2. **Generate keystore:**
   ```bash
   keytool -genkey -v -keystore nomadller-release.keystore -alias nomadller -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Answer prompts:**
   ```
   Enter keystore password: [Create strong password]
   Re-enter new password: [Same password]
   What is your first and last name? [Your Name]
   What is the name of your organizational unit? [Development]
   What is the name of your organization? [Your Company]
   What is the name of your City or Locality? [Your City]
   What is the name of your State or Province? [Your State]
   What is the two-letter country code for this unit? [IN/US/etc]
   Is CN=..., OU=..., correct? [yes]
   Enter key password for <nomadller>: [Press Enter to use same password]
   ```

4. **Store passwords safely:**
   - Write them in a password manager
   - Store in secure location
   - **Never commit to git!**

5. **Keystore created:**
   - File: `android/app/nomadller-release.keystore`
   - Backup this file securely!

---

### Step 2: Configure Gradle Signing

1. **Create key.properties file:**
   ```bash
   cd android
   nano key.properties
   # or use any text editor
   ```

2. **Add these lines** (replace with your values):
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=nomadller
   storeFile=app/nomadller-release.keystore
   ```

3. **Save file** (Ctrl+X, Y, Enter in nano)

4. **Add to .gitignore:**
   ```bash
   echo "key.properties" >> .gitignore
   ```

---

### Step 3: Update build.gradle

1. **Open file:**
   ```bash
   nano android/app/build.gradle
   ```

2. **Add after the `plugins` block and BEFORE `android {`:**
   ```gradle
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('key.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

3. **Inside `android {` block, add:**
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

4. **Save file**

---

### Step 4: Build Release APK

1. **Navigate to android folder:**
   ```bash
   cd android
   ```

2. **Clean previous builds:**
   ```bash
   # Mac/Linux:
   ./gradlew clean

   # Windows:
   gradlew.bat clean
   ```

3. **Build release APK:**
   ```bash
   # Mac/Linux:
   ./gradlew assembleRelease

   # Windows:
   gradlew.bat assembleRelease
   ```

4. **Wait for build** (3-10 minutes)

5. **Expected output:**
   ```
   BUILD SUCCESSFUL in 5m 23s
   ```

6. **Locate signed APK:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

7. **Verify APK is signed:**
   ```bash
   jarsigner -verify -verbose -certs app-release.apk
   ```

   Should show: `jar verified.`

---

## Publishing to Google Play Store

### Step 1: Create Google Play Console Account

1. **Go to:** https://play.google.com/console/signup

2. **Sign in with Google Account**

3. **Choose Account Type:**
   - Personal (Individual developer)
   - Organization (Company)

4. **Fill in Details:**
   - Developer name
   - Email address
   - Phone number
   - Country

5. **Pay Registration Fee:**
   - One-time fee: $25 USD
   - Credit/Debit card required
   - Non-refundable

6. **Accept Agreements:**
   - Developer Distribution Agreement
   - Read carefully
   - Click "Accept"

7. **Account Creation:**
   - Takes 24-48 hours for verification
   - Check email for confirmation

---

### Step 2: Prepare App Assets

**Before creating app listing, prepare these:**

#### Required Assets:

1. **App Icon:**
   - Size: 512x512 pixels
   - Format: PNG
   - 32-bit with alpha channel
   - No rounded corners (Google adds them)

2. **Feature Graphic:**
   - Size: 1024x500 pixels
   - Format: PNG or JPG
   - Displays at top of store listing

3. **Screenshots (minimum 2, maximum 8):**
   - Phone screenshots:
     - Min: 320px
     - Max: 3840px
     - 16:9 or 9:16 ratio
   - Take screenshots from emulator or device

4. **App Description:**
   - Short description (80 characters)
   - Full description (4000 characters)

5. **Privacy Policy:**
   - URL to your privacy policy
   - Must be hosted on public website
   - Required by Google

**Sample Privacy Policy Generator:**
- https://www.privacypolicygenerator.info/

---

### Step 3: Create App in Play Console

1. **Open Play Console**
   - https://play.google.com/console

2. **Create App**
   - Click "Create app"

3. **App Details:**
   - App name: `Nomadller Solutions`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free

4. **Declarations:**
   - ☑ I confirm this app complies with Google Play policies
   - ☑ I confirm this app complies with US export laws

5. **Create App**
   - Click "Create app"

---

### Step 4: Set Up App Store Listing

1. **Go to "Store presence" → "Main store listing"**

2. **Fill in Details:**

   **App name:**
   ```
   Nomadller Solutions
   ```

   **Short description (80 chars max):**
   ```
   Complete travel agency management system for agents and administrators
   ```

   **Full description (4000 chars max):**
   ```
   Nomadller Solutions - Professional Travel Agency Management

   Streamline your travel agency operations with our comprehensive management system designed specifically for travel agents and administrators.

   KEY FEATURES:

   For Travel Agents:
   • Create custom itineraries for clients
   • Manage client bookings and preferences
   • Handle follow-ups efficiently
   • Access transportation and hotel databases
   • Real-time pricing and calculations

   For Administrators:
   • Complete agency oversight
   • Agent performance tracking
   • Inventory management (hotels, transportation, activities)
   • Sales analytics and reporting
   • Client relationship management

   ITINERARY MANAGEMENT:
   • Custom day-by-day planning
   • Fixed package templates
   • Automatic cost calculations
   • PDF generation for clients
   • Multiple pricing tiers

   TRANSPORTATION & ACCOMMODATION:
   • Extensive vehicle database
   • Hotel inventory management
   • Real-time availability
   • Pricing per vehicle type

   SECURITY:
   • Role-based access control
   • Secure authentication
   • Data encryption
   • Cloud-based backup

   Perfect for travel agencies of all sizes looking to digitize operations and improve efficiency.
   ```

3. **Upload Assets:**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Phone screenshots (at least 2)

4. **App Category:**
   - Category: Business
   - Tags: travel, business, management

5. **Contact Details:**
   - Email: your-support-email@example.com
   - Phone: +XX XXXXXXXXXX (optional)
   - Website: your-website.com (optional)

6. **Privacy Policy:**
   - URL: https://your-website.com/privacy-policy

7. **Save**

---

### Step 5: Content Rating

1. **Go to "Content rating"**

2. **Start Questionnaire:**
   - Click "Start questionnaire"

3. **Enter Email:**
   - Your contact email

4. **Select Category:**
   - Choose: "Business, productivity, or education app"

5. **Answer Questions:**
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Controlled substances: No
   - Gambling: No
   - Hate speech: No
   - Realistic depictions: No
   - Personal information: Yes (explain: "Collects user email for account management")

6. **Submit**
   - Review ratings
   - Click "Apply rating"

---

### Step 6: Target Audience

1. **Go to "Target audience and content"**

2. **Target Age:**
   - ☑ 18 and over

3. **Appeals to Children:**
   - No

4. **Store Presence:**
   - Available to all users

5. **Save**

---

### Step 7: Upload APK

1. **Go to "Release" → "Production"**

2. **Create New Release:**
   - Click "Create new release"

3. **App Integrity:**
   - Select "Continue"
   - (Google Play App Signing recommended - follow prompts)

4. **Upload APK:**
   - Click "Upload"
   - Select your `app-release.apk` file
   - Wait for upload (may take 5-10 minutes)

5. **Release Name:**
   - Auto-filled: `1 (1.0.0)`

6. **Release Notes:**
   ```
   Initial release of Nomadller Solutions

   Features:
   - Complete travel agency management
   - Custom itinerary builder
   - Client and booking management
   - Transportation and hotel inventory
   - Multi-role access (Admin, Agent, Sales)
   - PDF generation and sharing
   ```

7. **Save**

---

### Step 8: Review and Submit

1. **Review All Sections:**
   - Store listing: ✓ Complete
   - Content rating: ✓ Complete
   - Target audience: ✓ Complete
   - Production track: ✓ Ready

2. **Complete All Tasks:**
   - Check for any incomplete sections
   - Red warnings must be fixed
   - Yellow warnings can be reviewed

3. **Submit for Review:**
   - Click "Send for review" or "Start rollout to production"
   - Confirm submission

4. **Review Process:**
   - Usually takes 1-7 days
   - Average: 2-3 days
   - Check email for updates

5. **Possible Outcomes:**
   - **Approved:** App goes live!
   - **Rejected:** Fix issues and resubmit
   - **Further review needed:** Provide additional info

---

## Customization Guide

### Change App Name

1. **In capacitor.config.ts:**
   ```typescript
   appName: 'Your New App Name'
   ```

2. **In android/app/src/main/res/values/strings.xml:**
   ```xml
   <string name="app_name">Your New App Name</string>
   ```

3. **Sync:**
   ```bash
   npm run android:sync
   ```

---

### Change Package ID

1. **In capacitor.config.ts:**
   ```typescript
   appId: 'com.yourcompany.yourapp'
   ```

2. **Update in Android:**
   ```bash
   npx cap sync android
   ```

3. **Manually update android/app/build.gradle:**
   ```gradle
   defaultConfig {
       applicationId "com.yourcompany.yourapp"
   }
   ```

---

### Change App Icon

#### Option 1: Using Android Studio

1. **Right-click** `android/app/src/main/res`
2. **New → Image Asset**
3. **Icon Type:** Launcher Icons (Adaptive and Legacy)
4. **Foreground Layer:**
   - Asset Type: Image
   - Path: Select your icon (512x512 PNG)
5. **Background Layer:**
   - Color or image
6. **Click "Next" → "Finish"**

#### Option 2: Manual Replacement

Replace these files with your icons:
```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
```

---

### Add Splash Screen

1. **Install plugin:**
   ```bash
   npm install @capacitor/splash-screen
   ```

2. **Update capacitor.config.ts:**
   ```typescript
   plugins: {
     SplashScreen: {
       launchShowDuration: 3000,
       backgroundColor: "#1e40af",
       androidScaleType: "CENTER_CROP",
       showSpinner: false,
       androidSpinnerStyle: "large",
       splashFullScreen: true,
       splashImmersive: true
     }
   }
   ```

3. **Add splash images:**
   ```
   android/app/src/main/res/drawable/splash.png
   android/app/src/main/res/drawable-land-hdpi/splash.png
   android/app/src/main/res/drawable-land-xhdpi/splash.png
   ... (various sizes)
   ```

4. **Sync:**
   ```bash
   npx cap sync android
   ```

---

### Change App Colors

1. **Primary color in android/app/src/main/res/values/styles.xml:**
   ```xml
   <item name="colorPrimary">#1e40af</item>
   <item name="colorPrimaryDark">#1e3a8a</item>
   <item name="colorAccent">#3b82f6</item>
   ```

2. **Status bar color in android/app/src/main/res/values/styles.xml:**
   ```xml
   <item name="android:statusBarColor">#1e40af</item>
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Gradle Sync Failed

**Error:** "Gradle sync failed: Connection timed out"

**Solutions:**
```bash
# Solution 1: Clean and rebuild
cd android
./gradlew clean
./gradlew build

# Solution 2: Clear Gradle cache
cd ~/.gradle
rm -rf caches/
# Windows: rmdir /s %USERPROFILE%\.gradle\caches

# Solution 3: Update Gradle wrapper
cd android
./gradlew wrapper --gradle-version=8.0
```

---

#### 2. ADB Device Not Found

**Error:** "adb devices" shows nothing

**Solutions:**

**Windows:**
1. Install USB drivers for your phone brand
2. Try different USB port
3. Restart ADB:
   ```bash
   adb kill-server
   adb start-server
   ```

**Mac:**
1. Check cable connection
2. Restart ADB:
   ```bash
   adb kill-server
   adb start-server
   ```

**Linux:**
1. Add udev rules:
   ```bash
   sudo nano /etc/udev/rules.d/51-android.rules
   ```
2. Add:
   ```
   SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"
   ```
3. Reload:
   ```bash
   sudo udevadm control --reload-rules
   ```

---

#### 3. App Crashes on Launch

**Check logs:**
```bash
adb logcat | grep -i "AndroidRuntime"
```

**Common causes:**

1. **Missing environment variables:**
   - Ensure `.env` file exists
   - Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

2. **Network permissions:**
   - Add to `android/app/src/main/AndroidManifest.xml`:
     ```xml
     <uses-permission android:name="android.permission.INTERNET" />
     <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
     ```

3. **Rebuild:**
   ```bash
   npm run android:sync
   ```

---

#### 4. White/Blank Screen

**Solutions:**

1. **Clear and rebuild:**
   ```bash
   rm -rf dist/
   rm -rf android/app/src/main/assets/public/
   npm run build
   npx cap sync android
   ```

2. **Check index.html:**
   - Open `dist/index.html`
   - Verify assets paths are correct

3. **Check capacitor.config.ts:**
   ```typescript
   webDir: 'dist'  // Must match build output
   ```

---

#### 5. Build Tools Version Error

**Error:** "Failed to find Build Tools revision XX.X.X"

**Solution:**
1. Open Android Studio
2. SDK Manager
3. SDK Tools tab
4. Install required Build Tools version
5. Try build again

---

#### 6. Out of Memory During Build

**Error:** "Expiring Daemon because JVM heap space is exhausted"

**Solution:**

Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

#### 7. Certificate/Keystore Issues

**Error:** "Failed to read key from keystore"

**Solutions:**

1. **Verify keystore exists:**
   ```bash
   ls android/app/nomadller-release.keystore
   ```

2. **Check passwords in key.properties:**
   - Must match keystore creation passwords

3. **Test keystore:**
   ```bash
   keytool -list -v -keystore android/app/nomadller-release.keystore
   ```

---

#### 8. App Not Installing on Device

**Error:** "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

**Solution:**
```bash
# Uninstall old version first
adb uninstall com.nomadller.travelagency

# Install new version
adb install app-debug.apk
```

---

#### 9. Supabase Connection Failed

**Symptoms:**
- Cannot login
- Data not loading
- Network errors

**Solutions:**

1. **Check .env file:**
   ```bash
   cat .env
   ```

2. **Verify Supabase URL is accessible:**
   ```bash
   curl https://your-project.supabase.co
   ```

3. **Check Supabase project status:**
   - Login to Supabase dashboard
   - Verify project is active

4. **Add network permissions:**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```

5. **Enable cleartext traffic** (for development):
   In `capacitor.config.ts`:
   ```typescript
   server: {
     cleartext: true
   }
   ```

---

#### 10. Emulator Won't Start

**Solutions:**

1. **Enable Virtualization in BIOS**
   - Restart computer
   - Enter BIOS (usually F2 or Del key)
   - Enable "Intel VT-x" or "AMD-V"
   - Save and restart

2. **Install HAXM (Windows/Mac):**
   - SDK Manager → SDK Tools
   - ☑ Intel x86 Emulator Accelerator (HAXM)
   - Install

3. **Use ARM system image:**
   - Create new AVD
   - Select ARM-based system image instead of x86

---

## Development Workflow Summary

### Daily Development:

```bash
# 1. Make changes to React code in src/

# 2. Test in browser first
npm run dev

# 3. When ready for Android
npm run android:sync

# 4. Test on emulator/device
# (Keep Android Studio open with emulator running)
```

---

### Before Production Release:

```bash
# 1. Update version in capacitor.config.ts
# 2. Update version in android/app/build.gradle
# 3. Clean build
cd android && ./gradlew clean

# 4. Build release
./gradlew assembleRelease

# 5. Test thoroughly
# 6. Submit to Play Store
```

---

## Quick Reference

### Essential Commands:

| Task | Command |
|------|---------|
| Build web app | `npm run build` |
| Sync to Android | `npm run android:sync` |
| Open Android Studio | `npm run android:open` |
| Full workflow | `npm run android:run` |
| List devices | `adb devices` |
| Install APK | `adb install app.apk` |
| View logs | `adb logcat` |
| Uninstall app | `adb uninstall com.nomadller.travelagency` |
| Clean build | `cd android && ./gradlew clean` |
| Build debug | `./gradlew assembleDebug` |
| Build release | `./gradlew assembleRelease` |

---

### Important Paths:

| Item | Location |
|------|----------|
| Source code | `src/` |
| Built web files | `dist/` |
| Android project | `android/` |
| Debug APK | `android/app/build/outputs/apk/debug/` |
| Release APK | `android/app/build/outputs/apk/release/` |
| App config | `capacitor.config.ts` |
| Environment variables | `.env` |
| Keystore | `android/app/nomadller-release.keystore` |

---

## Getting Help

### Resources:

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Developers:** https://developer.android.com
- **Stack Overflow:** Tag your questions with `android`, `capacitor`, `react`
- **Capacitor Community:** https://ionic.io/community

### Support:

- Check error logs first: `adb logcat`
- Search error message on Google/Stack Overflow
- Check Capacitor GitHub issues
- Verify all prerequisites are installed

---

## Congratulations!

You now have a complete Android application! 🎉

**You've learned to:**
- ✓ Set up Android development environment
- ✓ Build debug APKs for testing
- ✓ Test on physical devices and emulators
- ✓ Create production-ready release APKs
- ✓ Publish to Google Play Store
- ✓ Customize your Android app
- ✓ Troubleshoot common issues

**Next steps:**
1. Test thoroughly on multiple devices
2. Gather user feedback
3. Iterate and improve
4. Submit updates regularly

Good luck with your app! 🚀
