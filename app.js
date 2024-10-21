const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const port = 3000;

const cors = require("cors");
app.use(cors());

// API Anahtarları ve URL'ler
const NEWS_API_KEY = "0894e81bed634324bf71fb88fc4789fa"; // Buraya kendi API anahtarınızı ekleyin

// Views dizinini ayarlayın ve EJS şablon motorunu kullanın
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Public dosyaları sunun
app.use(express.static(path.join(__dirname, "public")));
app.get("/favicon.ico", (req, res) => res.status(204)); // 204 No Content döner

// Ana sayfa
app.get("/", (req, res) => {
  res.render("index");
});

// Binance Depth API kullanarak order book verilerini almak
app.get("/order-book", async (req, res) => {
  let symbol = req.query.symbol || "BTCUSDT";
  symbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Sembol formatını kontrol et
  if (!symbol.match(/^[A-Z]{6,10}$/)) {
    return res.status(400).json({ error: "Invalid symbol format" });
  }

  try {
    const response = await axios.get(`https://api.binance.us/api/v3/depth`, {
      params: {
        symbol: symbol,
        limit: 10,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching order book:",
      error.response ? error.response.data : error.message
    );
    res.json({ bids: [], asks: [] });
  }
});

// Binance API'den anlık fiyatları almak
app.get("/crypto-prices", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.binance.us/api/v3/ticker/24hr`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching prices:", error.message);
    res.status(500).send("Error fetching prices");
  }
});

// News API kullanarak haber verilerini almak
app.get("/crypto-news", async (req, res) => {
  let symbol = req.query.symbol || "bitcoin"; // Varsayılan sembol "bitcoin"

  try {
    const response = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: symbol,
        apiKey: NEWS_API_KEY,
      },
    });
    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).send("Error fetching news");
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor.`);
});
