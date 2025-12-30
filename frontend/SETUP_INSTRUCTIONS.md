# iOS Setup Instructions - Step by Step

You need to follow these steps **in order** to open the project in Xcode:

## Step 1: Install Capacitor (if not done yet)

```bash
cd /Users/ferhat/Desktop/kurdish-learning/frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

## Step 2: Skip init (config already exists)

The `capacitor.config.ts` file already exists, so you can **skip the init step** and go directly to Step 3!

If you need to initialize (config missing), you would need to temporarily delete `capacitor.config.ts` and run `npx cap init`, but that's not needed here.

## Step 3: Build the Next.js app for mobile

```bash
npm run build:mobile
```

This creates the `out` directory with your built app.

## Step 4: Add iOS platform

```bash
npx cap add ios
```

This creates the `ios` folder in your `frontend` directory.

## Step 5: Sync Capacitor

```bash
npx cap sync
```

This copies your web app files to the iOS project.

## Step 6: Open in Xcode (CORRECT WAY)

```bash
npx cap open ios
```

**Do NOT manually open Xcode and try to open the root directory!**

The `npx cap open ios` command will:
- Open Xcode automatically
- Point to the correct project file: `/Users/ferhat/Desktop/kurdish-learning/frontend/ios/App/App.xcworkspace`

---

## Troubleshooting

### If you get "Could not open file" error:

- Make sure you're in the `frontend` directory: `cd frontend`
- Run `npx cap open ios` (not from root directory)
- Don't manually drag files into Xcode

### If iOS folder doesn't exist:

- Run `npx cap add ios` first
- Make sure `npm run build:mobile` completed successfully
- Check that `out` directory exists after build

### If build fails:

```bash
# Make sure dependencies are installed
npm install

# Try building again
npm run build:mobile
```

---

## Quick One-Liner Setup (after npm install)

```bash
cd /Users/ferhat/Desktop/kurdish-learning/frontend
npm run build:mobile && npx cap add ios && npx cap sync && npx cap open ios
```

This will do everything and open Xcode automatically!

**Note:** Skip `npx cap init` - the config file already exists!

