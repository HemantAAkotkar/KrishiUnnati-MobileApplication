const mongoose = require("mongoose");
const User = require("./models/user.model");
const Product = require("./models/product.model");

mongoose.connect("mongodb+srv://MyAppUser:myappUser@cluster0.agyxps6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categories = [
  "Seeds",
  "Fertilizers",
  "Tools & Machinery",
  "Pesticides",
  "Advisory Services"
];

const imageMap = {
  Seeds: "https://images.unsplash.com/photo-1598514982341-56f5c35c4b5c",
  Fertilizers: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
  "Tools & Machinery": "https://images.unsplash.com/photo-1581091215367-59ab6c1c2c1b",
  Pesticides: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6",
  "Advisory Services": "https://images.unsplash.com/photo-1556761175-4b46a572b786"
};

async function seedDatabase() {
  try {
    console.log("🌱 Seeding started...");

    await User.deleteMany();
    await Product.deleteMany();

    // ---------------- USERS ----------------

    // Admin
    const admin = await User.create({
      fullName: "System Admin",
      mobileNumber: "9999999999",
      email: "admin@kup.com",
      password: "admin123",
      role: "Admin",
      location: {
        state: "Maharashtra",
        district: "Amravati",
        village: "PRMCEAM"
      }
    });

    // Sellers (15)
    const sellers = [];
    for (let i = 1; i <= 15; i++) {
      sellers.push({
        fullName: `Seller ${i}`,
        mobileNumber: `90000000${i}`,
        email: `seller${i}@kup.com`,
        password: "seller123",
        role: "Seller",
        aadhaarNum: `12341234123${i}`,
        landSize: Math.floor(Math.random() * 10) + 1,
        location: {
          state: "Maharashtra",
          district: "Amravati",
          village: `Village ${i}`
        }
      });
    }
    const savedSellers = await User.insertMany(sellers);

    // Buyers (40)
    const buyers = [];
    for (let i = 1; i <= 40; i++) {
      buyers.push({
        fullName: `Buyer ${i}`,
        mobileNumber: `80000000${i}`,
        email: `buyer${i}@kup.com`,
        password: "buyer123",
        role: "Buyer",
        location: {
          state: "Maharashtra",
          district: "Nagpur",
          village: `Area ${i}`
        }
      });
    }
    await User.insertMany(buyers);

    console.log("✅ Users seeded");

    // ---------------- PRODUCTS (70+) ----------------
    const products = [];

    categories.forEach((category) => {
      for (let i = 1; i <= 15; i++) {
        const seller =
          savedSellers[Math.floor(Math.random() * savedSellers.length)];

        products.push({
          productName: `${category} Product ${i}`,
          price: Math.floor(Math.random() * 4000) + 200,
          category,
          quantity: Math.floor(Math.random() * 100) + 10,
          imageUrl: imageMap[category],
          description: `High quality ${category.toLowerCase()} for modern farming.`,
          sellerId: seller._id,
          rating: (Math.random() * 2 + 3).toFixed(1)
        });
      }
    });

    await Product.insertMany(products);
    console.log("✅ Products seeded");

    console.log("🎉 Database seeded successfully");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    mongoose.disconnect();
  }
}

seedDatabase();
