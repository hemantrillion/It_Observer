'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export function PrivateApiPopover() {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 z-50 animate-in fade-in zoom-in-95 text-slate-900 font-sans select-none">
      {/* Sample unclickable APIs */}
      <div className="space-y-1.5">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 cursor-default">
          <div className="text-xs font-bold text-slate-800">
            api case sample 1
          </div>
          <div className="text-[11px] font-mono text-slate-500 truncate">
            https://sample-api-1.internal/health
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 cursor-default">
          <div className="text-xs font-bold text-slate-800">
            api case sample 2
          </div>
          <div className="text-[11px] font-mono text-slate-500 truncate">
            https://sample-api-2.internal/health
          </div>
        </div>
      </div>

      {/* Unclickable option saying "add new private api" */}
      <div className="pt-2 mt-1.5 border-t border-slate-100">
        <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-400 text-xs font-bold cursor-not-allowed select-none">
          <Plus className="w-3.5 h-3.5" />
          <span>Add new private API</span>
        </div>
      </div>
    </div>
  );
}
