// Canvas drawing helpers used by the Photobooth (Ambil Foto) page.
// Kept separate from the component so the composition logic is easy to
// unit-test / tweak independently of the React wizard UI.

const drawCheckerPattern = (ctx, width, height, colorA, colorB, size = 60) => {
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const isEven = (Math.round(x / size) + Math.round(y / size)) % 2 === 0;
      ctx.fillStyle = isEven ? colorA : colorB;
      ctx.fillRect(x, y, size, size);
    }
  }
};

const drawGridPattern = (ctx, width, height, base, line, size = 50) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  for (let x = 0; x <= width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawSpotsPattern = (ctx, width, height, base, spot) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = spot;
  const rng = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 22; i++) {
    const cx = rng(i * 12.9) * width;
    const cy = rng(i * 78.2) * height;
    const r = 40 + rng(i * 3.7) * 70;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.7, rng(i) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const drawBackground = (ctx, width, height, background) => {
  if (!background) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (background.type === "image" && background.image) {
    // Cover-fit the uploaded background image
    const img = background.image;
    const imgRatio = img.width / img.height;
    const boxRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > boxRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    return;
  }

  const [colorA, colorB] = background.colors || ["#f5f2fd", "#ede9fe"];

  switch (background.pattern) {
    case "check":
      drawCheckerPattern(ctx, width, height, colorA, colorB);
      return;
    case "grid":
      drawGridPattern(ctx, width, height, colorA, colorB);
      return;
    case "spots":
      drawSpotsPattern(ctx, width, height, colorA, colorB);
      return;
    default: {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colorA);
      gradient.addColorStop(1, colorB);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }
};

// Lays out `photos` (array of loaded HTMLImageElements) into a grid with
// `cols`/`rows`, drawing each with a small white polaroid-style border,
// then draws an optional caption at the top.
export const composePhotobooth = (ctx, { width, height, background, photos, cols, rows, caption }) => {
  drawBackground(ctx, width, height, background);

  const topPadding = caption ? 170 : 90;
  const sidePadding = 60;
  const bottomPadding = 60;
  const gap = 24;
  const frameBorder = 14;

  const gridWidth = width - sidePadding * 2;
  const gridHeight = height - topPadding - bottomPadding;

  const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;

  photos.forEach((img, index) => {
    if (index >= cols * rows) return;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = sidePadding + col * (cellWidth + gap);
    const y = topPadding + row * (cellHeight + gap);

    // White polaroid-style frame behind each photo
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    const innerX = x + frameBorder;
    const innerY = y + frameBorder;
    const innerW = cellWidth - frameBorder * 2;
    const innerH = cellHeight - frameBorder * 2;

    // Cover-fit each captured photo into its cell
    const imgRatio = img.width / img.height;
    const cellRatio = innerW / innerH;
    let sx, sy, sw, sh;
    if (imgRatio > cellRatio) {
      sh = img.height;
      sw = sh * cellRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / cellRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(innerX, innerY, innerW, innerH);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, innerX, innerY, innerW, innerH);
    ctx.restore();
  });

  if (caption) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#2b1810";
    ctx.font = "700 64px Poppins, sans-serif";
    ctx.translate(width / 2, 95);
    ctx.rotate(-0.03);
    ctx.fillText(caption, 0, 0);
    ctx.restore();
  }
};
