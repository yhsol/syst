"use client";

import {
  accountInfo,
  balance,
  currentPriceInfo,
  orderDetailInfo,
  orderInfo,
  orderbookInfo,
  recentTransactionsInfo,
  tradeHistory,
} from "../actions";

export default function Trading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      trading
      <button
        onClick={async () => {
          const res = await currentPriceInfo("BTC_KRW");
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        현재가 정보 조회
      </button>
      <button
        onClick={async () => {
          const res = await orderbookInfo("BTC_KRW");
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        호가 정보 조회
      </button>
      <button
        onClick={async () => {
          const res = await accountInfo();
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        회원 정보 조회
      </button>
      <button
        onClick={async () => {
          const res = await balance();
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        보유자산 조회
      </button>
      <button
        onClick={async () => {
          const res = await recentTransactionsInfo();
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        최근 거래정보 조회
      </button>
      <button
        onClick={async () => {
          const res = await orderInfo("THETA");
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        거래 주문내역 조회
      </button>
      <button
        onClick={async () => {
          const res = await orderDetailInfo("need order id", "THETA");
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        거래 주문내역 상세 조회
      </button>
      <button
        onClick={async () => {
          const res = await tradeHistory("THETA", "KRW");
          console.log(res);
        }}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        거래 체결내역 조회
      </button>
    </main>
  );
}
