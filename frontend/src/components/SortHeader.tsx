import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { SortDirection } from '../types';

export function SortHeader({
  label,
  field,
  sort,
  direction,
  onSort,
  className = '',
}: {
  label: string;
  field: string;
  sort: string;
  direction: SortDirection;
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = sort === field;
  return (
    <th className={`py-2 ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-slate-900 ${
          active ? 'text-slate-900' : ''
        }`}
      >
        {label}
        {active ? (
          direction === 'asc' ? (
            <ArrowUp size={13} aria-hidden />
          ) : (
            <ArrowDown size={13} aria-hidden />
          )
        ) : (
          <ChevronsUpDown size={13} aria-hidden className="text-slate-300" />
        )}
      </button>
    </th>
  );
}
