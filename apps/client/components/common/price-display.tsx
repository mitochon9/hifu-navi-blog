type PriceDisplayProps = {
  price: number;
  className?: string;
};

export function PriceDisplay({ price, className }: PriceDisplayProps) {
  return <span className={className}>¥{price.toLocaleString()}</span>;
}
