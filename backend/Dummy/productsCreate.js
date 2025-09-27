import mongoose from "mongoose";
import Seller from "../models/Seller.js";
import Product from "../models/Products.js";

const MONGO_URI = "mongodb+srv://menardtroyf:6EomjZkpojS9ATyW@cluster0.ix8bz8q.mongodb.net/theHive?retryWrites=true&w=majority&appName=Cluster0";

const categories = [
  "Food",
  "Drinks",
  "Accessories",
  "Clothes",
  "Other"
];

// Example public Cloudinary images
const cloudinaryImages = [
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/kitten.jpg",
  "https://res.cloudinary.com/demo/image/upload/car.jpg",
  "https://res.cloudinary.com/demo/image/upload/dog.jpg",
  "https://res.cloudinary.com/demo/image/upload/balloons.jpg"
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing products
  await Product.deleteMany({});
  console.log("Cleared DummyData collection");

  // Get sellers
  const sellers = await Seller.find({});
  if (sellers.length === 0) {
    console.error("No sellers found. Run peopleCreate.js first.");
    process.exit(1);
  }

  // Create products for each seller
  const products = [];
  // Creative product names and descriptions
  const productNames = {
    Food: ["Honey Bread", "Bee Cookies", "Royal Jelly Jam", "Honeycomb Snack", "Bee Pollen Bar"],
    Drinks: ["Honey Lemonade", "Bee Smoothie", "Royal Nectar Tea", "Honey Soda", "Bee Latte"],
    Accessories: ["Bee Keychain", "Honeycomb Necklace", "Bee Pin", "Bee Bracelet", "Honey Jar Pendant"],
    Clothes: ["Bee Hoodie", "Honeycomb Socks", "Bee T-shirt", "Bee Cap", "Bee Scarf"],
    Other: ["Bee Sticker Pack", "Honey Candle", "Bee Plush", "Bee Mug", "Bee Notebook"]
  };
  const productDescs = {
    Food: "A delicious treat made with real honey, perfect for any snack time.",
    Drinks: "A refreshing beverage infused with natural honey flavors.",
    Accessories: "A stylish accessory inspired by bees and honeycombs.",
    Clothes: "Comfortable and trendy clothing for bee lovers.",
    Other: "Unique bee-themed items for everyday use."
  };

  // Additional info pool
  const infoTitles = [
    "Fun Fact", "Bee Tip", "Origin Story", "Sustainability", "Usage Advice", "Bee Trivia", "Honey Hack", "Eco Impact", "Bee Science", "Sweet Secret"
  ];
  const infoDescs = [
    "Did you know? Bees communicate through dancing!",
    "Store honey in a cool, dry place for best results.",
    "This product is made with eco-friendly materials.",
    "Bees are vital for pollinating many crops.",
    "Enjoy with tea for a sweet treat.",
    "Royal jelly is a special food for queen bees.",
    "Honey never spoils if kept sealed.",
    "Beeswax is used in many natural products.",
    "Support local beekeepers for a healthy ecosystem.",
    "Bee pollen is packed with nutrients."
  ];

  function randomInfo() {
    const count = Math.floor(Math.random() * 6); // 0-5
    const infos = [];
    for (let k = 0; k < count; k++) {
      const title = infoTitles[Math.floor(Math.random() * infoTitles.length)];
      const description = infoDescs[Math.floor(Math.random() * infoDescs.length)];
      infos.push({ title, description });
    }
    return infos;
  }

  sellers.forEach((seller, i) => {
    for (let j = 0; j < 3; j++) {
      const category = categories[(i * 3 + j) % categories.length];
      const nameArr = productNames[category];
      const name = nameArr[Math.floor(Math.random() * nameArr.length)];
      const description = productDescs[category];
      products.push({
        sellerId: seller._id,
        name,
        description,
        price: Math.floor(Math.random() * 100) + 10,
        category,
        isLimited: Math.random() < 0.5,
        inStock: Math.random() < 0.8,
        images: [cloudinaryImages[j % cloudinaryImages.length]],
        additionalInfo: randomInfo()
      });
    }
  });

  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
