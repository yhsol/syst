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
  filterContinuousFallingCoins,
  filterContinuousRedCandles,
  filterBullishEngulfing,
} = apiFunctions;

const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const sendTelegramMessage = async (message, isLongTermAnalysis) => {
  const telegramBotToken = isLongTermAnalysis
    ? process.env.TELEGRAM_LONG_TERM_BOT_TOKEN
    : process.env.TELEGRAM_LONG_TERM_BOT_TOKEN;
  const chatId = isLongTermAnalysis
    ? process.env.TELEGRAM_LONG_TERM_BOT_ID
    : process.env.TELEGRAM_LONG_TERM_BOT_ID;
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  if (message.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
    try {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Telegram send error:", error);
    }
  } else {
    // 메시지가 최대 길이를 초과하는 경우, 여러 개의 메시지로 분할하여 전송
    let messagePart = message;
    while (messagePart.length > 0) {
      const messageToSend = messagePart.slice(0, TELEGRAM_MESSAGE_MAX_LENGTH);
      messagePart = messagePart.slice(TELEGRAM_MESSAGE_MAX_LENGTH);
      try {
        await axios.post(url, {
          chat_id: chatId,
          text: messageToSend,
          parse_mode: "Markdown",
        });
        // 다음 메시지 전송 전 잠시 대기
        if (messagePart.length > 0)
          await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Telegram send error:", error);
        break; // 전송 오류 시 반복 중단
      }
    }
  }
};

// const sendTelegramMessage = async (message) => {
//   const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
//   const chatId = process.env.TELEGRAM_BOT_ID;
//   const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

//   try {
//     await axios.post(url, {
//       chat_id: chatId,
//       text: message,
//       parse_mode: "Markdown",
//     });
//   } catch (error) {
//     console.error("Telegram send error:", error);
//   }
// };

const bithumbBaseUrl = "https://www.bithumb.com/react/trade/order";
// tradingview url example: https://kr.tradingview.com/chart/m0kspXtg/?symbol=BITHUMB%3ASTXKRW
const tradingviewBaseUrl = "https://kr.tradingview.com/chart";

const formatCoinLink = (coin) => `[${coin}](${bithumbBaseUrl}/${coin}-KRW)`;
const formatTradingViewLink = (coin) =>
  `[${coin}](${tradingviewBaseUrl}/m0kspXtg/?symbol=BITHUMB%3A${coin}KRW)`;

