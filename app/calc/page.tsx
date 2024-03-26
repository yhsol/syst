"use client";

import { FormEvent, useState } from "react";

export default function Calc() {
  const [price, setPrice] = useState("");
  const [rate, setRate] = useState("");
  const [finalPrice, setFinalPrice] = useState<string | null>(null);

  const calcNewPrice = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const decimalRate = parseFloat(rate) / 100;
    const newPrice = parseFloat(price) * (1 + decimalRate);
    setFinalPrice(newPrice.toFixed(2)); // 소수점 둘째자리까지 반올림하여 최종 가격을 설정
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("클립보드에 복사되었습니다.");
      })
      .catch((err) => {
        console.error("복사 실패: ", err);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form onSubmit={calcNewPrice} className="space-y-4">
        <div>
          <label
            htmlFor="price"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            원래 가격
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="가격을 입력하세요"
            required
          />
        </div>
        <div>
          <label
            htmlFor="rate"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            수익률 (%)
          </label>
          <input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="수익률을 입력하세요"
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          계산하기
        </button>
      </form>
      {finalPrice !== null && (
        <p className="mt-4" onClick={() => copyToClipboard(finalPrice)}>
          새로운 가격은:{" "}
          <span className="cursor-pointer text-blue-500">{finalPrice}</span>원
        </p>
      )}
    </main>
  );
}
