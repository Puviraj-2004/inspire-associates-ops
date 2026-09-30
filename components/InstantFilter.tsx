// components/InstantFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface InstantFilterProps {
  paramName: string;
  label: string;
  allOptionLabel: string;
  options: { value: string; label: string }[];
}

export default function InstantFilter({
  paramName,
  label,
  allOptionLabel,
  options,
}: InstantFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramName) || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}:
      </label>
      <select
        value={currentValue}
        onChange={handleChange}
        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
      >
        <option value="">{allOptionLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}