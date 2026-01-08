# Database Setup Guide

## MongoDB Atlas Configuration

### 1. Connection String Format

Your `.env` file should have a connection string in this format:

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edumanagerr?retryWrites=true&w=majority
```

**Important points:**
- Replace `username` and `password` with your MongoDB Atlas credentials
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- **The database name is `edumanagerr`** (after the last `/` and before the `?`)
- If you want to use a different database name, change `edumanagerr` in the connection string

### 2. Verify Your Connection

Run the verification script to check your database:

```bash
npm run verify-db
```

This will show you:
- ✅ Connection status
- 📊 Database name being used
- 📁 Collections in the database
- 👤 Number of admins, courses, and students

### 3. Common Issues

#### Issue: "Authentication failed"
- **Solution:** Check your username and password in the connection string
- Make sure special characters in password are URL-encoded

#### Issue: "Connection timeout"
- **Solution:** Add your IP address to MongoDB Atlas Network Access
- Go to: MongoDB Atlas → Network Access → Add IP Address
- Or use `0.0.0.0/0` for development (NOT recommended for production)

#### Issue: "Database not found"
- **Solution:** MongoDB Atlas will create the database automatically when you first insert data
- Make sure the database name in your connection string is correct

### 4. Expected Collections

After using the application, you should see these collections:
- `admins` - Admin user accounts
- `courses` - Course information
- `students` - Student information

### 5. Database Name

The application will use the database name specified in your connection string. If you don't specify one, it defaults to `test`.

**Recommended:** Use `edumanagerr` as your database name in the connection string.
