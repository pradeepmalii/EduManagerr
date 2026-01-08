// Database Verification Script
// Run this with: node verify-db.js
// This will check your database connection and show what's in it

require("dotenv").config();
const mongoose = require("mongoose");

async function verifyDatabase() {
  try {
    console.log("🔍 Verifying MongoDB Connection...\n");
    
    if (!process.env.MONGO_URI) {
      console.error("❌ ERROR: MONGO_URI not found in .env file!");
      console.log("\n📝 Please create a .env file in the Backend folder with:");
      console.log("MONGO_URI=your_mongodb_connection_string");
      process.exit(1);
    }

    console.log("📡 Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected successfully!\n");
    console.log("📊 Database Information:");
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port || 'N/A (Atlas)'}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);

    // Check collections
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📁 Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log("   No collections found. This is normal for a new database.");
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    }

    // Check for our specific models
    console.log("\n🔎 Checking for application models:");
    const modelNames = ['admins', 'courses', 'students'];
    for (const modelName of modelNames) {
      const exists = collections.some(c => c.name === modelName);
      const count = exists ? await db.collection(modelName).countDocuments() : 0;
      console.log(`   ${exists ? '✅' : '❌'} ${modelName}: ${count} documents`);
    }

    // Check for admins
    const Admin = require("./models/Admin");
    const adminCount = await Admin.countDocuments();
    console.log(`\n👤 Admins registered: ${adminCount}`);
    if (adminCount > 0) {
      const admins = await Admin.find().select('email -_id');
      console.log(`   Emails: ${admins.map(a => a.email).join(', ')}`);
    }

    // Check for courses
    const Course = require("./models/Course");
    const courseCount = await Course.countDocuments();
    console.log(`\n📚 Courses: ${courseCount}`);

    // Check for students
    const Student = require("./models/Student");
    const studentCount = await Student.countDocuments();
    console.log(`\n👥 Students: ${studentCount}`);

    console.log("\n✅ Database verification complete!");
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Database Verification Failed!");
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('authentication')) {
      console.error("💡 Tip: Check your username and password in the connection string.");
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error("💡 Tip: Check your connection string and network connection.");
    } else if (error.message.includes('timeout')) {
      console.error("💡 Tip: Check if your IP address is whitelisted in MongoDB Atlas.");
      console.error("   Go to: Network Access -> Add IP Address");
    } else if (error.message.includes('MONGO_URI')) {
      console.error("💡 Tip: Make sure you have a .env file with MONGO_URI set.");
    }
    
    process.exit(1);
  }
}

verifyDatabase();
