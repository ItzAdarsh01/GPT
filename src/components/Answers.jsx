import React from "react";
export default function Answers({ ans }) {
  return (
    <div className="py-1">
      <p className="text-sm md:text-base leading-relaxed">
        {ans}
      </p>
    </div>
  )
}