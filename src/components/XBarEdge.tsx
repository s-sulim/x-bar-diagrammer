import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";

interface XBarEdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourcePosition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetPosition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    style?: any;
}

const XBarEdge: React.FC<XBarEdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge path={edgePath} id={id} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: "all",
                    }}
                    className="nodrag nopan"
                >
                    {data?.label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default XBarEdge;
