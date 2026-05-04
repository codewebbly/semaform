const INPUT_CLASS =
  "h-9 rounded-[6px] border border-[#E5E4E0] px-3 py-2 text-sm bg-white text-[#1A1A18] placeholder:text-[#9B9A96] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/20 focus:border-[#1A6BFF] transition-colors";

interface Props {
  search?: string;
  focusArea?: string;
  geography?: string;
  resultCount: number;
}

export function DiscoveryFilters({ search, focusArea, geography, resultCount }: Props) {
  const hasFilters = search || focusArea || geography;

  return (
    <div className="mb-6">
      <form method="GET" className="flex flex-col sm:flex-row gap-2">

        {/* Search with icon */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A96] pointer-events-none"
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by keyword…"
            className={`${INPUT_CLASS} pl-8 w-full`}
          />
        </div>

        <input
          name="focusArea"
          defaultValue={focusArea}
          placeholder="Focus area"
          className={`${INPUT_CLASS} sm:w-40`}
        />
        <input
          name="geography"
          defaultValue={geography}
          placeholder="Geography"
          className={`${INPUT_CLASS} sm:w-36`}
        />

        <button
          type="submit"
          className="h-9 rounded-[6px] bg-[#1A6BFF] text-white px-4 text-sm font-medium hover:bg-[#1558D6] transition-colors shrink-0"
        >
          Search
        </button>

        {hasFilters && (
          <a
            href="/nonprofit/rfps"
            className="h-9 inline-flex items-center rounded-[6px] border border-[#E5E4E0] text-[#6B6A66] px-3 text-sm hover:bg-[#F8F8F7] transition-colors shrink-0"
          >
            Clear
          </a>
        )}
      </form>

      <p className="text-xs text-[#9B9A96] mt-2">
        {resultCount} {resultCount === 1 ? "opportunity" : "opportunities"} found
        {hasFilters ? " — matching your filters" : ""}
      </p>
    </div>
  );
}
