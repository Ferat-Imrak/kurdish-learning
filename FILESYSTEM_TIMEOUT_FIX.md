# Filesystem Timeout Error Fix

You're experiencing `ETIMEDOUT` errors when reading/writing files. This is a macOS filesystem issue.

## Quick Fixes (Try in order):

### 1. Clear Extended Attributes (Already done for some files)
```bash
# Clear from entire project
cd /Users/ferhat/Desktop/kurdish-learning
xattr -rc .
```

### 2. Remove Build Directories
```bash
# Frontend
cd frontend
rm -rf .next node_modules/.cache

# Backend  
cd ../backend
rm -rf dist node_modules/.prisma
```

### 3. Restart Your Mac
Sometimes a simple restart fixes filesystem I/O issues.

### 4. Run Disk Utility Repair
1. Open **Disk Utility** (Applications > Utilities)
2. Select your disk (Macintosh HD)
3. Click **First Aid**
4. Click **Run** to check and repair

### 5. Reinstall node_modules (if above doesn't work)
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### 6. Use Docker (Workaround)
```bash
# This avoids local filesystem issues
docker-compose up
```

## What's Causing This?

The `@` symbol in file listings indicates **extended attributes** (like `com.apple.provenance`). These can sometimes cause I/O timeouts on macOS, especially with large node_modules directories.

## Prevention

After fixing, you can prevent this by:
```bash
# Clear attributes regularly
find . -name "node_modules" -prune -o -exec xattr -c {} \;
```

## If Nothing Works

Consider moving your project to a different location or using Docker for development to avoid local filesystem issues entirely.


