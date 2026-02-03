import { useState, useMemo } from "react";

interface Column<T> {
  key: keyof T;
  label: string;
  isHtml?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  // Quitamos rowsPerPage ya que no paginaremos
  renderCell?: (key: keyof T, value: any, row: T) => React.ReactNode;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  renderCell,
}: TableProps<T>) => {
  const [search, setSearch] = useState("");

  // Filtro de búsqueda (se mantiene igual)
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  return (
    <div className="w-full">
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="
            w-full md:w-1/3 px-4 py-2 
            bg-gray-100 text-gray-900 
            rounded-xl 
            border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-gray-400 
            placeholder-gray-500
            transition
          "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contenedor de la Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="
                    px-6 py-4 text-left text-sm font-semibold text-gray-700
                    border-b border-gray-200 
                    tracking-wide
                  "
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Aquí usamos filteredData directamente para mostrar todos los registros */}
            {filteredData.map((row, i) => (
              <tr
                key={i}
                className="
                  group
                  transition-all duration-200
                  hover:bg-gray-50/70
                  hover:shadow-sm
                "
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="
                      px-6 py-4 text-gray-800 
                      border-b border-gray-100 
                      text-sm
                    "
                  >
                    {renderCell
                      ? renderCell(col.key, row[col.key], row)
                      : typeof row[col.key] === "boolean"
                      ? row[col.key]
                        ? "SI"
                        : "NO"
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer simplificado */}
      <div className="flex justify-between items-center mt-6 px-2">
        <span className="text-sm text-gray-600 tracking-wide">
          Mostrando {filteredData.length} registros
        </span>
      </div>
    </div>
  );
};