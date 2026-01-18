// data/mockMarketplaceData.js

export const categories = [
  "Crops",
  "Fertilizers",
  "Seeds",
  "Machinery",
  "Pesticides",
  "Tools",
];

// Make sure these images exist in ../assets/images/
// wheat.png, rice.png, tractor.png, fertilizer.png, cotton.png, placeholder.png

export const products = [
  {
    id: "1",
    name: "Organic Wheat",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141377/Wheat_ygumfw.jpg" // Local image
  },
  {
    id: "2",
    name: "Hybrid Rice Seeds",
    location: "Punjab",
    rating: 4.2,
    price: 850,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141375/RiceSeeds_hzo6ud.jpg",
  },
  {
    id: "3",
    name: "Organic Bajra",
    location: "Haryana",
    rating: 4.8,
    price: 2500,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141371/Bajra_rc9kgv.jpg",
  },
  {
    id: "4",
    name: "Organic Onion",
    location: "Uttar Pradesh",
    rating: 4.1,
    price: 500,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141372/Onion_xbms1y.jpg",
  },
  {
    id: "5",
    name: "Cotton ",
    location: "Gujarat",
    rating: 4.4,
    price: 950,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141370/Cotton_qeozsv.jpg",
  },
  {
    id: "6",
    name: "Organic Soybeans",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141374/Soybean_gangx1.jpg", // Local image
  },
  {
    id: "7",
    name: "Organic Sugarcane",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141374/Sugarcane_me7k0c.jpg", // Local image
  },
  {
    id: "8",
    name: "Organic Tomatos",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: "https://res.cloudinary.com/dj7hsbfaf/image/upload/v1761141375/Tomato_yszqez.jpg", // Local image
  },
  {
    id: "9",
    name: "Organic bajra",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: require("./Logo.png"), // Local image
  },
  {
    id: "10",
    name: "Organic Wheat",
    location: "Maharashtra",
    rating: 4.5,
    price: 1200,
    image: require("./Logo.png"), // Local image
  },
];
