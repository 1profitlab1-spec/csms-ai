
import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: React.ReactNode;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, className }) => {
  const [error, setError] = React.useState(!src);

  React.useEffect(() => {
    setError(!src);
  }, [src]);

  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-brand-medium ${className}`}>
      {error ? (
        <span className="font-semibold">{fallback}</span>
      ) : (
        <img src={src} alt={alt} onError={() => setError(true)} className="aspect-square h-full w-full" />
      )}
    </div>
  );
};

export { Avatar };