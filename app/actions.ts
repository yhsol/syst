"use server";

import axios from "axios";
import { XCoinAPI } from "./XCoinAPI";

const DEFAULT_TICKER = "ALL_KRW";

const api_key = process.env.NEXT_PUBLIC_BITHUMB_CON_KEY;
const api_secret = process.env.NEXT_PUBLIC_BITHUMB_SEC_KEY;
const xcoinAPI = new XCoinAPI(api_key, api_secret);

export type PriceInfo = {
  acc_trade_value: string;
  acc_trade_value_24H: string;
  closing_price: string;
  fluctate_24H: string;
  fluctate_rate_24H: string;
  max_price: string;
  min_price: string;
  opening_price: string;
  prev_closing_price: string;
  units_traded: string;
  units_traded_24H: string;
};

export type CoinInfo = {
  symbol: string;
  data: PriceInfo;
};

type ChartIntervals =
  | "1m"
  | "3m"
  | "5m"
  | "10m"
  | "30m"
  | "1h"
  | "6h"
  | "12h"
  | "24h";

// 현재가 정보 조회
// Response
// status	결과 상태 코드
// (정상: 0000, 그 외 에러 코드 참조)	String
// opening_price	시가 00시 기준	Number (String)
// closing_price	종가 00시 기준	Number (String)
// min_price	저가 00시 기준	Number (String)
// max_price	고가 00시 기준	Number (String)
// units_traded	거래량 00시 기준	Number (String)
// acc_trade_value	거래금액 00시 기준	Number (String)
// prev_closing_price	전일종가	Number (String)
// units_traded_24H	최근 24시간 거래량	Number (String)
// acc_trade_value_24H	최근 24시간 거래금액	Number (String)
// fluctate_24H	최근 24시간 변동가	Number (String)
// fluctate_rate_24H	최근 24시간 변동률	Number (String)
// date	타임 스탬프	Integer(String)
// PATH PARAMS
// payment_currency string; required;
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

