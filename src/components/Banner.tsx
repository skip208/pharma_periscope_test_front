import { ReactNode } from "react";

type Variant = "info" | "error" | "success" | "warning";

interface BannerProps {
  variant?: Variant;
  children: ReactNode;
  onClose?: () => void;
}

function Banner({ variant = "info", children, onClose }: BannerProps) {
  return (
    <div className={`banner banner--${variant}`}>
      <div className="banner__content">{children}</div>
      {onClose && (
        <button className="banner__close" type="button" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
    </div>
  );
}

export default Banner;

