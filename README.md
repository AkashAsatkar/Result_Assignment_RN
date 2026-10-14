This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Assessment Results App

This demo stores user-entered assessments locally on the device. It includes no sample records, backend, or connected AI service. Feedback for completed assessments is entered manually.

### Android setup

Requirements: Node.js 22.11+, JDK 17, Android Studio with an emulator or USB-debugging-enabled Android device, and Android SDK Platform-Tools.

Install packages from the project root:

```sh
npm install
```

Start Metro in one terminal:

```sh
npm start
```

In another terminal, confirm a device is available and launch the app:

```sh
adb devices
npm run android
```

For a USB device, accept the USB debugging authorization prompt. If Metro cannot be reached over USB, run `adb reverse tcp:8081 tcp:8081`. Gradle's machine-specific SDK location is configured in `android/local.properties` and should not be committed.

On macOS with Homebrew, if VS Code reports `spawnSync adb ENOENT`, add Android tools to `~/.zshrc` and fully restart VS Code:

```sh
export PATH="/opt/homebrew/bin:$HOME/Library/Android/sdk/platform-tools:$PATH"
```

Build an installable debug APK with:

```sh
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Assessment behavior

- Completed assessments require a question/task, type, whole-number score from 0 to 100, and manually entered feedback.
- Scores of 70 or above are classified as Good; scores below 70 are Needs Improvement.
- Pending assessments save without score or feedback and display no performance classification.
- Records persist on-device through AsyncStorage; there is no cloud sync.

Run the checks from the project root:

```sh
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:


## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?


# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

