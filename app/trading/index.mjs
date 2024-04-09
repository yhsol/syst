import axios from "axios";
import apiFunctions from "./coinAnalysisFunctions.mjs";

const {
  currentPriceInfo,
  fetchAllCandlestickData,
  findCommonCoins,
  filterCoinsByValue,
  filterContinuousRisingCoins,
  filterContinuousGreenCandles,
  filterVolumeSpikeCoins,
  findGoldenCrossCoins,
  filterCoinsByRiseRate,
} = apiFunctions;

const sendTelegramMessage = async (message) => {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_BOT_ID;
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Telegram send error:", error);
  }
};

const baseUrl = "https://www.bithumb.com/react/trade/order";
// https://kr.tradingview.com/chart/m0kspXtg/?symbol=BITHUMB%3ASTXKRW
const tradingviewBaseUrl = "https://kr.tradingview.com/chart";

const formatCoinLink = (coin) => `[${coin}](${baseUrl}/${coin}-KRW)`;
const formatTradingViewLink = (coin) =>
  `[${coin}](${tradingviewBaseUrl}/m0kspXtg/?symbol=BITHUMB%3A${coin}KRW)`;

const generateShortTermAnalysisMessage = async () => {
  console.log("Starting short-term analysis...");
  const coinsData = await currentPriceInfo("ALL_KRW");
  const topValueCoins = await filterCoinsByValue(coinsData, 100);
  const topRiseCoins = await filterCoinsByRiseRate(coinsData, 100);

  const [oneMinuteCandlestickData, tenMinuteCandlestickData] =
    await Promise.all([
      fetchAllCandlestickData(topValueCoins, "1m"),
      fetchAllCandlestickData(topValueCoins, "10m"),
    ]);

  const commonCoins = await findCommonCoins(
    topValueCoins,
    topRiseCoins,
    "rise"
  );
  const oneMinuteRisingCoins = await filterContinuousRisingCoins(
    topValueCoins,
    oneMinuteCandlestickData,
    2
  );
  const oneMinuteGreenCandlesCoins = await filterContinuousGreenCandles(
    topValueCoins,
    oneMinuteCandlestickData,
    2
  );
  const oneMinuteRisingAndGreenCandlesCoins = oneMinuteGreenCandlesCoins.filter(
    (coin) => oneMinuteRisingCoins.includes(coin)
  );

  const risingCoins = await filterContinuousRisingCoins(
    topValueCoins,
    tenMinuteCandlestickData,
    2
  );
  const greenCandlesCoins = await filterContinuousGreenCandles(
    topValueCoins,
    tenMinuteCandlestickData,
    2
  );
  const risingGreenCandlesCoins = greenCandlesCoins.filter((coin) =>
    risingCoins.includes(coin)
  );
  const volumeSpikeCoins = await filterVolumeSpikeCoins(
    topValueCoins,
    tenMinuteCandlestickData,
    1.5
  );
  const oneMinuteGoldenCrossCoins = await findGoldenCrossCoins(
    topValueCoins,
    oneMinuteCandlestickData
  );
  const tenMinuteGoldenCrossCoinsInTwo = await findGoldenCrossCoins(
    topValueCoins,
    tenMinuteCandlestickData,
    2,
    7,
    15
  );

  return `
🐅 Sustainability - Short Term
🐅
🐅
🐅
🐅

📊📈 *1분봉 지속 상승 + 지속 양봉* 📊📈
${oneMinuteRisingAndGreenCandlesCoins.map(formatTradingViewLink).join(", ")}
  
📊📈 *10분봉 지속 상승 + 지속 양봉* 📊📈
${risingGreenCandlesCoins.map(formatTradingViewLink).join(", ")}

🌟 *1m Golden Cross* 🌟
${oneMinuteGoldenCrossCoins.map(formatTradingViewLink).join(", ")}

🌟 *10m Golden Cross* 🌟
${tenMinuteGoldenCrossCoinsInTwo.map(formatTradingViewLink).join(", ")}

📈 *지속 상승* 📈
${risingCoins.map(formatTradingViewLink).join(", ")}

📊 *지속 양봉* 📊
${greenCandlesCoins.map(formatTradingViewLink).join(", ")}

💹 *거래량 급증* 💹
${volumeSpikeCoins.map(formatTradingViewLink).join(", ")}

🔥 *거래량 + 상승률* 🔥
${commonCoins.slice(0, 20).map(formatTradingViewLink).join(", ")}

🐅
🐅
🐅
🐅
🐅
`;
};

const generateLongTermAnalysisMessage = async () => {
  console.log("Starting long-term analysis...");
  const coinsData = await currentPriceInfo("ALL_KRW");
  const topValueCoins = await filterCoinsByValue(coinsData, 100);

  const oneHourCandlestickData = await fetchAllCandlestickData(
    topValueCoins,
    "1h"
  );

  const oneHourGoldenCrossCoinsInTwo = await findGoldenCrossCoins(
    topValueCoins,
    oneHourCandlestickData,
    2,
    7,
    15
  );

  const oneHourGoldenCrossCoinsInFive = await findGoldenCrossCoins(
    topValueCoins,
    oneHourCandlestickData,
    5,
    7,
    15
  );

  const risingCoins = await filterContinuousRisingCoins(
    topValueCoins,
    oneHourCandlestickData,
    2
  );
  const greenCandlesCoins = await filterContinuousGreenCandles(
    topValueCoins,
    oneHourCandlestickData,
    2
  );
  const risingGreenCandlesCoins = greenCandlesCoins.filter((coin) =>
    risingCoins.includes(coin)
  );

  return `
🐅 Sustainability - Long Term
🐅
🐅
🐅
🐅

🌟 *1h Golden Cross in Two* 🌟
${oneHourGoldenCrossCoinsInTwo.map(formatTradingViewLink).join(", ")}

🌟 *1h Golden Cross in Five* 🌟
${oneHourGoldenCrossCoinsInFive
  // Remove coins that are already in the 2-hour golden cross list
  .filter((coin) => !oneHourGoldenCrossCoinsInTwo.includes(coin))
  .map(formatTradingViewLink)
  .join(", ")}

📊📈 *지속 상승 + 지속 양봉* 📊📈
${risingGreenCandlesCoins.map(formatTradingViewLink).join(", ")}

🐅
🐅
🐅
🐅
🐅
`;
};

// Main Lambda function
export const handler = async (event) => {
  try {
    console.log("Starting analysis... Event: ", event);

    const isLongTermAnalysis = event?.type === "long-term";
    const message = isLongTermAnalysis
      ? await generateLongTermAnalysisMessage()
      : await generateShortTermAnalysisMessage();

    console.log("Generated message: ", message);

    // Sending the result message to Telegram
    await sendTelegramMessage(message);
    console.log("Message sent to Telegram successfully.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `✅ Analysis completed and sent to Telegram. Type: ${
          isLongTermAnalysis ? "Long-term" : "Short-term"
        }`,
      }),
    };
  } catch (error) {
    console.error("Error during analysis: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred during the analysis." }),
    };
  }
};