// 호가 정보 조회
// Response
// status	결과 상태 코드
// (정상: 0000, 그 외 에러 코드 참조)	String
// timestamp	타임 스탬프	Integer(String)
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// bids	매수 요청 내역	Array[Object]
// asks	매도 요청 내역	Array[Object]
// quantity	Currency 수량	Number (String)
// price	Currency 거래가	Number (String)
// PATH PARAMS
// payment_currency string required
// QUERY PARAMS
// count int32
export async function orderbookInfo(ticker = DEFAULT_TICKER) {
  const options = {
    method: "GET",
    url: `https://api.bithumb.com/public/orderbook/${ticker}`,
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// 최근 체결 내역
// Request Parameters
// count	1~100 (기본값 : 20)	Integer
// Response
// status	결과 상태 코드
// (정상: 0000, 그 외 에러 코드 참조)	String
// transaction_date	거래 체결 시간 타임 스탬프
// (YYYY-MM-DD HH:MM:SS)	Integer (String)
// type	거래 유형
// bid : 매수 ask : 매도	String
// units_traded	Currency 거래량	Number (String)
// price	Currency 거래가	Number (String)
// total	총 거래 금액	Number (String)
export async function recentTransactions(ticker = "BTC_KRW") {
  const options = {
    method: "GET",
    url: `https://api.bithumb.com/public/transaction_history/${ticker}`,
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// 회원 정보 조회
// Request Parameters
// order_currency	주문 통화 (코인)	String/필수
// payment_currency	결제 통화 (마켓) 입력값 : KRW 혹은 BTC	String
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// created	회원가입 일시 타임 스탬프	Integer
// account_id	회원 ID	String
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// trade_fee	거래 수수료율	Number (String)
// balance	주문 가능 수량	Number (String)
export async function accountInfo() {
  const rgParams = {
    order_currency: "BTC",
    payment_currency: "KRW",
  };

  try {
    const res = await xcoinAPI.xcoinApiCall("/info/account", rgParams);
    return res.body;
  } catch (error) {
    console.error("error???: ", error);
  }
}

type DataObject = { [key: string]: string };

const filterPositiveTotals = (data: DataObject): DataObject => {
  const result: DataObject = {};

  // 객체의 각 키-값 쌍을 순회
  Object.keys(data).forEach((key) => {
    if (key.startsWith("total_") && parseFloat(data[key]) > 0) {
      result[key] = data[key];
    }
  });

  return result;
};

function parseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON 파싱 중 에러 발생:", error);
    return null;
  }
}

// 보유자산 조회
// Request Parameters
// currency	가상자산 영문 코드, ALL(전체) 기본값 : BTC	String
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// total_{currency}	전체 가상자산 수량	Number (String)
// total_krw	전체 원화(KRW) 금액	Number (String)
// inuse{currency}	주문 중 묶여있는 가상자산 수량	Number (String)
// in_use_krw	주문 중 묶여있는 원화(KRW) 금액	Number (String)
// available_{currency}	주문 가능 가상자산 수량	Number (String)
// available_krw	주문 가능 원화(KRW) 금액	Number (String)
// xcoinlast{currency}	마지막 체결된 거래 금액
// ALL 호출 시 필드 명 – xcoinlast{currency}	Number (String)
// FORM DATA
// currency string
export async function balance(currency = "ALL") {
  const rgParams = {
    currency,
  };

  try {
    const res = await xcoinAPI.xcoinApiCall("/info/balance", rgParams);
    const data = parseJSON(res.body);

    if (!data) {
      console.error("JSON 파싱 실패");
      return null;
    }

    return filterPositiveTotals(data.data);
  } catch (error) {
    console.error("error: ", error);
  }
}

// 최근 거래정보 조회
// Request Parameters
// 요청 변수	설명	타입
// order_currency	주문 통화 (코인)	String/필수
// payment_currency	결제 통화 (마켓)
// 입력값 : KRW 혹은 BTC	String
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// opening_price	회원 시작 거래가 (최근 24시간)	Number (String)
// closing_price	회원 마지막 거래가 (최근 24시간)	Number (String)
// min_price	회원 최저 거래가 (최근 24시간)	Number (String)
// max_price	회원 최고 거래가 (최근 24시간)	Number (String)
// average_price	평균가 (최근 24시간)	Number (String)
// units_traded	거래량 (최근 24시간)	Number (String)
// volume_1day	Currency 거래량 (최근 1일)	Number (String)
// volume_7day	Currency 거래량 (최근 7일)	Number (String)
// fluctate_24H	최근 24시간 변동가	Number (String)
// fluctate_rate_24H	최근 24시간 변동률	Number (String)
// Date	타임 스탬프	Integer(String)
// FORM DATA
// order_currency string required
// payment_currency string
export async function recentTransactionsInfo(orderCurrency = "BTC") {
  const endPoint = "/info/ticker";

  const encodedParams = new URLSearchParams();
  encodedParams.set("order_currency", orderCurrency);
  encodedParams.set("payment_currency", "KRW");

  const rgParams = {
    order_currency: orderCurrency,
    payment_currency: "KRW",
  };

  const options = {
    method: "POST",
    url: `https://api.bithumb.com${endPoint}`,
    headers: xcoinAPI._getHttpHeaders(endPoint, rgParams, api_key, api_secret),
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// 거래 주문내역 조회
// Request Parameters
// 요청 변수	설명	타입
// order_id	매수/매도 주문 등록된 주문번호
// (입력 시 해당 데이터만 추출)	String
// type	거래유형
// (bid : 매수 ask : 매도)	String
// count	1~1000
// (기본값 : 100)	Integer
// after	입력한 시간보다 나중의 데이터 추출
// YYYY-MM-DD hh:mm:ss 의 UNIX Timestamp
// (2014-11-28 16:40:01 = 1417160401000)	Integer
// order_currency	주문 통화 (코인)	String/필수
// payment_currency	결제 통화 (마켓)
// 입력값 : KRW 혹은 BTC	String
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// order_id	매수/매도 주문 등록된 주문번호	String
// order_date	주문일시 타임 스탬프	Integer
// type	주문 요청 구분 (bid : 매수 ask : 매도)	String
// watch_price	주문 접수가 진행되는 가격 (자동주문시)	String
// units	거래요청 Currency	String
// units_remaining	주문 체결 잔액	Number (String)
// price	1 Currency당 주문 가격	Number (String)
// FORM DATA
// order_id string
// type string
// count int32
// after int32
// order_currency string required
// payment_currency string
export async function orderInfo(orderCurrency = "BTC") {
  const endPoint = "/info/orders";

  const encodedParams = new URLSearchParams();
  encodedParams.set("order_currency", orderCurrency);

  const rgParams = {
    order_currency: orderCurrency,
  };

  const options = {
    method: "POST",
    url: `https://api.bithumb.com${endPoint}`,
    headers: xcoinAPI._getHttpHeaders(endPoint, rgParams, api_key, api_secret),
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("error: ", error);
  }
}

// 거래 주문내역 상세 조회
// Request Parameters
// 요청 변수	설명	타입
// order_id	매수/매도 주문 등록된 주문번호
// (입력 시 해당 데이터만 추출)	String/필수
// order_currency	주문 통화 (코인)	String/필수
// payment_currency	결제 통화 (마켓)
// 입력값 : KRW 혹은 BTC	String
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// order_date	주문요청 시간 타임 스탬프	Integer(String)
// type	주문 요청 구분 (bid : 매수 ask : 매도)	String
// order_status	주문 상태	String
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// watch_price	주문 접수가 진행된 가격 (자동주문시)	String
// order_price	주문요청 호가	Number(String)
// order_qty	주문요청 수량	Number(String)
// cancel_date	취소 일자 타임스탬프	Integer(String)
// cancel_type	취소 유형	String
// contract	해당주문 체결정보	Array[Object]
// transaction_date	거래 체결 시간 타임 스탬프
// (YYYY-MM-DD HH:MM:SS)	Integer(String)
// price	1 Currency당 체결가	Number (String)
// units	거래수량	Number (String)
// fee_currency	수수료 통화	String
// fee	거래 수수료	Number (String)
// total	체결 금액	Number (String)
// FORM DATA
// order_id string required
// order_currency string required
// payment_currency string
export async function orderDetailInfo(orderId: string, orderCurrency = "BTC") {
  const endPoint = "/info/order_detail";

  const encodedParams = new URLSearchParams();
  encodedParams.set("order_id", orderId);
  encodedParams.set("order_currency", orderCurrency);

  const rgParams = {
    order_id: orderId,
    order_currency: orderCurrency,
  };

  const options = {
    method: "POST",
    url: `https://api.bithumb.com${endPoint}`,
    headers: xcoinAPI._getHttpHeaders(endPoint, rgParams, api_key, api_secret),
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("error: ", error);
  }
}

// 거래 체결내역 조회
// Request Parameters
// 요청 변수	설명	타입
// offset	0~
// (기본값 : 0)	Integer
// count	1~50
// (기본값 : 20)	Integer
// searchGb	0 : 전체, 1 : 매수 완료, 2 : 매도 완료, 3 : 출금 중
// 4 : 입금, 5 : 출금, 9 : KRW 입금 중	Integer
// order_currency	주문 통화 (코인)	String/필수
// payment_currency	결제 통화 (마켓)
// 입력값 : KRW 혹은 BTC	String/필수
// Response
// 필드	설명	타입
// status	결과 상태 코드 (정상: 0000, 그 외 에러 코드 참조)	String
// search	검색 구분
// (0 : 전체, 1 : 매수 완료, 2 : 매도 완료, 3 : 출금 중
// 4 : 입금, 5 : 출금, 9 : KRW 입금 중)	Number (String)
// transfer_date	거래 일시 타임 스탬프
// YYYY-MM-DD HH:MM:SS	Integer
// order_currency	주문 통화 (코인)	String
// payment_currency	결제 통화 (마켓)	String
// units	거래요청 Currency 수량	String
// price	1Currency당 가격	Number (String)
// amount	거래 금액	Number (String)
// fee_currency	수수료 통화	String
// fee	거래 수수료	Number (String)
// order_balance	주문 통화 잔액	Number (String)
// payment_balance	결제 통화 잔액	Number (String)
// FORM DATA
// offset int32
// count int32
// searchGb int32
// order_currency string required
// payment_currency string required
export async function tradeHistory(
  orderCurrency = "BTC",
  paymentCurrency = "KRW"
) {
  const endPoint = "/info/user_transactions";

  const encodedParams = new URLSearchParams();
  encodedParams.set("order_currency", orderCurrency);
  encodedParams.set("payment_currency", paymentCurrency);

  const rgParams = {
    order_currency: orderCurrency,
    payment_currency: paymentCurrency,
  };

  const options = {
    method: "POST",
    url: `https://api.bithumb.com${endPoint}`,
    headers: xcoinAPI._getHttpHeaders(endPoint, rgParams, api_key, api_secret),
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("error: ", error);
  }
}

// cnadlestick
// Response
// 필드	설명	타입
// status	결과 상태 코드
// (정상: 0000, 그 외 에러 코드 참조)	String
// [data] – [N] – [0]	기준 시간	Integer (String)
// [data] – [N] – [1]	시가	Number (String)
// [data] – [N] – [2]	종가	Number (String)
// [data] – [N] – [3]	고가	Number (String)
// [data] – [N] – [4]	저가	Number (String)
// [data] – [N] – [5]	거래량	Number (String)
// PATH PARAMS
// order_currency string required
// payment_currency string required
// chart_intervals string required
// {1m, 3m, 5m, 10m, 30m, 1h, 6h, 12h, 24h 사용 가능}
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

export async function filterCoinsByValue(limit = 100) {
  const coinsData = await currentPriceInfo("ALL_KRW");

  const coins = Object.entries(coinsData.data)
    .map(([key, value]: any) => ({
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

  return sortedByValue;
}

export async function filterCoinsByRiseRate(limit = 100) {
  const coins = await currentPriceInfo("ALL_KRW");

  const coinsArray = Object.entries(coins.data)
    .map(([key, value]: any) => ({
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

  return sortedByRiseRate;
}

export async function findCommonCoins(
  filter: "value" | "rise" = "rise",
  limit = 100
) {
  // 상위 100개 거래대금 코인
  const top100Coins = await filterCoinsByValue(limit);

  // 상위 100개 상승률 코인
  const top100RiseRateCoins = await filterCoinsByRiseRate(limit);

  // 각 결과에서 코인 심볼 추출
  const top100Symbols = top100Coins.map((coin) => coin.symbol);
  const top100RiseRateSymbols = top100RiseRateCoins.map((coin) => coin.symbol);

  // 겹치는 심볼 찾기
  const commonSymbols = top100Symbols.filter((symbol) =>
    top100RiseRateSymbols.includes(symbol)
  );

  const base = filter === "value" ? top100Coins : top100RiseRateCoins;

  // 겹치는 심볼을 가진 코인 정보 반환
  const commonCoins = base.filter((coin) =>
    commonSymbols.includes(coin.symbol)
  );

  return commonCoins;
}

export async function filterContinuousRisingCoins(
  coins: CoinInfo[],
  chartIntervals: ChartIntervals = "1h",
  minRisingCandles = 3
) {
  const risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

  for (const coin of coins) {
    const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
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
        risingCoins.push(coin); // 연속 상승 중인 코인 추가
      }
    }
  }

  return risingCoins;
}

export async function filterContinuousGreenCandles(
  coins: CoinInfo[],
  chartIntervals: ChartIntervals = "1h",
  minGreenCandles = 3
) {
  const greenCandlesCoins = []; // 연속 양봉 중인 코인들을 저장할 배열
  for (const coin of coins) {
    const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
    if (
      candleData.status === "0000" &&
      candleData.data &&
      candleData.data.length >= minGreenCandles
    ) {
      const recentCandles = candleData.data.slice(-minGreenCandles); // 최근 캔들 데이터
      let isAllGreen = recentCandles.every((candle: any) => {
        const openPrice = parseFloat(candle[1]);
        const closePrice = parseFloat(candle[2]);
        return closePrice > openPrice; // 종가가 시가보다 높은 경우 양봉
      });

      if (isAllGreen) {
        greenCandlesCoins.push(coin); // 연속 양봉 중인 코인 추가
      }
    }
  }

  return greenCandlesCoins;
}

export async function filterVolumeSpikeCoins(
  coins: CoinInfo[],
  chartIntervals = "1h",
  volumeIncreaseFactor = 1.5
) {
  const volumeSpikeCoins = []; // 거래량이 급증한 코인들을 저장할 배열

  for (const coin of coins) {
    const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
    if (
      candleData.status === "0000" &&
      candleData.data &&
      candleData.data.length >= 8
    ) {
      const recentCandles = candleData.data.slice(-8); // 최근 8개의 캔들 데이터
      const volumes = recentCandles.map((candle: any) => parseFloat(candle[5])); // 각 캔들의 거래량
      const averageVolume =
        volumes.slice(0, 5).reduce((acc: any, val: any) => acc + val, 0) / 5; // 첫 5개 캔들의 평균 거래량

      // 마지막 세 개 캔들 중 하나라도 평균의 {volumeIncreaseFactor}배 이상인 경우 확인
      const hasVolumeSpike = volumes
        .slice(-3)
        .some((volume: any) => volume > averageVolume * volumeIncreaseFactor);

      if (hasVolumeSpike) {
        volumeSpikeCoins.push(coin); // 거래량 급증 코인 추가
      }
    }
  }

  return volumeSpikeCoins;
}

export async function findGoldenCrossCoins(
  coins: CoinInfo[],
  chartIntervals: ChartIntervals = "1m",
  candleCount = 10,
  shortPeriod = 50,
  longPeriod = 200
) {
  const goldenCrossCoins = [];

  for (const coin of coins) {
    const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
    if (candleData.status !== "0000" || !candleData.data) {
      continue; // 데이터가 유효하지 않은 경우 건너뛰기
    }

    const closingPrices = candleData.data.map((candle: any) =>
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
        goldenCrossCoins.push(coin);
        break; // 최근 {candleCount}개 캔들 내 골든크로스 발견 시 추가하고 다음 코인으로 넘어감
      }
    }
  }

  return goldenCrossCoins; // 골든크로스가 발생한 코인 리스트 반환
}

function calculateMovingAverage(prices: any, period: any) {
  return prices.map((val: any, idx: any, arr: any) => {
    if (idx < period - 1) return null; // 이동평균을 계산할 수 없는 경우 null 반환
    let sum = 0;
    for (let i = idx; i > idx - period; i--) {
      sum += arr[i];
    }
    return sum / period;
  });
}

export async function lowToHigh(
  coins: CoinInfo[],
  chartIntervals: ChartIntervals = "1h",
  minRisingCandles = 5
) {
  const risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

  for (const coin of coins) {
    const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
    if (
      candleData.status === "0000" &&
      candleData.data &&
      candleData.data.length >= minRisingCandles
    ) {
      const firstCandle = candleData.data[0]; // 첫 번째 캔들
      const lastCandle = candleData.data[candleData.data.length - 1]; // 마지막 캔들

      // 첫 번째 캔들의 시가보다 마지막 캔들의 종가가 높은 경우
      if (parseFloat(lastCandle[2]) > parseFloat(firstCandle[2])) {
        risingCoins.push(coin); // 조건에 맞는 코인 추가
      }
    }
  }

  return risingCoins;
}

export async function findRisingAndGreenCandlesCoins(
  symbols: string[],
  candlestickData: { [key: string]: any },
  minRisingCandles = 3,
  minGreenCandles = 3
): Promise<string[]> {
  const qualifiedCoins: string[] = []; // 조건을 만족하는 코인들을 저장할 배열

  for (const symbol of symbols) {
    const candleData = candlestickData[symbol];
    if (
      !candleData ||
      candleData.status !== "0000" ||
      candleData.data.length < Math.max(minRisingCandles, minGreenCandles)
    )
      continue;

    let isRising = true;
    let isAllGreen = true;
    for (let i = 1; i < minRisingCandles; i++) {
      if (
        parseFloat(candleData.data[i][2]) <=
        parseFloat(candleData.data[i - 1][2])
      ) {
        isRising = false;
        break;
      }
    }

    for (let i = 0; i < minGreenCandles && isAllGreen; i++) {
      const openPrice = parseFloat(candleData.data[i][1]);
      const closePrice = parseFloat(candleData.data[i][2]);
      if (closePrice <= openPrice) {
        isAllGreen = false;
        break;
      }
    }

    if (isRising && isAllGreen) {
      qualifiedCoins.push(symbol);
    }
  }

  return qualifiedCoins;
}

export async function filterCoinsByAverageRiseAndGreenCandles(
  coins: CoinInfo[],
  // candlestickData: { [key: string]: any },
  candleCount = 5,
  chartIntervals: ChartIntervals = "1h"
): Promise<CoinInfo[]> {
  const filteredCoins: CoinInfo[] = []; // 조건을 만족하는 코인들을 저장할 배열
  try {
    for (const coin of coins) {
      const candleData = await candlestick(coin.symbol, "KRW", chartIntervals);
      if (
        !candleData ||
        candleData.status !== "0000" ||
        candleData.data.length < candleCount
      )
        return [];

      let riseCandles = 0;
      let greenCandles = 0;

      // 최근 5개 캔들 분석
      for (let i = 0; i < candleCount; i++) {
        const candle = candleData.data[candleData.data.length - 1 - i]; // 끝에서부터 분석
        const openPrice = parseFloat(candle[1]);
        const closePrice = parseFloat(candle[2]);
        const highPrice = parseFloat(candle[3]);
        const lowPrice = parseFloat(candle[4]);

        if (closePrice > openPrice) greenCandles++; // 양봉 조건
        if (closePrice > lowPrice) riseCandles++; // 상승 조건 (종가가 저가보다 높은 경우 상승으로 간주)
      }

      // 상승 및 양봉 비율 계산
      const riseRate = riseCandles / candleCount;
      const greenRate = greenCandles / candleCount;

      // 평균적으로 상승하며 양봉을 그리는 경우 필터링
      if (riseRate > 0.6 && greenRate > 0.6) {
        // 예시로 상승 및 양봉 비율이 각각 60%를 초과하는 코인만 선택
        filteredCoins.push(coin);
      }
    }
  } catch (error) {
    return [];
  }

  return filteredCoins;
}
