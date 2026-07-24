import { useRef, useCallback } from "react";

// Small reusable canvas helper hook: exposes a ref plus a couple of
// convenience methods for exporting the current canvas contents.
export const useCanvas = () => {
  const canvasRef = useRef(null);

  const toDataURL = useCallback((type = "image/png", quality = 1) => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL(type, quality);
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return { canvasRef, toDataURL, clear };
};

export default useCanvas;
