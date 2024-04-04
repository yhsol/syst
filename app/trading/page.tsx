"use client";

import { useState } from "react";
import {
  accountInfo,
  balance,
  currentPriceInfo,
  filterCoinsByRiseRate,
  filterContinuousRisingCoins,
  filterCoinsByValue,
  filterVolumeSpikeCoins,
  findCommonCoins,
  orderDetailInfo,
  orderInfo,
  orderbookInfo,
  recentTransactionsInfo,
  tradeHistory,
  findCommonSpike,
  findCommonSpike2,
} from "../actions";

export default function Trading() {
  const [selectedResult, setSelectedResult] = useState<any>("let's find out!");
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [commonResults, setCommonResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const allMethods = {
    filterCoinsByValue,
    filterCoinsByRiseRate,
    findCommonCoins,
    filterContinuousRisingCoins,
    filterVolumeSpikeCoins,
    findCommonSpike,
  } as any;

  const handleMethodSelection = (method: any) => {
    setSelectedMethods((prev: any) =>
      prev.includes(method)
        ? prev.filter((m: any) => m !== method)
        : [...prev, method]
    );
  };

  const findCommonElements = (arrays: any) => {
    return arrays.reduce(
      (acc: any, array: any) => acc.filter((item: any) => array.includes(item)),
      arrays[0] || []
    );
  };

  const executeSelectedMethods = async () => {
    const results = await Promise.all(
      selectedMethods.map((method) => allMethods[method]())
    );
    console.log("log=> results", results);

    const commonElements = findCommonElements(
      results.map((result) => result.map((coin: any) => coin))
    );
    setCommonResults(commonElements);
  };

  const fetchResult = async (action: () => Promise<any>) => {
    setIsLoading(true); // 로딩 시작
    try {
      const result = await action();
      setSelectedResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <>
      <div className="flex h-screen divide-x-2 divide-black">
        {/* 왼쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => currentPriceInfo("BTC_KRW"))}
          >
            현재가 정보 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => orderbookInfo("BTC_KRW"))}
          >
            호가 정보 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => accountInfo())}
          >
            회원 정보 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => balance())}
          >
            보유자산 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => recentTransactionsInfo())}
          >
            최근 거래정보 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => orderInfo("THETA"))}
          >
            거래 주문내역 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchResult(() => orderDetailInfo("need order id", "THETA"))
            }
          >
            거래 주문내역 상세 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => tradeHistory("THETA", "KRW"))}
          >
            거래 체결내역 조회
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => filterCoinsByValue())}
          >
            거래량 100
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => filterCoinsByRiseRate())}
          >
            상승률 100
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => findCommonCoins("rise"))}
          >
            거래량 & 상승률 겹치는 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchResult(() => filterContinuousRisingCoins("10m", 2, 200))
            }
          >
            지속 상승 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() =>
              fetchResult(() => filterVolumeSpikeCoins("10m", 200, 2))
            }
          >
            거래량 급증 코인
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => findCommonSpike("10m"))}
          >
            지속 상승 + 거래량 급증
          </button>
          <button
            className="my-2 p-2 w-full bg-gray-500 text-white rounded-md"
            onClick={() => fetchResult(() => findCommonSpike2("10m"))}
          >
            거래량 + 상승률 + 지속 상승 + 거래량 급증
          </button>
        </aside>

        {/* 메인 영역: 결과 데이터를 그대로 보여줍니다. */}
        <main className="w-1/2 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm">
              {selectedResult && selectedResult.length
                ? JSON.stringify(selectedResult, null, 2)
                : "No data"}
            </pre>
          )}
        </main>

        {/* 오른쪽 사이드 메뉴 */}
        <aside className="w-1/4 p-4 overflow-y-auto">
          {Object.keys(allMethods).map((method) => (
            <button
              key={method}
              onClick={() => handleMethodSelection(method)}
              className={`my-2 p-2 w-full rounded-md ${
                (selectedMethods as any).includes(method)
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {method}
            </button>
          ))}
          <button
            onClick={executeSelectedMethods}
            className="mt-4 p-2 w-full bg-gray-500 text-white rounded-md"
          >
            결과 겹치기 조회
          </button>

          {/* 공통 결과 표시 */}
          <div className="mt-4">
            <div>공통 결과:</div>
            {commonResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
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
