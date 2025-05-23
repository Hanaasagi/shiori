import React, { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

const DefaultPlaceholder = () => <Globe className="w-6 h-6 opacity-50" />;

export interface LazyIconProps {
  id: string;
  iconPath: string | null;
  loadIcon: (path: string) => Promise<string>;
  iconCache: React.MutableRefObject<Record<string, string>>;
  className?: string;
  placeholder?: React.ReactNode;
}

export const LazyIcon: React.FC<LazyIconProps> = ({
  id,
  iconPath,
  loadIcon,
  iconCache,
  className = "w-6 h-6",
  placeholder = <DefaultPlaceholder />,
}) => {
  const [icon, setIcon] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!iconPath || icon) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;

        // Try from cache
        if (iconCache.current[id]) {
          setIcon(iconCache.current[id]);
          return;
        }

        // Lazy load
        try {
          const base64 = await loadIcon(iconPath);
          iconCache.current[id] = base64;
          setIcon(base64);
        } catch (e) {
          console.error(`Failed to load icon for ${id}:`, e);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [iconPath, icon, iconCache, id, loadIcon]);

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`}>
      {icon ? (
        <img
          src={icon}
          alt="icon"
          className="object-contain p-0 m-0 object-center block w-full h-full"
        />
      ) : (
        placeholder
      )}
    </div>
  );
};
