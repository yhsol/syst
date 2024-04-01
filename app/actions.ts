"use server";

import axios from "axios";
import { XCoinAPI } from "./XCoinAPI";

const DEFAULT_TICKER = "ALL_KRW";

const api_key = process.env.NEXT_PUBLIC_BITHUMB_CON_KEY;
const api_secret = process.env.NEXT_PUBLIC_BITHUMB_SEC_KEY;
const xcoinAPI = new XCoinAPI(api_key, api_secret);

// 현재가 정보 조회
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
