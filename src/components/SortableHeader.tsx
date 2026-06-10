/* Colunas que podem ser ordenadas */
export type SortKey = "clicks" | "created_at";
export type SortDirection = "asc" | "desc";

/* Cabeçalho de coluna clicável que indica o estado de ordenação */
interface SortableHeaderProps {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}

export const SortableHeader = ({
  label,
  columnKey,
  sortKey,
  sortDirection,
  onSort,
  align = "left",
}: SortableHeaderProps) => {
  const isActive = sortKey === columnKey;

  return (
    <th className={align === "right" ? "px-5 py-3 text-right" : "px-5 py-3"}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={[
          "group inline-flex items-center gap-1.5 font-medium uppercase tracking-wider transition-colors duration-150 hover:cursor-pointer",
          align === "right" ? "flex-row-reverse" : "",
          isActive
            ? "text-green-400"
            : "text-neutral-500 hover:text-neutral-300",
        ].join(" ")}
      >
        {label}
        <span className="text-[10px] leading-none">
          {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
};
