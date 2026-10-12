type Props = {
  rating: number;
  className?: string;
};

export default function StarRatingDisplay({ rating, className = "" }: Props) {
  const boundedRating = Math.max(0, Math.min(5, rating));

  return (
    <span
      role="img"
      aria-label={`${boundedRating} out of 5 stars`}
      className={`inline-flex ${className}`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, boundedRating - index));
        return (
          <span key={index} aria-hidden="true" className="relative inline-block">
            <span className="text-slate-300">☆</span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-amber-500"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
