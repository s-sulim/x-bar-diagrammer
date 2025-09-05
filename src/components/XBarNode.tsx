import { Handle, Position } from "reactflow";
import type { XBarData } from "../types/XBarData.ts";
import { useState } from "react";

const XBarNode = ({
    data,
    selected,
}: {
    data: XBarData;
    selected?: boolean;
}) => {
    const [text, setText] = useState(data.text);
    const direction = data.direction || "TB";

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setText(e.target.value);
        data.text = e.target.value;
    }

    // Determine handle positions based on direction
    const sourcePosition =
        direction === "TB" ? Position.Bottom : Position.Right;
    const targetPosition = direction === "TB" ? Position.Top : Position.Left;

    return data.cat != "_" ? (
        <div
            className={`flex items-center justify-center w-[120px] h-[44px] rounded-xl border-2 font-bold text-lg ${
                selected
                    ? "border-blue-500 bg-blue-50 text-gray-800"
                    : "border-slate-300 bg-white text-gray-800"
            }`}
            style={{ userSelect: "none" }}
        >
            {data.text}
            <Handle type="source" position={sourcePosition} />
            {data.cat !== "S" ? (
                <Handle type="target" position={targetPosition} />
            ) : null}
        </div>
    ) : (
        <div className="relative">
            <input
                type="text"
                value={text}
                onChange={handleChange}
                className={`w-[120px] h-[44px] px-3 text-center font-bold text-lg bg-transparent border-b-2 focus:outline-none ${
                    selected
                        ? "border-blue-500 text-blue-600"
                        : "border-slate-300 text-gray-800"
                }`}
                placeholder="Enter text..."
            />
            <Handle type="target" position={targetPosition} />
        </div>
    );
};

export default XBarNode;
