import mongoose from "mongoose";
import User from "../models/User.js";

const MONGO_URI = "mongodb+srv://menardtroyf:6EomjZkpojS9ATyW@cluster0.ix8bz8q.mongodb.net/theHive?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  console.log("Creating Start");
  console.log("Try8ing to connect to Mongo: ", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing users
  await User.deleteMany({});
  console.log("Cleared User collection");

  // Realistic names
  const firstNames = [
    "Troy", "Kevin", "Menard", "Sarah", "Emily", "John", "Anna", "David", "Sophia", "Michael"
  ];
  const lastNames = [
    "Fernandez", "Smith", "Johnson", "Lee", "Brown", "Garcia", "Martinez", "Kim", "Clark", "Lopez"
  ];

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Create sellers (first 6 users)
  const sellers = Array.from({ length: 6 }).map((_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const colonyName = `${firstName}'s Colony`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    return {
      colonyName,
      email,
      password: `password${i + 1}`,
      facebookLink: "menardtroy.fernandez.5",
      role: "seller",
      isVerified: true,
    };
  });

  // Create buyers (next 4 users)
  const buyers = Array.from({ length: 4 }).map((_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const email = `buyer.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    return {
      email,
      password: `password${i + 7}`,
      role: "buyer",
      isVerified: true,
    };
  });

  // Insert all users
  await User.insertMany([...sellers, ...buyers]);
  console.log("Inserted 6 sellers and 4 buyers");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
