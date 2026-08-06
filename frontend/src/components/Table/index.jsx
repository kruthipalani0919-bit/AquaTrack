import React from 'react';
import EmptyState from '../EmptyState';
import Loader from '../Loader';

/**
 * Reusable Data Table component.
 */
export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden bg-surface border border-border rounded-xl shadow-sm ${className}`}>
      <div className="overflow-x-auto aqua-scrollbar">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-background/80 border-b border-border text-xs uppercase tracking-wider text-text-secondary select-none">
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  className={`px-4 py-3.5 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-text-primary">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Loader text="Loading data..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState title={emptyMessage} description="Try refining your search or add a new record." />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-colors duration-150 hover:bg-primary-light/30
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key || colIndex}
                      className={`px-4 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DataTable = Table;

export default Table;
