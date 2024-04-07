"use client";

import { useEffect, useState } from "react";
import {
  PriceInfo,
  filterCoinsByRiseRate,
  filterCoinsByValue,
  filterContinuousGreenCandles,
  filterContinuousRisingCoins,
  lowToHigh,
  filterVolumeSpikeCoins,
  findCommonCoins,
  findGoldenCrossCoins,
  filterCoinsByAverageRiseAndGreenCandles,
} from "../actions";

type CoinResult = { symbol: any }[];

export default function Trading() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [activeKeys, setActiveKeys] = useState<any>({});
  const [intersectionResults, setIntersectionResults] = useState<any>([]);
  const [sortKey, setSortKey] = useState("riseRate"); // 초기 정렬 기준은 상승률로 설정

  const fetchData = async (key: any, action: any) => {
    setIsLoading(true);
    try {
      const result = await action();
      const calculatedCoins =
        result.length &&
        result.map((coin: any) => ({
          ...coin,
          riseRate: calculateRiseRate(coin.data),
          volume: parseFloat(coin.data.units_traded_24H),
          tradeValue: parseFloat(coin.data.acc_trade_value_24H),
        }));

      setResults((prevResults: any) => ({
        ...prevResults,
        [key]: calculatedCoins,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 상승률 계산 함수
  const calculateRiseRate = (data: PriceInfo) => {
    const openPrice = parseFloat(data.opening_price);
    const closePrice = parseFloat(data.closing_price);
    return ((closePrice - openPrice) / openPrice) * 100;
  };

  const toggleActiveKey = (key: any) => {
    setActiveKeys((prevActiveKeys: any) => ({
      ...prevActiveKeys,
      [key]: !prevActiveKeys[key],
    }));
  };

  // 결과를 정렬하는 함수
  const sortResults = (key: string) => {
    const sorted = [...intersectionResults].sort((a, b) => {
      // 상승률로 정렬
      if (key === "riseRate") {
        return b.riseRate - a.riseRate;
      }
      // 거래량으로 정렬
      else if (key === "tradeValue") {
        return b.tradeValue - a.tradeValue;
      }
      // 기본은 상승률로 정렬
      return b.riseRate - a.riseRate;
    });

    setIntersectionResults(sorted);
  };

  useEffect(() => {
    // 결과의 교집합을 계산합니다.
    const allResults = Object.values(results);
    if (allResults.length > 1) {
      const intersection = allResults.reduce((acc: any, result: any) =>
        acc.filter((item: any) =>
          result.map((c: any) => c.symbol).includes(item.symbol)
        )
      );
      setIntersectionResults(intersection);
    }
  }, [results]);

  // 정렬 기준이 변경될 때 마다 결과를 재정렬
  useEffect(() => {
    sortResults(sortKey);
  }, [sortKey]);

  return (
    <>
      <div className="flex h-screen divide-x-2 divide-black">
        {/* 왼쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchData("topByRiseRate", filterCoinsByRiseRate)}
          >
            상승률 100
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchData("topByVolume", filterCoinsByValue)}
          >
            거래량 100
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("commonVolumeAndRiseRate", findCommonCoins)
            }
          >
            거래량 & 상승률 겹치는 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("continuousRisingCoins", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return filterContinuousRisingCoins(coins, "10m", 2);
              })
            }
          >
            지속 상승 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("ContinuousGreenCandles", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return filterContinuousGreenCandles(coins, "10m", 2);
              })
            }
          >
            지속 양봉 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("volumeSpikeCoins", async () => {
                const coins = await filterCoinsByValue(200);
                return filterVolumeSpikeCoins(coins, "10m");
              })
            }
          >
            거래량 급증 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("1mgoldenCrossCoins", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return findGoldenCrossCoins(coins, "1m");
              })
            }
          >
            1m golden cross
          </button>

          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("1hgoldenCrossCoins2", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return findGoldenCrossCoins(coins, "1h", 2, 7, 15);
              })
            }
          >
            1h golden cross
          </button>

          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("1hgoldenCrossCoins3", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return findGoldenCrossCoins(coins, "1h", 3, 7, 15);
              })
            }
          >
            1h golden cross
          </button>

          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("1hgoldenCrossCoins5", async () => {
                const coins = await filterCoinsByRiseRate(200);
                return findGoldenCrossCoins(coins, "1h", 5, 7, 15);
              })
            }
          >
            1h golden cross
          </button>

          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("lowToHigh", async () => {
                const coins = await filterCoinsByValue(200);
                return lowToHigh(coins, "5m");
              })
            }
          >
            low to high
          </button>

          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("AverageRiseAndGreenCandles", async () => {
                const coins = await filterCoinsByValue(200);
                return filterCoinsByAverageRiseAndGreenCandles(coins, 5, "10m");
              })
            }
          >
            평균적으로 상승 비율이 높음
          </button>
        </aside>

        {/* 메인 영역: 결과 데이터를 그대로 보여줍니다. */}
        <main className="w-1/2 p-4 flex flex-col">
          {/* 정렬 옵션 선택 */}

          {Object.keys(results).map((key) =>
            activeKeys[key] ? (
              <div key={key}>
                <button
                  onClick={() => toggleActiveKey(key)}
                  className="my-2 p-2 bg-blue-500 text-white rounded-md"
                >
                  {key}
                </button>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(
                    results[key].map((c: any) => c.symbol),
                    null,
                    2
                  )}
                </pre>
              </div>
            ) : (
              <button
                key={key}
                onClick={() => toggleActiveKey(key)}
                className="my-2 p-2 bg-gray-500 text-white rounded-md"
              >
                {key}
              </button>
            )
          )}
          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          )}
        </main>

        {/* 오른쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="mb-4 p-2 w-full bg-gray-500 text-white rounded-md"
          >
            <option value="riseRate">상승률</option>
            <option value="tradeValue">거래대금</option>
            {/* <option value="rsi">RSI</option> */}
          </select>
          {/* 공통 결과 표시 */}
          <div className="mt-4">
            <div>겹치는 결과:</div>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(
                intersectionResults.map((c: any) => c.symbol),
                null,
                2
              )}
            </pre>
          </div>
        </aside>
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
