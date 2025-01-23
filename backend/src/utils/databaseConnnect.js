import mongoose from 'mongoose';
import userModel from "../models/user.model.js";

const connectDb = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/savera';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// const users = [
//     {
//       name: "Nishant Sevak",
//       email: "rahul.kumar@example.com",
//       password: "rahul@123",
//       sendTime: 9,
//       period: 'AM'
//     },
//     {
//       name: "Priya Sharma",
//       email: "priya.sharma@example.com",
//       password: "priya@456",
//       sendTime: 10,
//       period: 'AM'
//     },
//     {
//       name: "Vikram Singh",
//       email: "vikram.singh@example.com",
//       password: "vikram@789",
//       sendTime: 8,
//       period: 'PM'
//     },
//     {
//       name: "Aarti Patel",
//       email: "aarti.patel@example.com",
//       password: "aarti@1011",
//       sendTime: 6,
//       period: 'AM'
//     },
//     {
//       name: "Suresh Reddy",
//       email: "suresh.reddy@example.com",
//       password: "suresh@1122",
//       sendTime: 7,
//       period: 'PM'
//     }
//   ];
  
//   // Example: Insert into MongoDB
//   // userModel.insertMany(users);
  


export default connectDb;