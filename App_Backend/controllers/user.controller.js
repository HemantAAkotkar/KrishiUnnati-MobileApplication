const User = require('../models/user.model');
const Product = require('../models/product.model');

exports.getFarmerDashboard = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT Middleware
    const user = await User.findById(userId).select('-password');
    
    // Fetching "Live Stats" from the Products collection
    const activeListings = await Product.countDocuments({ sellerId: userId });
    
    // For "Total Earnings", we'd eventually sum up completed transactions
    const totalEarnings = 15200; // Placeholder until Transaction logic is linked

    res.json({
      success: true,
      user,
      stats: {
        activeListings,
        totalEarnings
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};