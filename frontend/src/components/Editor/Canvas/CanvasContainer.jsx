import React, { useRef, useEffect, useState, useCallback } from "react";
import { useEditor } from "../../../hooks/useEditor";
import { FaPlus, FaMinus, FaExpand } from "react-icons/fa";

const imageCache = new Map();
const REVEAL_DURATION = 420; // ms, how long a photo takes to fade+scale into its frame

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    if (imageCache.has(url)) {
      resolve(imageCache.get(url));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });

const easeOutBack = (t) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const CanvasContainer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    project,
    frames,
    images,
    decorations,
    textElements,
    updateFrame,
    updateDecoration,
    updateText,
  } = useEditor();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Tracks when each frame's photo started revealing, so newly placed
  // photos animate in (fade + gentle pop) instead of just appearing.
  const revealStartRef = useRef(new Map());
  const rafRef = useRef(null);

  // Drag state lives in a ref (not React state) so mousemove doesn't
  // trigger a re-render on every pixel of movement - we redraw the
  // canvas directly instead, which is much smoother.
  const dragRef = useRef(null); // { type: 'text' | 'decoration' | 'frame', id, offsetX, offsetY }

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = project.width || 1200;
    const height = project.height || 1600;

    canvas.width = width * zoomLevel;
    canvas.height = height * zoomLevel;

    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Background
    ctx.fillStyle = project.backgroundColor || "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    let stillAnimating = false;
    const now = performance.now();

    // Frames + images (or empty placeholders)
    if (frames && frames.length > 0) {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        ctx.strokeStyle = frame.borderColor || "#e2d9fb";
        ctx.lineWidth = frame.borderWidth || 3;

        if (frame.image?.url) {
          const revealKey = `${frame.id}:${frame.image.url}`;
          if (!revealStartRef.current.has(revealKey)) {
            revealStartRef.current.set(revealKey, now);
          }
          const elapsed = now - revealStartRef.current.get(revealKey);
          const t = Math.min(1, elapsed / REVEAL_DURATION);
          if (t < 1) stillAnimating = true;
          const eased = easeOutBack(t);

          try {
            const img = await loadImage(frame.image.url);

            const cx = frame.x + frame.width / 2;
            const cy = frame.y + frame.height / 2;

            ctx.save();
            ctx.globalAlpha = Math.min(1, t * 1.4);
            ctx.beginPath();
            ctx.rect(frame.x, frame.y, frame.width, frame.height);
            ctx.clip();

            // Gentle pop/scale-in from the center of the frame
            ctx.translate(cx, cy);
            ctx.scale(eased, eased);
            ctx.translate(-cx, -cy);

            ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height);
            ctx.restore();
          } catch (e) {
            // ignore failed image load
          }
        } else {
          ctx.fillStyle = "#f5f2fd";
          ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
        }
        ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);

        // Subtle highlight while a frame is actively being dragged
        if (dragRef.current?.type === "frame" && dragRef.current.id === frame.id) {
          ctx.save();
          ctx.strokeStyle = "#7c3aed";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.strokeRect(frame.x - 4, frame.y - 4, frame.width + 8, frame.height + 8);
          ctx.restore();
        }
      }
    } else if (images.length === 0) {
      // Friendly empty-state hint drawn directly on the canvas
      ctx.fillStyle = "#a394d1";
      ctx.font = "600 28px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Unggah foto & pilih layout untuk mulai", width / 2, height / 2);
    }

    // Decorations (stickers)
    decorations.forEach((d) => {
      ctx.save();
      const size = d.size || 64;
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(d.x + size / 2, d.y + size / 2);
      ctx.rotate(((d.rotation || 0) * Math.PI) / 180);
      ctx.fillText(d.content, 0, 0);
      ctx.restore();

      if (dragRef.current?.type === "decoration" && dragRef.current.id === d.id) {
        ctx.save();
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(d.x - 4, d.y - 4, size + 8, size + 8);
        ctx.restore();
      }
    });

    // Text elements
    textElements.forEach((t) => {
      ctx.save();
      ctx.font = `${t.fontSize || 32}px ${t.fontFamily || "Poppins, sans-serif"}`;
      ctx.fillStyle = t.color || "#1e293b";
      ctx.textBaseline = "top";
      ctx.fillText(t.content, t.x, t.y);
      ctx.restore();

      if (dragRef.current?.type === "text" && dragRef.current.id === t.id) {
        const metrics = ctx.measureText(t.content);
        const h = (t.fontSize || 32) * 1.25;
        ctx.save();
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(t.x - 4, t.y - 4, metrics.width + 8, h + 8);
        ctx.restore();
      }
    });

    ctx.restore();

    // Keep animating while any photo reveal is still in progress
    if (stillAnimating) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => renderCanvas());
    }
  }, [project, frames, images, decorations, textElements, zoomLevel]);

  useEffect(() => {
    renderCanvas();
    return () => cancelAnimationFrame(rafRef.current);
  }, [renderCanvas]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.3));
  const handleZoomReset = () => setZoomLevel(1);

  // --- Dragging -----------------------------------------------------
  //
  // Everything is drawn on a single <canvas>, so there are no individual
  // DOM elements to attach drag handlers to. Instead we hit-test the
  // pointer position against text elements, then decorations, then
  // frames (in that order, matching what's drawn on top) on mousedown,
  // then update that item's x/y as the pointer moves.

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel,
    };
  };

  const hitTest = (x, y) => {
    const ctx = canvasRef.current?.getContext("2d");

    // Text elements (drawn last = on top, so check first)
    for (let i = textElements.length - 1; i >= 0; i--) {
      const t = textElements[i];
      ctx.font = `${t.fontSize || 32}px ${t.fontFamily || "Poppins, sans-serif"}`;
      const w = ctx.measureText(t.content).width;
      const h = (t.fontSize || 32) * 1.25;
      if (x >= t.x && x <= t.x + w && y >= t.y && y <= t.y + h) {
        return { type: "text", id: t.id, x: t.x, y: t.y };
      }
    }

    // Decorations (stickers)
    for (let i = decorations.length - 1; i >= 0; i--) {
      const d = decorations[i];
      const size = d.size || 64;
      if (x >= d.x && x <= d.x + size && y >= d.y && y <= d.y + size) {
        return { type: "decoration", id: d.id, x: d.x, y: d.y };
      }
    }

    // Frames (photos)
    for (let i = frames.length - 1; i >= 0; i--) {
      const frame = frames[i];
      if (x >= frame.x && x <= frame.x + frame.width && y >= frame.y && y <= frame.y + frame.height) {
        return { type: "frame", id: frame.id, x: frame.x, y: frame.y };
      }
    }

    return null;
  };

  const handlePointerDown = (e) => {
    const point = getCanvasPoint(e);
    const hit = hitTest(point.x, point.y);
    if (!hit) return;

    dragRef.current = {
      type: hit.type,
      id: hit.id,
      offsetX: point.x - hit.x,
      offsetY: point.y - hit.y,
    };
    canvasRef.current.style.cursor = "grabbing";
    renderCanvas();
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;

    const point = getCanvasPoint(e);
    const nextX = point.x - drag.offsetX;
    const nextY = point.y - drag.offsetY;

    if (drag.type === "text") {
      updateText(drag.id, { x: nextX, y: nextY });
    } else if (drag.type === "decoration") {
      updateDecoration(drag.id, { x: nextX, y: nextY });
    } else if (drag.type === "frame") {
      updateFrame(drag.id, { x: nextX, y: nextY });
    }
  };

  const stopDragging = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    renderCanvas();
  };

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="canvas-element"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        />
      </div>

      <div className="canvas-controls">
        <button onClick={handleZoomOut} className="control-btn" aria-label="Perkecil">
          <FaMinus />
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={handleZoomIn} className="control-btn" aria-label="Perbesar">
          <FaPlus />
        </button>
        <button onClick={handleZoomReset} className="control-btn" aria-label="Reset zoom">
          <FaExpand />
        </button>
      </div>
    </div>
  );
};

export default CanvasContainer;
