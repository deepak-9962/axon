import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

const CustomNode = ({ data, selected }: NodeProps) => {
  const label = data.label as string;
  const note = data.note as string | undefined;
  const highlight = data.highlight as boolean | undefined;

  return (
    <div
      className={cn(
        "px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[150px] max-w-[300px]",
        selected ? "border-black" : "",
        highlight ? "border-green-500 bg-green-50" : ""
      )}
    >
      <Handle type="target" position={Position.Left} className="w-16 !bg-stone-400" />
      <div className="flex flex-col">
        <div className="text-sm font-bold text-stone-900">{label}</div>
        {note && <div className="text-xs text-stone-500">{note}</div>}
      </div>
      <Handle type="source" position={Position.Right} className="w-16 !bg-stone-400" />
    </div>
  );
};

export default memo(CustomNode);
