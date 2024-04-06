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

// 메인 람다 함수
export const handler = async (event) => {
  try {
    console.log("log=> handler start");
    const coinsData = await currentPriceInfo("ALL_KRW");
    console.log("log=> coinsData end");
    const topValueCoins = await filterCoinsByValue(coinsData, 100);
    console.log("log=> topValueCoins end");
    const topRiseCoins = await filterCoinsByRiseRate(coinsData, 100);
    console.log("log=> topRiseCoins end");

    const [oneMinuteCandlestickData, tenMinuteCandlestickData] =
      await Promise.all([
        fetchAllCandlestickData(topValueCoins, "1m"),
        fetchAllCandlestickData(topValueCoins, "10m"),
      ]);
    console.log("log=> candlestic end");

    // 거래량 & 상승률 겹치는 코인
    const commonCoins = await findCommonCoins(
      topValueCoins,
      topRiseCoins,
      "rise"
    );
    console.log("log=> 거래량 & 상승률 겹치는 코인 end");

    // 지속 상승 코인
    const risingCoins = await filterContinuousRisingCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      2
    );
    console.log("log=> 지속 상승 코인 end");

    // 지속 양봉 코인
    const greenCandlesCoins = await filterContinuousGreenCandles(
      topValueCoins,
      tenMinuteCandlestickData,
      2
    );
    console.log("log=> 지속 양봉 코인 end");

    // 지속 상승 + 지속 양봉 코인
    const risingGreenCandlesCoins = greenCandlesCoins.filter((coin) =>
      risingCoins.includes(coin)
    );

    // 거래량 급증 코인
    const volumeSpikeCoins = await filterVolumeSpikeCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      1.5
    );
    console.log("log=> 거래량 급증 코인 end");

    // 골든크로스가 발생한 코인
    const goldenCrossCoins = await findGoldenCrossCoins(
      topValueCoins,
      oneMinuteCandlestickData
    );
    console.log("log=> 골든크로스가 발생한 코인 end");

    const baseUrl = "https://www.bithumb.com/react/trade/order";
    const formatCoinLink = (coin) => `[${coin}](${baseUrl}/${coin}-KRW)`;

    // 결과 메시지 구성
    const message = `
🐅
🐅
🐅
🐅
🐅

🌟 *1m Golden Cross Coins* 🌟
${goldenCrossCoins.map(formatCoinLink).join(", ")}

📊📈 *지속 상승 + 지속 양봉* 📊📈
${risingGreenCandlesCoins.map(formatCoinLink).join(", ")}
    
📈 *지속 상승* 📈
${risingCoins.map(formatCoinLink).join(", ")}

📊 *지속 양봉* 📊
${greenCandlesCoins.map(formatCoinLink).join(", ")}
    
💹 *거래량 급증* 💹
${volumeSpikeCoins.map(formatCoinLink).join(", ")}
    
🔥 *거래량 + 상승률* 🔥
${commonCoins.slice(0, 20).map(formatCoinLink).join(", ")}

🐅
🐅
🐅
🐅
🐅
`;

    console.log("message: ", message);

    // 텔레그램으로 결과 메시지 전송
    await sendTelegramMessage(message);
    console.log("log=> sendTelegramMessage end");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Analysis completed and sent to Telegram",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred during the analysis." }),
    };
  } finally {
    console.log("log=> handler end");
  }
};
