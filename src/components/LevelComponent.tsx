import React, { useState, useEffect, useRef } from 'react'
import OutputComponent from './OutputComponent'
import InfoComponent from './InfoComponent'

export default function LevelComponent() {

  return (
    <div className="w-screen h-screen flex gap-10 p-4 font-mono overflow-hidden">
      <div className="flex gap-4 p-4 w-6/7 mx-auto">

        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <InfoComponent />
        </div>
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <OutputComponent />
        </div>
      </div>

    </div>
  )
}