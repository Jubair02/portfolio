/**
 * Renders plain text where **double asterisks** mark emphasised runs, so the
 * admin can highlight words without a rich-text editor. Splitting on a
 * capturing group leaves the emphasised runs at the odd indices.
 */
export function BoldMarks({
  text,
  strongClassName = "font-medium text-foreground",
}: {
  text: string;
  strongClassName?: string;
}) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={strongClassName}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
