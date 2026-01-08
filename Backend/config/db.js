const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error("ERROR: MONGO_URI is not defined in environment variables!");
      console.error("Please create a .env file with: MONGO_URI=your_connection_string");
      process.exit(1);
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      // These options help with connection stability
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected Successfully!`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    
    // Log all collections in the database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Collections in database: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    if (error.message.includes('authentication')) {
      console.error("Authentication failed. Check your username and password in the connection string.");
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error("Cannot reach MongoDB server. Check your network connection and connection string.");
    } else if (error.message.includes('timeout')) {
      console.error("Connection timeout. Check if your IP is whitelisted in MongoDB Atlas.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;
