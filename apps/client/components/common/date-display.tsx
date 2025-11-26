type DateDisplayProps = {
  date: Date;
  className?: string;
};

export function DateDisplay({ date, className }: DateDisplayProps) {
  return <span className={className}>{date.toLocaleDateString("ja-JP")}</span>;
}
