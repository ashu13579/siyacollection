import { useState } from "react";
import { Star } from "lucide-react";

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

const StarPicker = ({ value, onChange, size = 24 }: StarPickerProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Rate this product">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = hovered ? star <= hovered : star <= value;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              size={size}
              className={
                active
                  ? "fill-secondary text-secondary"
                  : "text-muted-foreground"
              }
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarPicker;
