import React from 'react';
import { ShieldCheck, Receipt, Copy, Check, Volume2, Pause, RefreshCw, Sparkles } from 'lucide-react';

export interface TableRow {
  label: string;
  value: string;
  isHighlight?: boolean;
  highlightType?: 'success' | 'warning' | 'info';
}

export interface TableData {
  title?: string;
  subtitle?: string;
  rows: TableRow[];
  statusBadge?: string;
}

export interface TimelineStep {
  label: string;
  time?: string;
  status: 'completed' | 'current' | 'pending';
}

export interface TimelineData {
  title: string;
  subtitle?: string;
  steps: TimelineStep[];
}

interface TabularAnswerCardProps {
  tableData?: TableData;
  timelineData?: TimelineData;
  actionsTaken?: string[];
  suggestedQuestions?: string[];
  onSelectQuestion?: (question: string) => void;
  onWhyThisAnswer?: () => void;
  onSeeDeductions?: () => void;
  onCopy?: () => void;
  onPlaySpeech?: () => void;
  copied?: boolean;
  isPlaying?: boolean;
  isLoadingSpeech?: boolean;
}

export const TabularCard: React.FC<{ data: TableData }> = ({ data }) => {
  return (
    <div className="rounded-xl bg-white shadow-2xs overflow-hidden my-3 select-text">
      {/* Optional Card Title Header */}
      {data.title && (
        <div className="px-3.5 py-2.5 bg-slate-50/90 font-bold text-xs text-slate-900 flex items-center justify-between">
          <span>{data.title}</span>
          {data.subtitle && (
            <span className="text-[11px] font-medium text-slate-500">{data.subtitle}</span>
          )}
        </div>
      )}

      {/* Rows Container */}
      <div className="divide-y divide-slate-100/80">
        {data.rows.map((row, idx) => {
          if (row.isHighlight) {
            return (
              <div
                key={idx}
                className="px-3.5 py-2.5 bg-emerald-50/90 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span className="text-emerald-800">{row.label}</span>
                <span className="text-emerald-700 font-extrabold text-right">
                  {row.value}
                </span>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-xs transition-colors hover:bg-slate-50/40"
            >
              <span className="text-slate-500 font-medium">{row.label}</span>
              <span className="text-slate-900 font-bold text-right font-mono sm:font-sans">
                {row.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Optional Bottom Status Pill / Notice */}
      {data.statusBadge && (
        <div className="p-2.5 bg-slate-50/60">
          <div className="py-2 px-3 rounded-lg bg-blue-50/80 text-blue-900 text-center font-bold text-xs shadow-2xs">
            {data.statusBadge}
          </div>
        </div>
      )}
    </div>
  );
};

export const TimelineCard: React.FC<{ data: TimelineData }> = ({ data }) => {
  return (
    <div className="rounded-xl bg-white shadow-2xs p-4 my-3 select-text space-y-3">
      {/* Title & Live Status */}
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{data.title}</h4>
        {data.subtitle && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{data.subtitle}</span>
          </div>
        )}
      </div>

      {/* Vertical Stepper */}
      <div className="relative pl-2 pt-1 space-y-4">
        {data.steps.map((step, idx) => {
          const isLast = idx === data.steps.length - 1;
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={idx} className="relative flex items-start gap-3">
              {/* Connecting line to next step */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-6 w-0.5 -bottom-4 ${
                    isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Circle Indicator */}
              <div className="relative z-10 shrink-0">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-blue-200">
                    {idx + 1}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-slate-950 font-extrabold' : 'text-slate-800'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.time && (
                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        isCurrent ? 'text-blue-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {step.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TabularAnswerCard: React.FC<TabularAnswerCardProps> = ({
  tableData,
  timelineData,
  actionsTaken,
  suggestedQuestions,
  onSelectQuestion,
  onWhyThisAnswer,
  onSeeDeductions,
  onCopy,
  onPlaySpeech,
  copied,
  isPlaying,
  isLoadingSpeech,
}) => {
  return (
    <div className="space-y-3">
      {/* 1. Tabular Key-Value Card */}
      {tableData && <TabularCard data={tableData} />}

      {/* 2. Timeline Stepper Card */}
      {timelineData && <TimelineCard data={timelineData} />}

      {/* 3. Actions Taken Chips */}
      {actionsTaken && actionsTaken.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {actionsTaken.map((act, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[11px] font-semibold text-slate-700 shadow-2xs"
            >
              <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
              <span>{act}</span>
            </span>
          ))}
        </div>
      )}

      {/* 4. Action Pills Below Table (Why this answer?, See deductions, Copy, Read Aloud) */}
      <div className="flex items-center flex-wrap gap-2 pt-1 text-xs">
        {onWhyThisAnswer && (
          <button
            type="button"
            onClick={onWhyThisAnswer}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 hover:bg-blue-100 text-blue-900 font-bold text-[11px] transition cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Why this answer?</span>
          </button>
        )}

        {onSeeDeductions && (
          <button
            type="button"
            onClick={onSeeDeductions}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition cursor-pointer shadow-2xs"
          >
            <Receipt className="w-3 h-3 text-slate-600" />
            <span>See deductions</span>
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto shrink-0">
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Copy className="w-3.5 h-3.5 stroke-[1.8]" />
              )}
            </button>
          )}

          {onPlaySpeech && (
            <button
              type="button"
              onClick={onPlaySpeech}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
              }`}
              title={isPlaying ? 'Pause reading aloud' : 'Read aloud (Gnani AI Voice)'}
            >
              {isLoadingSpeech ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white stroke-none" />
              ) : (
                <Volume2 className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 5. Quick Question Prompt Chips Below Message (as seen in Image 1) */}
      {suggestedQuestions && suggestedQuestions.length > 0 && onSelectQuestion && (
        <div className="pt-2 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(q)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100/90 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-95"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
