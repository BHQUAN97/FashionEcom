interface EmptyTableRowProps {
  colSpan: number;
  message?: string;
}

export function EmptyTableRow({ colSpan, message = 'Không có dữ liệu' }: EmptyTableRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
        {message}
      </td>
    </tr>
  );
}
