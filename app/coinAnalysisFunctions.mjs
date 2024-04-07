import axios from "axios";

const DEFAULT_TICKER = "ALL_KRW";

export async function currentPriceInfo(ticker = DEFAULT_TICKER) {
  const options = {
    method: "GET",
    url: `https://api.bithumb.com/public/ticker/${ticker}`,
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function candlestick(
  orderCurrency = "BTC",
  paymentCurrency = "KRW",
  chartIntervals = "24h"
) {
  const options = {
    method: "GET",
    url: `https://api.bithumb.com/public/candlestick/${orderCurrency}_${paymentCurrency}/${chartIntervals}`,
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("error: ", error);
  }
}

// candlestick 데이터를 모든 코인에 대해 조회
export async function fetchAllCandlestickData(symbols, chartIntervals = "1h") {
  const candlestickData = {};

  for (const symbol of symbols) {
    const data = await candlestick(symbol, "KRW", chartIntervals);
    candlestickData[symbol] = data;
  }

  return candlestickData;
}

export async function filterCoinsByValue(coinsData, limit = 100) {
  const coins = Object.entries(coinsData.data)
    .map(([key, value]) => ({
      symbol: key,
      tradeVolume: parseFloat(value["units_traded_24H"]),
      tradeValue: parseFloat(value["acc_trade_value_24H"]),
      data: value,
    }))
    .filter((coin) => !isNaN(coin.tradeVolume) && !isNaN(coin.tradeValue));

  // 거래량 또는 거래대금 기준으로 정렬하고 상위 100개 코인을 반환
  // const sortedByVolume = [...coins]
  //   .sort((a, b) => b.tradeVolume - a.tradeVolume)
  //   .slice(0, 100);
  const sortedByValue = [...coins]
    .sort((a, b) => b.tradeValue - a.tradeValue)
    .slice(0, limit);

  return sortedByValue.map((coin) => coin.symbol);
}

export async function filterCoinsByRiseRate(coins, limit = 100) {
  const coinsArray = Object.entries(coins.data)
    .map(([key, value]) => ({
      symbol: key,
      openPrice: parseFloat(value["opening_price"]),
      closePrice: parseFloat(value["closing_price"]),
      data: value,
    }))
    .filter((coin) => !isNaN(coin.openPrice) && !isNaN(coin.closePrice));

  const coinsArrayWithRiseRate = coinsArray.map((coin) => {
    const riseRate = (coin.closePrice - coin.openPrice) / coin.openPrice;
    return {
      ...coin,
      riseRate,
    };
  });

  const sortedByRiseRate = [...coinsArrayWithRiseRate]
    .sort((a, b) => b.riseRate - a.riseRate)
    .slice(0, limit);

  return sortedByRiseRate.map((coin) => coin.symbol);
}

export async function findCommonCoins(
  byValueSymbols,
  byRiseSymbols,
  filter = "rise"
) {
  // 겹치는 심볼 찾기
  const commonSymbols = byValueSymbols.filter((symbol) =>
    byRiseSymbols.includes(symbol)
  );

  const base = filter === "value" ? byValueSymbols : byRiseSymbols;

  // 겹치는 심볼을 가진 코인 정보 반환
  const commonCoins = base.filter((symbol) => commonSymbols.includes(symbol));
  return commonCoins;
}

export async function filterContinuousRisingCoins(
  symbols,
  candlestickData,
  minRisingCandles = 3
) {
  const risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

  try {
    for (const symbol of symbols) {
      const candleData = candlestickData[symbol];
      console.log("log=> candleData: ", candleData);

      if (
        candleData.status === "0000" &&
        candleData.data &&
        candleData.data.length >= minRisingCandles
      ) {
        const candles = candleData.data.slice(-minRisingCandles - 1); // 연속 상승을 판단하기 위한 최소 캔들 수 + 1
        let isRising = true; // 현재 코인이 연속 상승 중인지 판단하는 플래그

        // 첫 번째 캔들을 제외하고 나머지 캔들을 순회하며 연속 상승 판단
        for (let i = 1; i < candles.length; i++) {
          if (parseFloat(candles[i][2]) <= parseFloat(candles[i - 1][2])) {
            // 종가가 이전 캔들의 종가보다 낮거나 같으면
            isRising = false; // 연속 상승이 아님
            break;
          }
        }

        if (isRising) {
          risingCoins.push(symbol); // 연속 상승 중인 코인 추가
        }
      }
    }
  } catch (error) {
    risingCoins = ["error_filterContinuousRisingCoins"];
  }

  console.log("server => risingCoins: ", risingCoins);
  return risingCoins;
}

export async function filterContinuousGreenCandles(
  symbols,
  candlestickData,
  minGreenCandles = 3
) {
  const greenCandlesCoins = []; // 연속 양봉 중인 코인들을 저장할 배열

  try {
    for (const symbol of symbols) {
      const candleData = candlestickData[symbol];
      if (
        candleData.status === "0000" &&
        candleData.data &&
        candleData.data.length >= minGreenCandles
      ) {
        const recentCandles = candleData.data.slice(-minGreenCandles); // 최근 캔들 데이터
        let isAllGreen = recentCandles.every((candle) => {
          const openPrice = parseFloat(candle[1]);
          const closePrice = parseFloat(candle[2]);
          return closePrice > openPrice; // 종가가 시가보다 높은 경우 양봉
        });

        if (isAllGreen) {
          greenCandlesCoins.push(symbol); // 연속 양봉 중인 코인 추가
        }
      }
    }
  } catch (error) {
    greenCandlesCoins = ["error_filterContinuousGreenCandles"];
  }

  console.log("server => greenCandlesCoins: ", greenCandlesCoins);
  return greenCandlesCoins;
}

// export async function filterVolumeSpikeCoins(
//   symbols,
//   candlestickData,
//   volumeIncreaseFactor = 1.5
// ) {
//   const volumeSpikeCoins = []; // 거래량이 급증한 코인들을 저장할 배열

//   try {
//     for (const symbol of symbols) {
//       const candleData = candlestickData[symbol];
//       if (
//         candleData.status === "0000" &&
//         candleData.data &&
//         candleData.data.length >= 8
//       ) {
//         const recentCandles = candleData.data.slice(-8); // 최근 8개의 캔들 데이터
//         const volumes = recentCandles.map((candle) => parseFloat(candle[5])); // 각 캔들의 거래량
//         const averageVolume =
//           volumes.slice(0, 5).reduce((acc, val) => acc + val, 0) / 5; // 첫 5개 캔들의 평균 거래량

//         // 마지막 세 개 캔들 중 하나라도 평균의 {volumeIncreaseFactor}배 이상인 경우 확인
//         const hasVolumeSpike = volumes
//           .slice(-3)
//           .some((volume) => volume > averageVolume * volumeIncreaseFactor);

//         if (hasVolumeSpike) {
//           volumeSpikeCoins.push(symbol); // 거래량 급증 코인 추가
//         }
//       }
//     }
//   } catch (error) {
//     volumeSpikeCoins = ["error_filterVolumeSpikeCoins"];
//   }

//   console.log("server => volumeSpikeCoins: ", volumeSpikeCoins);
//   return volumeSpikeCoins;
// }
export async function filterVolumeSpikeCoins(
  symbols,
  candlestickData,
  volumeIncreaseFactor = 1.5
) {
  let volumeSpikeCoins = []; // 거래량이 급증한 코인들을 저장할 배열

  try {
    for (const symbol of symbols) {
      const candleData = candlestickData[symbol];
      if (
        candleData.status === "0000" &&
        candleData.data &&
        candleData.data.length >= 8
      ) {
        const recentCandles = candleData.data.slice(-8); // 최근 8개의 캔들 데이터
        const volumes = recentCandles.map((candle) => parseFloat(candle[5])); // 각 캔들의 거래량

        // 최대 거래량 캔들 찾기
        const maxVolume = Math.max(...volumes);
        const averageVolume =
          volumes.slice(0, 5).reduce((acc, val) => acc + val, 0) / 5; // 첫 5개 캔들의 평균 거래량

        // 마지막 세 개 캔들 중 하나라도 평균의 {volumeIncreaseFactor}배 이상인 경우 확인
        const hasVolumeSpike = volumes
          .slice(-3)
          .some((volume) => volume > averageVolume * volumeIncreaseFactor);

        if (hasVolumeSpike) {
          volumeSpikeCoins.push({ symbol, maxVolume }); // 거래량 급증 코인 추가 (최대 거래량 포함)
        }
      }
    }

    // 최대 거래량을 기준으로 코인들을 정렬
    volumeSpikeCoins.sort((a, b) => b.maxVolume - a.maxVolume);

    // 코인 심볼만 배열로 추출
    volumeSpikeCoins = volumeSpikeCoins.map((coin) => coin.symbol);
  } catch (error) {
    console.error("Error in filterVolumeSpikeCoins:", error);
    volumeSpikeCoins = ["error_filterVolumeSpikeCoins"];
  }

  console.log("server => volumeSpikeCoins: ", volumeSpikeCoins);
  return volumeSpikeCoins;
}

export async function findGoldenCrossCoins(
  symbols,
  candlestickData,
  candleCount = 10,
  shortPeriod = 50,
  longPeriod = 200
) {
  const goldenCrossCoins = [];

  try {
    for (const symbol of symbols) {
      const candleData = candlestickData[symbol];
      if (candleData.status !== "0000" || !candleData.data) {
        continue; // 데이터가 유효하지 않은 경우 건너뛰기
      }

      const closingPrices = candleData.data.map((candle) =>
        parseFloat(candle[2])
      ); // 종가 데이터 추출
      const shortPeriodMa = calculateMovingAverage(closingPrices, shortPeriod); // {shortPeriod}분 이동평균 계산
      const longPeriodMa = calculateMovingAverage(closingPrices, longPeriod); // {longPeriod}분 이동평균 계산

      // 골든크로스 확인
      for (
        let i = closingPrices.length - candleCount;
        i < closingPrices.length;
        i++
      ) {
        if (
          shortPeriodMa[i] > longPeriodMa[i] &&
          shortPeriodMa[i - 1] <= longPeriodMa[i - 1]
        ) {
          goldenCrossCoins.push(symbol);
          break; // 최근 {candleCount}개 캔들 내 골든크로스 발견 시 추가하고 다음 코인으로 넘어감
        }
      }
    }
  } catch (error) {
    goldenCrossCoins = ["error_findGoldenCrossCoins"];
  }

  console.log("server => goldenCrossCoins: ", goldenCrossCoins);
  return goldenCrossCoins; // 골든크로스가 발생한 코인 리스트 반환
}

export async function lowToHigh(
  symbols,
  candlestickData,
  minRisingCandles = 5
) {
  const risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

  try {
    for (const symbol of symbols) {
      const candleData = candlestickData[symbol];
      if (
        candleData.status === "0000" &&
        candleData.data &&
        candleData.data.length >= minRisingCandles
      ) {
        const firstCandle = candleData.data[0]; // 첫 번째 캔들
        const lastCandle = candleData.data[candleData.data.length - 1]; // 마지막 캔들

        // 첫 번째 캔들의 시가보다 마지막 캔들의 종가가 높은 경우
        if (parseFloat(lastCandle[2]) > parseFloat(firstCandle[2])) {
          risingCoins.push(symbol); // 조건에 맞는 코인 추가
        }
      }
    }
  } catch (error) {
    risingCoins = ["error_lowToHigh"];
  }

  return risingCoins;
}

function calculateMovingAverage(prices, period) {
  return prices.map((val, idx, arr) => {
    if (idx < period - 1) return null; // 이동평균을 계산할 수 없는 경우 null 반환
    let sum = 0;
    for (let i = idx; i > idx - period; i--) {
      sum += arr[i];
    }
    return sum / period;
  });
}

const apiFunctions = {
  currentPriceInfo,
  candlestick,
  fetchAllCandlestickData,
  filterCoinsByValue,
  filterCoinsByRiseRate,
  findCommonCoins,
  filterContinuousRisingCoins,
  filterContinuousGreenCandles,
  filterVolumeSpikeCoins,
  findGoldenCrossCoins,
  lowToHigh,
};

export default apiFunctions;
