# Reconnect to GitHub Repository

Your `.git` folder was removed. Follow these steps to reconnect and push your changes:

## Step 1: Initialize Git

```bash
cd /Users/ferhat/Desktop/kurdish-learning
git init
```

## Step 2: Add Your GitHub Remote

You need your GitHub repository URL. It should look like one of these:
- `https://github.com/yourusername/kurdish-learning.git`
- `git@github.com:yourusername/kurdish-learning.git`

**Find it on GitHub:**
1. Go to https://github.com
2. Find your repository
3. Click the green "Code" button
4. Copy the URL

Then add it:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
```

## Step 3: Check What Branch You Were On

```bash
# Fetch from remote to see branches
git fetch origin

# Check available branches
git branch -r
```

Usually it's `main` or `master`. If you're not sure, try:
```bash
git checkout -b main
# or
git checkout -b master
```

## Step 4: Add and Commit Your Changes

```bash
# Add all files
git add .

# Commit your changes
git commit -m "Update: mobile landing page and Capacitor setup"
```

## Step 5: Push to GitHub

```bash
# If your branch is main:
git push -u origin main

# Or if your branch is master:
git push -u origin master
```

If you get an error about diverged branches, you may need to force push (be careful!):
```bash
git push -u origin main --force
```

---

## Quick One-Liner (if you know your repo URL):

Replace `YOUR_GITHUB_REPO_URL` with your actual repository URL:

```bash
cd /Users/ferhat/Desktop/kurdish-learning
git init
git remote add origin YOUR_GITHUB_REPO_URL
git add .
git commit -m "Update: mobile landing page, Capacitor setup, and bug fixes"
git branch -M main
git push -u origin main --force
```

**Note:** The `--force` flag will overwrite what's on GitHub with your local version. Use this if you're sure your local changes are what you want.


