const axios = require("axios");

const getTickers = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.wazirx.com/sapi/v1/tickers/24hr"
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tickers", error: err });
  }
};

// New function to calculate total assets
const getTotalAssetsCount = async (req, res) => {
  try {
    // Call the API directly (or you could reuse getTickers internally)
    const response = await axios.get(
      "https://api.wazirx.com/sapi/v1/tickers/24hr"
    );
    const tickers = response.data;

    // Count total assets
    const totalAssets = Object.keys(tickers).length;

    res.json({ totalAssets });
  } catch (err) {
    console.error("Error fetching total assets:", err);
    return 0; // fallback
  }
};

module.exports = { getTickers, getTotalAssetsCount };
