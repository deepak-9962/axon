import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { ChevronDown, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

import { useStore } from '@/lib/store';

const RichNode = ({ id, data, selected }: NodeProps) => {
  const { toggleNodeExpanded } = useStore();
  const expanded = !!data.expanded;

  const label = data.label as string;
  const details = data.details as string[] | undefined;
  const examTip = data.exam_tip as string | undefined;
  const highlight = data.highlight as boolean | undefined;
  const matchedKeywords = (data.matchedKeywords as string[] | undefined) ?? [];
  const missedKeywords = (data.missedKeywords as string[] | undefined) ?? [];
  const totalKeywords = matchedKeywords.length + missedKeywords.length;
  const isPracticing = totalKeywords > 0;

  // Compute border via inline style — completely avoids Tailwind transitions/specificity issues
  const borderStyle: React.CSSProperties = (() => {
    if (selected) return { border: '2px solid #000' };
    if (isPracticing && highlight) return { border: '2.5px solid #22c55e' }; // solid green-500
    if (isPracticing && !highlight) return { border: '1.5px solid #fca5a5' }; // soft red-300
    return { border: '1px solid #e7e5e4' }; // default stone-200
  })();

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg bg-white shadow-md w-[250px]',
        expanded ? 'z-50' : '',
      )}
      style={borderStyle}
    >
      {/* Header Section */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer rounded-t-lg select-none"
        onClick={() => toggleNodeExpanded(id)}
      >
        <div className="font-bold text-sm leading-tight flex-1 pr-2 text-stone-900">
          {label}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Score pill shown while practicing */}
          {isPracticing && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                matchedKeywords.length === totalKeywords
                  ? 'bg-green-100 text-green-700'
                  : matchedKeywords.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-600',
              )}
            >
              {matchedKeywords.length}/{totalKeywords}
            </span>
          )}

          <ChevronDown
            className={cn(
              'w-4 h-4 text-stone-400',
              expanded ? 'rotate-180' : '',
            )}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="rounded-b-lg border-t border-stone-100">
          <div className="p-3 space-y-3">
            {/* Keyword badges — shown only while practicing */}
            {isPracticing && totalKeywords > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700 border border-green-200"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {kw}
                    </span>
                  ))}
                  {missedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-500 border border-red-200"
                    >
                      <XCircle className="w-3 h-3" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                <p className="text-xs text-indigo-700 font-medium leading-tight">{examTip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-stone-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-stone-400 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(RichNode);
