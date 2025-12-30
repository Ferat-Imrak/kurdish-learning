# Restore Git Repository

Your `.git` folder exists but is corrupted. Here's how to restore it:

## Your Repository Info
- **URL**: `git@github.com:Ferat-Imrak/kurdish-learning.git`
- **Branch**: `master`

## Quick Fix Commands

```bash
cd /Users/ferhat/Desktop/kurdish-learning

# Option 1: Reinitialize (if .git is corrupted)
# Backup config first
cp .git/config .git/config.backup

# Then try to fix it
git init
git remote add origin git@github.com:Ferat-Imrak/kurdish-learning.git

# Fetch from remote
git fetch origin

# Check out master branch
git checkout -b master origin/master

# Add your local changes
git add .
git commit -m "Update: mobile landing page and Capacitor setup"

# Push your changes
git push -u origin master
```

## Alternative: Start Fresh (if above doesn't work)

```bash
cd /Users/ferhat/Desktop/kurdish-learning

# Remove corrupted .git (BACKUP YOUR CONFIG FIRST!)
# cp .git/config .git/config.backup
# rm -rf .git

# Initialize fresh
git init
git remote add origin git@github.com:Ferat-Imrak/kurdish-learning.git
git fetch origin
git checkout -b master origin/master
git add .
git commit -m "Update: mobile landing page, Capacitor setup, and bug fixes"
git push -u origin master
```


