// Client-only — builds a CSV in memory and triggers a browser download via a
// throwaway object URL. No server route needed since everything it needs
// (bags/tags) is already in AppProvider's state.
export function downloadCsv(filename, headerRow, rows) {
  const csv = [headerRow, ...rows]
    .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
