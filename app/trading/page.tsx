"use client";

import { useEffect, useState } from "react";

export default function Trading() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [symbol, setSymbol] = useState("");
  const [krw, setKrw] = useState(10000);
  const [units, setUnits] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [amount, setAmount] = useState(1.0);
  const [profit, setProfit] = useState(5);

  const baseURL = "https://syst-web-447-8c66c29d-khioiqah.onporter.run";
  const apiKey = process.env.NEXT_PUBLIC_SYST_API_KEY;

  const fetchData = async (endpoint: string) => {
    setIsLoading(true);

    if (!apiKey) {
      console.error("API key is missing");
      setResults({ error: "API key is missing" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults({ error: "Error fetching data" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTrade = () =>
    fetchData(`/trade/run?timeframe=1h&symbols=${symbol}`);
  const handleStopAll = () => fetchData("/trade/stop-all");
  const handleStopSymbol = () =>
    fetchData(`/trade/stop-symbol?symbol=${symbol}`);
  const handleStatus = () => fetchData("/trade/status");
  const handleReselect = () => fetchData("/trade/reselect");
  const handleSetKrw = () => fetchData(`/trade/set-available-krw?krw=${krw}`);
  const handleAddHolding = () =>
    fetchData(
      `/trade/add-holding?symbol=${symbol}&units=${units}&buy_price=${buyPrice}`
    );
  const handleRemoveHolding = () =>
    fetchData(`/trade/remove-holding?symbol=${symbol}`);
  const handleAddActiveSymbol = () =>
    fetchData(`/trade/add-active-symbol?symbols=${symbol}`);
  const handleSetProfitTarget = () =>
    fetchData(`/trade/set-profit-target?profit=${profit}&amount=${amount}`);
  const handleBuy = () => fetchData(`/trade/buy?symbol=${symbol}`);
  const handleSell = () =>
    fetchData(`/trade/sell?symbol=${symbol}&amount=${amount}`);

  return (
    <>
      <div className="flex h-screen divide-x-2 divide-black">
        {/* 왼쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          <input
            type="text"
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <input
            type="number"
            placeholder="KRW"
            value={krw}
            onChange={(e) => setKrw(parseFloat(e.target.value))}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <input
            type="number"
            placeholder="Units"
            value={units}
            onChange={(e) => setUnits(parseFloat(e.target.value))}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <input
            type="number"
            placeholder="Buy Price"
            value={buyPrice}
            onChange={(e) => setBuyPrice(parseFloat(e.target.value))}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <input
            type="number"
            placeholder="Profit"
            value={profit}
            onChange={(e) => setProfit(parseFloat(e.target.value))}
            className="my-2 p-2 w-full bg-gray-200 rounded-md"
          />
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleRunTrade}
          >
            Run Trade
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleStopAll}
          >
            Stop All
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleStopSymbol}
          >
            Stop Symbol
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleStatus}
          >
            Status
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleReselect}
          >
            Reselect
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleSetKrw}
          >
            Set Available KRW
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleAddHolding}
          >
            Add Holding
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleRemoveHolding}
          >
            Remove Holding
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleAddActiveSymbol}
          >
            Add Active Symbol
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleSetProfitTarget}
          >
            Set Profit Target
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleBuy}
          >
            Buy
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={handleSell}
          >
            Sell
          </button>
        </aside>

        {/* 메인 영역: 결과 데이터를 그대로 보여줍니다. */}
        <main className="w-3/4 p-4 flex flex-col">
          {results && (
            <pre className="flex-grow overflow-y-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}

          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          )}
        </main>
      </div>

      {/* 로딩 인디케이터 스타일 (Tailwind CSS로는 직접적인 애니메이션 지원이 부족하여 추가 CSS 필요) */}
      <style jsx>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid gray;
          width: 40px;
          height: 40px;
          -webkit-animation: spin 2s linear infinite; /* Safari */
          animation: spin 2s linear infinite;
          // 가로 세로 중앙 정렬
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -20px;
          margin-left: -20px;
        }

        /* Safari */
        @-webkit-keyframes spin {
          0% {
            -webkit-transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
