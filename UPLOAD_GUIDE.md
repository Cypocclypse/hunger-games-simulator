# 🚀 Complete GitHub Upload Guide

## Step 1: Restart VS Code
After installing Git, **close and reopen VS Code** so it can detect Git.

## Step 2: First Time Git Setup
Open terminal and run these commands (replace with your info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Repository
```bash
git init
git add .
git commit -m "Initial Hunger Games Simulator upload"
```

## Step 4: Connect to GitHub
After creating your GitHub repository, run:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hunger-games-simulator.git
git push -u origin main
```

## Alternative: Manual Upload Method

If Git still doesn't work, here's the manual way:

### 1. Create GitHub Repository
- Go to [GitHub.com](https://github.com)
- Click "+" → "New repository"
- Name: `hunger-games-simulator`
- Make it Public
- Click "Create repository"

### 2. Upload Files Manually
- In your new GitHub repo, click "uploading an existing file"
- Select these files from your project folder:
  - `server.js`
  - `index.html`
  - `style.css`
  - `game.js`
  - `package.json`
  - `Procfile`
  - `README.md`
  - `DEPLOYMENT.md`
  - `GITHUB_SETUP.md`

### 3. Commit Changes
- Add commit message: "Add Hunger Games Simulator files"
- Click "Commit changes"

## Step 5: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `hunger-games-simulator` repository
6. Click "Deploy"
7. Railway will automatically detect it's a Node.js app and deploy it
8. You'll get a public URL like: `https://your-app-name.railway.app`

## Step 6: Share on Social Media! 🎉
Once deployed, share your game URL:

```
🏹 HUNGER GAMES SIMULATOR IS LIVE! 🏹

I just created a multiplayer battle royale game!
- Upload your avatar
- Get random districts & abilities  
- Fight to be the last survivor!

Play now: [YOUR_RAILWAY_URL]
Who will win? May the odds be ever in your favor!

#HungerGames #Gaming #Multiplayer #BattleRoyale
```

## Files You Need to Upload:
✅ server.js (Node.js server)
✅ package.json (dependencies)
✅ index.html (game interface)
✅ style.css (styling)
✅ game.js (client-side logic)
✅ Procfile (for Railway deployment)
✅ README.md (project description)

## Troubleshooting:
- If Git still not recognized: Use manual upload method
- If Railway deployment fails: Check that package.json and Procfile are uploaded
- If game doesn't work: Make sure all files are uploaded correctly