const trackCoinMentions = (coinArrays, labels) => {
  const counts = {};
  const sources = {};

  coinArrays.forEach((coins, index) => {
    coins.forEach((coin) => {
      counts[coin] = (counts[coin] || 0) + 1;
      if (!sources[coin]) sources[coin] = [];
      sources[coin].push(labels[index]);
    });
  });

  // Filter, sort and map with links
  return Object.entries(counts)
    .filter(([key, value]) => value > 1)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([key, value]) =>
        `${formatTradingViewLink(key)} - ${value} - (${sources[key].join(
          ", "
        )})`
    )
    .join("\n");
};

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

  const fallingCoins = await filterContinuousFallingCoins(
    topValueCoins,
    tenMinuteCandlestickData,
    2
  );

  const redCandlesCoins = await filterContinuousRedCandles(
    topValueCoins,
    tenMinuteCandlestickData,
    2
  );

  const fallingRedCandlesCoins = redCandlesCoins.filter((coin) =>
    fallingCoins.includes(coin)
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

  const bullishEngulfingCoins = await filterBullishEngulfing(
    topValueCoins,
    tenMinuteCandlestickData
  );

  const commonCoins = await findCommonCoins(
    volumeSpikeCoins,
    risingGreenCandlesCoins,
    "rise"
  );

  const coinMentions = [
    oneMinuteRisingAndGreenCandlesCoins,
    fallingRedCandlesCoins,
    oneMinuteGoldenCrossCoins,
    tenMinuteGoldenCrossCoinsInTwo,
    risingCoins,
    greenCandlesCoins,
    volumeSpikeCoins,
    commonCoins.slice(0, 20),
    bullishEngulfingCoins,
  ];

  const labels = [
    "1분봉 지속 상승 + 지속 양봉",
    "10분봉 지속 상승 + 지속 양봉",
    "1m Golden Cross",
    "10m Golden Cross",
    "지속 상승",
    "지속 양봉",
    "거래량 급증",
    "거래량급증 + 상승률",
    "Bullish Engulfing",
  ];

  const mentionDetails = trackCoinMentions(coinMentions, labels);

  const message = `
🐅 Sustainability - Short Term
🐅
🐅
🐅
🐅

📊 Mentioned Coins Details:
${mentionDetails}

🟢 *1분봉 지속 상승 + 지속 양봉* 🟢
${oneMinuteRisingAndGreenCandlesCoins.map(formatTradingViewLink).join(", ")}
  
🟢 *10분봉 지속 상승 + 지속 양봉* 🟢
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

🔥 *거래량급증 + 상승률* 🔥
${commonCoins.slice(0, 20).map(formatTradingViewLink).join(", ")}

🕯️ *Bullish Engulfing* 🕯️
${bullishEngulfingCoins.map(formatTradingViewLink).join(", ")}

🐅
🐅
🐅
🐅
🐅
`;

  return message;
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

  const oneDayCandlestickData = await fetchAllCandlestickData(
    topValueCoins,
    "24h"
  );

  const oneDayGoldenCrossCoins = await findGoldenCrossCoins(
    topValueCoins,
    oneDayCandlestickData,
    2,
    7,
    15
  );

  const oneDayRisingCoins = await filterContinuousRisingCoins(
    topValueCoins,
    oneDayCandlestickData,
    2
  );
  const oneDayGreenCandlesCoins = await filterContinuousGreenCandles(
    topValueCoins,
    oneDayCandlestickData,
    2
  );
  const oneDayRisingAndGreenCandlesCoins = oneDayGreenCandlesCoins.filter(
    (coin) => oneDayRisingCoins.includes(coin)
  );
  const oneDayBullishEngulfingCoins = await filterBullishEngulfing(
    topValueCoins,
    oneDayCandlestickData
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

  const fallingCoins = await filterContinuousFallingCoins(
    topValueCoins,
    oneHourCandlestickData,
    2
  );
  const redCandlesCoins = await filterContinuousRedCandles(
    topValueCoins,
    oneHourCandlestickData,
    2
  );
  const fallingRedCandlesCoins = redCandlesCoins.filter((coin) =>
    fallingCoins.includes(coin)
  );

  const bullishEngulfingCoins = await filterBullishEngulfing(
    topValueCoins,
    oneHourCandlestickData
  );

  const coinMentions = [
    oneHourGoldenCrossCoinsInTwo,
    oneHourGoldenCrossCoinsInFive.filter(
      (coin) => !oneHourGoldenCrossCoinsInTwo.includes(coin)
    ),
    risingGreenCandlesCoins,
    fallingRedCandlesCoins,
    bullishEngulfingCoins,
    oneDayRisingAndGreenCandlesCoins,
    oneDayBullishEngulfingCoins,
    oneDayGoldenCrossCoins,
  ];

  const labels = [
    "1h Golden Cross in Two",
    "지속 상승 + 지속 양봉 - 1h",
    "Bullish Engulfing",
    "지속 상승 + 지속 양봉 - 1d",
    "Bullish Engulfing - 1d",
    "1d Golden Cross in Two",
  ];

  const mentionDetails = trackCoinMentions(coinMentions, labels);

  const message = `
🐅 Sustainability - Long Term
🐅
🐅
🐅
🐅

📊 Mentioned Coins Details:
${mentionDetails}

🌟 *1h Golden Cross in Two* 🌟
${oneHourGoldenCrossCoinsInTwo.map(formatTradingViewLink).join(", ")}

🌟 *1d Golden Cross in Two* 🌟
${oneDayGoldenCrossCoins.map(formatTradingViewLink).join(", ")}

🟢 *지속 상승 + 지속 양봉 - 1h* 🟢
${risingGreenCandlesCoins.map(formatTradingViewLink).join(", ")}

🟢 *지속 상승 + 지속 양봉 - 1d* 🟢
${oneDayRisingAndGreenCandlesCoins.map(formatTradingViewLink).join(", ")}

🕯️ *Bullish Engulfing* 🕯️
${bullishEngulfingCoins.map(formatTradingViewLink).join(", ")}

🕯️ *Bullish Engulfing - 1d* 🕯️
${oneDayBullishEngulfingCoins.map(formatTradingViewLink).join(", ")}

🐅
🐅
🐅
🐅
🐅
`;

  return message;
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
    await sendTelegramMessage(message, isLongTermAnalysis);
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
