const MarketUser = require("../models/market.user");

const toggleWatchlist = async (req, res) => {
  const { userId } = req.params;
  const { symbol } = req.body;

  try {
    const user = await MarketUser.findById(userId);

    if (user.watchlist.includes(symbol)) {
      user.watchlist = user.watchlist.filter((s) => s !== symbol);
    } else {
      user.watchlist.unshift(symbol);
    }

    await user.save();
    res.json({ message: "Watchlist updated", watchlist: user.watchlist });
  } catch (err) {
    res.status(400).json({ message: "Error updating watchlist", err });
  }
};

module.exports = { toggleWatchlist };
