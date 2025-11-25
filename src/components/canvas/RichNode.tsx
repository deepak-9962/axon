import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { ChevronDown, BookOpen } from 'lucide-react';

const RichNode = ({ data, selected }: NodeProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const label = data.label as string;
  const details = data.details as string[] | undefined;
  const examTip = data.exam_tip as string | undefined;
  const highlight = data.highlight as boolean | undefined;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg bg-white shadow-md transition-all duration-200 w-[250px]",
        selected ? "ring-2 ring-black" : "border border-stone-200",
        highlight ? "ring-2 ring-green-500 bg-green-50" : "",
        expanded ? "z-50 scale-105 shadow-xl" : "hover:shadow-lg"
      )}
    >
      {/* Header Section */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer bg-white rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="font-bold text-stone-900 text-sm leading-tight">
          {label}
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-stone-400 transition-transform duration-200",
            expanded ? "rotate-180" : ""
          )} 
        />
      </div>

      {/* Expanded Content */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-b-lg",
          expanded ? "max-h-[500px] opacity-100 border-t border-stone-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-3 space-y-3">
          {/* Details List */}
          {details && details.length > 0 && (
            <ul className="list-disc pl-4 space-y-1">
              {details.map((detail, idx) => (
                <li key={idx} className="text-xs text-stone-600 leading-relaxed">
                  {detail}
                </li>
              ))}
            </ul>
          )}

          {/* Exam Tip Box */}
          {examTip && (
            <div className="flex gap-2 p-2 rounded bg-indigo-50 border border-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700 font-medium leading-tight">
                {examTip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-stone-400 !border-2 !border-white transition-colors group-hover:!bg-stone-600" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-stone-400 !border-2 !border-white transition-colors group-hover:!bg-stone-600" 
      />
    </div>
  );
};

export default memo(RichNode);
