import React, { useState, useEffect, useRef } from 'react'
import OutputComponent from './OutputComponent'

export default function LevelComponent() {

  return (
    <div className="w-screen h-screen flex gap-10 p-4 font-mono overflow-hidden">
      <div className="flex gap-4 p-4 w-6/7 mx-auto">
        {/* Left panel */}
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">

          {/* Title */}
          <h1 className="text-center text-5xl tracking-widest text-green-400">
            GLORPYTHON
          </h1>

          {/* Code panels */}
          <div className="flex gap-3">
            {/* Python */}
            <div className="m-5 flex-1 bg-[#3a7bd5] rounded-2xl overflow-hidden">
              <div className="bg-[#2d5fa8] text-white text-s text-center py-2 tracking-widest font-bold">
                *** PYTHON CODE ***
              </div>
              <div className="bg-[#4a8be0] m-2 rounded-xl p-3">
                <pre className="text-white text-xs leading-relaxed m-0">{`nums = [1,2,3]
  sum = 0
  for i in nums:
    sum += i
  print(sum)`}</pre>
              </div>
            </div>

            {/* Alien */}
            <div className="m-5 flex-1 bg-[#2d7a3a] rounded-2xl overflow-hidden">
              <div className="bg-[#1f5c29] text-white text-s text-center py-2 tracking-widest font-bold">
                *** ALIEN CODE ***
              </div>
              <div className="bg-[#3a9447] m-2 rounded-xl p-3">
                <pre className="text-white text-xs leading-relaxed m-0">{`nums eats [1,2,3]
  sum eats 0
  i eats nums slowly:
    sum eats more i
  print eats sum`}</pre>
              </div>
            </div>
          </div>

          {/* Goal text */}
          <div className="text-gray-300 text-m leading-relaxed text-center" >
            <p className="mb-2">The code above are equivalent.</p>
            <p className="mb-2">YOUR GOAL: Write a program in ALIEN CODE that outputs the<br />
            SQUARE OF THE LENGTH OF nums.</p>
            <p className="mb-2">Assume nums is already defined.</p>
            <p>(Hint: you cannot use any +-*/ or **)</p>
          </div>

        </div>
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <OutputComponent />
        </div>
      </div>

    </div>
  )
}