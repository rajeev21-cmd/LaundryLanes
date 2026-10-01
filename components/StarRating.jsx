'use client';

// Read-only display (omit onChange) or an interactive picker (pass onChange)
// — same component either way so an average rating elsewhere on the site
// renders identically to what the customer clicked.
export default function StarRating({ value = 0, onChange, size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={onChange ? () => onChange(n) : undefined}
          style={{
            cursor: onChange ? 'pointer' : 'default',
            fontSize: size,
            lineHeight: 1,
            color: n <= Math.round(value) ? 'var(--orange)' : 'rgba(11,37,69,0.2)',
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
