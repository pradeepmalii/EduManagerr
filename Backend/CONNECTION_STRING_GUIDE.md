# How to Update MongoDB Connection String with Database Name

## Step-by-Step Guide

### Step 1: Open Your .env File
1. Navigate to the `Backend` folder in your project
2. Open the `.env` file in your code editor (VS Code, Notepad++, etc.)

### Step 2: Find Your Current Connection String
Your current connection string probably looks like this:
```
MONGO_URI=mongodb+srv://pradeepmali313_db_user:pradeepmali313@cluster0.bmdjvjs.mongodb.net/?appName=Cluster0
```

### Step 3: Add Database Name to Connection String

**Current format (WRONG - missing database name):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

**Correct format (WITH database name):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edumanagerr?appName=Cluster0
```

**What changed:**
- Added `/edumanagerr` before the `?`
- The database name `edumanagerr` will be created automatically when you first insert data

### Step 4: Update Your .env File

Replace your `MONGO_URI` line with the corrected version:

**Before:**
```
MONGO_URI=mongodb+srv://pradeepmali313_db_user:pradeepmali313@cluster0.bmdjvjs.mongodb.net/?appName=Cluster0
```

**After:**
```
MONGO_URI=mongodb+srv://pradeepmali313_db_user:pradeepmali313@cluster0.bmdjvjs.mongodb.net/edumanagerr?appName=Cluster0
```

### Step 5: Save the File
Save the `.env` file after making the change.

### Step 6: Restart Your Backend Server
1. If your server is running, stop it (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

### Step 7: Verify the Connection
Run the verification script to confirm it's using the correct database:
```bash
npm run verify-db
```

You should see:
```
Database Name: edumanagerr
```
(instead of `test`)

---

## Alternative: Get Connection String from MongoDB Atlas

If you want to get a fresh connection string from MongoDB Atlas:

### Option A: Get Connection String from Atlas Dashboard

1. **Go to MongoDB Atlas:**
   - Open https://cloud.mongodb.com
   - Log in to your account
   - Select your project "EduManagerr"

2. **Navigate to Database:**
   - Click on "Database" in the left sidebar
   - Click on "Connect" button for your Cluster0

3. **Choose Connection Method:**
   - Select "Connect your application"
   - Choose "Node.js" as the driver
   - Choose version "6.7 or later"

4. **Copy Connection String:**
   - You'll see a connection string like:
     ```
     mongodb+srv://pradeepmali313_db_user:<password>@cluster0.bmdjvjs.mongodb.net/?appName=Cluster0
     ```

5. **Modify the Connection String:**
   - Replace `<password>` with your actual password
   - **IMPORTANT:** Add the database name before the `?`
   - Change: `...mongodb.net/?appName=...`
   - To: `...mongodb.net/edumanagerr?appName=...`

6. **Final Connection String Should Look Like:**
   ```
   mongodb+srv://pradeepmali313_db_user:YOUR_PASSWORD@cluster0.bmdjvjs.mongodb.net/edumanagerr?appName=Cluster0
   ```

7. **Update .env File:**
   - Open `Backend/.env`
   - Update the `MONGO_URI` line with the new connection string
   - Save the file

---

## Quick Reference: Connection String Format

```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database_name]?[options]
```

**Parts:**
- `mongodb+srv://` - Protocol (for Atlas clusters)
- `[username]:[password]` - Your database user credentials
- `@[cluster].mongodb.net` - Your cluster address
- `/[database_name]` - **THE DATABASE NAME** (this is what was missing!)
- `?[options]` - Connection options (like appName, retryWrites, etc.)

**Example:**
```
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/edumanagerr?retryWrites=true&w=majority
```

---

## Troubleshooting

### If you get "Database not found" error:
- Don't worry! MongoDB Atlas will automatically create the database when you first insert data
- Just make sure the database name is in the connection string

### If you want to use a different database name:
- Replace `edumanagerr` with your preferred name
- Examples: `edumanager`, `studentdb`, `education`, etc.
- Make sure it's all lowercase and no spaces

### If connection fails after adding database name:
- Check that there's no space before or after `/edumanagerr`
- Make sure your password doesn't have special characters that need URL encoding
- Verify your IP is whitelisted in MongoDB Atlas Network Access

---

## Summary

**The key change is simple:**
- **Before:** `...mongodb.net/?appName=...`
- **After:** `...mongodb.net/edumanagerr?appName=...`

Just add `/edumanagerr` (or your preferred database name) right before the `?` in your connection string!
