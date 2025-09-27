import mongoose from "mongoose";
import Seller from "../models/Seller.js";

const MONGO_URI = "mongodb+srv://menardtroyf:6EomjZkpojS9ATyW@cluster0.ix8bz8q.mongodb.net/theHive?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  console.log("Creating Start");
  console.log("Try8ing to connect to Mongo: ", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing sellers
  await Seller.deleteMany({});
  console.log("Cleared DummySeller collection");

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

  const sellers = Array.from({ length: 10 }).map((_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const colonyName = `${firstName}'s Colony`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    return {
      colonyName,
      email,
      password: `password${i + 1}`,
      facebookLink: "menardtroy.fernandez.5/",
      isVerified: true,
    };
  });

  // Insert sellers
  await Seller.insertMany(sellers);
  console.log("Inserted 10 sellers");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
