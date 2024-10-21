let currentSymbol = "BTCUSDT"; // Başlangıç sembolü
let currentNewsSymbol = "bitcoin"; // Başlangıç haber sembolü
let orderBookInterval; // Interval ID'yi tanımlıyoruz

// Sembolü ve sembole göre grafik, order book ve haberleri güncellemek için kullanılan fonksiyon
function changeSymbol(symbol, newsSymbol) {
  currentSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
  currentNewsSymbol = newsSymbol;

  // Grafiği güncelleme (TradingView)
  new TradingView.widget({
    width: 800,
    height: 500,
    symbol: `BINANCE:${currentSymbol}`,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    container_id: "tradingview_btcusdt",
  });

  // Haberleri ve Order Book verilerini güncelle
  fetchNews(currentNewsSymbol); // Haberleri güncelle
  clearInterval(orderBookInterval); // Önceki order book interval'ını temizleyelim
  fetchOrderBook(currentSymbol); // İlk kez hemen fetch edelim
  orderBookInterval = setInterval(() => fetchOrderBook(currentSymbol), 1000); // Saniyede bir güncelle
}

// Fiyatları sürekli güncelle
async function fetchCryptoPrices() {
  try {
    const response = await fetch("/crypto-prices");
    const data = await response.json();

    data.forEach((crypto) => {
      const priceElem = document.getElementById(
        `${crypto.symbol.toLowerCase()}-price`
      );
      const changeElem = document.getElementById(
        `${crypto.symbol.toLowerCase()}-change`
      );

      if (priceElem && changeElem) {
        // Eğer elemanlar varsa güncelle
        priceElem.textContent = parseFloat(crypto.lastPrice).toFixed(2);
        changeElem.textContent = parseFloat(crypto.priceChangePercent).toFixed(
          2
        );

        // Yönüne göre renklendirme
        if (crypto.priceChangePercent > 0) {
          changeElem.classList.add("positive");
          changeElem.classList.remove("negative");
        } else {
          changeElem.classList.add("negative");
          changeElem.classList.remove("positive");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
  }
}

// Haberleri güncelle
async function fetchNews(symbol) {
  try {
    const response = await fetch(`/crypto-news?symbol=${symbol}`);
    const news = await response.json();
    const newsContainer = document.getElementById("news-container");
    newsContainer.innerHTML = ""; // Mevcut haberleri temizle

    news.forEach((article) => {
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");
      const date = new Date(article.publishedAt);
      newsItem.innerHTML = `
                <h5>${article.title}</h5>
                <p>${article.description}</p>
                <p class="news-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                <a href="${article.url}" target="_blank">Haberi Oku</a>
            `;
      newsContainer.appendChild(newsItem);
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

// Order Book verilerini güncelle
async function fetchOrderBook(symbol) {
  try {
    const upperSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Sembolü büyük harfe çeviriyoruz
    const response = await fetch(`/order-book?symbol=${upperSymbol}`);
    const orderBook = await response.json();
    const orderBookBody = document.getElementById("order-book-body");
    orderBookBody.innerHTML = ""; // Mevcut tabloyu temizle

    const maxLength = Math.max(orderBook.bids.length, orderBook.asks.length);
    for (let i = 0; i < maxLength; i++) {
      const bid = orderBook.bids[i] || ["-", "-"];
      const ask = orderBook.asks[i] || ["-", "-"];
      const row = `
                <tr>
                    <td class="bids">${bid[0]}</td>
                    <td class="bids">${bid[1]}</td>
                    <td class="asks">${ask[0]}</td>
                    <td class="asks">${ask[1]}</td>
                </tr>
            `;
      orderBookBody.innerHTML += row;
    }
  } catch (error) {
    console.error("Error fetching order book:", error);
  }
}

// Sayfa yüklendikten sonra her 5 saniyede bir fiyatları güncelle
setInterval(fetchCryptoPrices, 5000);
fetchCryptoPrices(); // Sayfa yüklendiğinde ilk fiyatı çek
fetchNews("bitcoin"); // Sayfa yüklendiğinde ilk haberleri çek
fetchOrderBook("BTCUSDT"); // Sayfa yüklendiğinde ilk order book verisini çek
orderBookInterval = setInterval(() => fetchOrderBook("BTCUSDT"), 1000); // İlk kez saniyede bir order book'u güncelle
