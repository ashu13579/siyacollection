import { useState } from "react";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='60' text-anchor='middle' dominant-baseline='middle'%3E📦%3C/text%3E%3C/svg%3E";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const SafeImage = ({ src, fallback = PLACEHOLDER, alt = "", ...props }: SafeImageProps) => {
  const [errored, setErrored] = useState(false);
  return (
    <img
      {...props}
      src={errored || !src ? fallback : src}
      alt={alt}
      onError={() => setErrored(true)}
    />
  );
};

export default SafeImage;
export { PLACEHOLDER };
