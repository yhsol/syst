"use client";

import { useEffect, useState } from "react";
import {
  filterCoinsByRiseRate,
  filterCoinsByValue,
  filterContinuousRisingCoins,
  filterUp,
  filterVolumeSpikeCoins,
  findCommonCoins,
  findGoldenCrossCoins,
} from "../actions";

type CoinResult = { symbol: any }[];

export default function Trading() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [activeKeys, setActiveKeys] = useState<any>({});
  const [intersectionResults, setIntersectionResults] = useState<any>([]);

  const fetchData = async (key: any, action: any) => {
    setIsLoading(true);
    try {
      const result = await action();
      setResults((prevResults: any) => ({
        ...prevResults,
        [key]: result.map((item: any) => item.symbol),
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActiveKey = (key: any) => {
    setActiveKeys((prevActiveKeys: any) => ({
      ...prevActiveKeys,
      [key]: !prevActiveKeys[key],
    }));
  };

  useEffect(() => {
    // 결과의 교집합을 계산합니다.
    const allResults = Object.values(results);
    if (allResults.length > 1) {
      const intersection = allResults.reduce((acc: any, result: any) =>
        acc.filter((item: any) => result.includes(item))
      );
      setIntersectionResults(intersection);
    }
  }, [results]);

  console.log("log=> intersectionResults: ", intersectionResults);

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
              fetchData("continuousRisingCoins", () =>
                filterContinuousRisingCoins("30m", 2, 200)
              )
            }
          >
            지속 상승 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchData("volumeSpikeCoins", () =>
                filterVolumeSpikeCoins("10m", 200, 2)
              )
            }
          >
            거래량 급증 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchData("goldenCrossCoins", findGoldenCrossCoins)}
          >
            golden cross
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchData("filterUpCoins", filterUp)}
          >
            filter up
          </button>
        </aside>

        {/* 메인 영역: 결과 데이터를 그대로 보여줍니다. */}
        <main className="w-1/2 p-4 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          ) : (
            Object.keys(results).map((key) =>
              activeKeys[key] ? (
                <div key={key}>
                  <button
                    onClick={() => toggleActiveKey(key)}
                    className="my-2 p-2 bg-blue-500 text-white rounded-md"
                  >
                    {key}
                  </button>
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(results[key], null, 2)}
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
            )
          )}
        </main>

        {/* 오른쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          {/* 공통 결과 표시 */}
          <div className="mt-4">
            <div>겹치는 결과:</div>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(intersectionResults, null, 2)}
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
