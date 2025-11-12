interface Photo {
  width: number;
  height: number;
}

interface LayoutItem {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface LayoutResult {
  containerHeight: number;
  boxes: LayoutItem[];
}

/**
 * Justified layout algorithm inspired by Google Photos
 * Creates rows of photos that maintain aspect ratios and fill the container width
 */
export function computeJustifiedLayout(
  photos: Photo[],
  containerWidth: number,
  targetRowHeight: number = 300,
  spacing: number = 4
): LayoutResult {
  const boxes: LayoutItem[] = [];
  let currentRow: Photo[] = [];
  let currentRowAspectRatios: number[] = [];
  let y = 0;

  photos.forEach((photo, index) => {
    const aspectRatio = photo.width / photo.height;
    currentRow.push(photo);
    currentRowAspectRatios.push(aspectRatio);

    // Calculate what the row height would be if we ended here
    const sumAspectRatios = currentRowAspectRatios.reduce((sum, ar) => sum + ar, 0);
    const rowWidth = containerWidth - spacing * (currentRow.length - 1);
    const calculatedHeight = rowWidth / sumAspectRatios;

    // Check if we should end this row
    // End if: height is close to target OR we're at the last photo OR row would be too short
    const shouldEndRow =
      calculatedHeight <= targetRowHeight ||
      index === photos.length - 1 ||
      (currentRow.length >= 5 && calculatedHeight < targetRowHeight * 1.2);

    if (shouldEndRow) {
      // Calculate actual dimensions for this row
      const finalHeight = Math.min(calculatedHeight, targetRowHeight * 1.5);
      let x = 0;

      currentRow.forEach((rowPhoto, rowIndex) => {
        const aspectRatio = currentRowAspectRatios[rowIndex];
        const width = finalHeight * aspectRatio;

        boxes.push({
          width: Math.round(width),
          height: Math.round(finalHeight),
          x: Math.round(x),
          y: Math.round(y)
        });

        x += width + spacing;
      });

      // Move to next row
      y += finalHeight + spacing;
      currentRow = [];
      currentRowAspectRatios = [];
    }
  });

  return {
    containerHeight: y - spacing,
    boxes
  };
}

/**
 * Optimized version for virtual scrolling
 * Only computes layout for visible portion
 */
export function computeVisibleLayout(
  photos: Photo[],
  containerWidth: number,
  scrollTop: number,
  viewportHeight: number,
  targetRowHeight: number = 300,
  spacing: number = 4
): { boxes: (LayoutItem & { index: number })[]; totalHeight: number } {
  // First, compute approximate row heights to determine which photos are visible
  const visibleBoxes: (LayoutItem & { index: number })[] = [];
  let y = 0;
  let index = 0;

  while (index < photos.length) {
    // Estimate photos per row
    const avgAspectRatio = 1.5;
    const estimatedPhotosPerRow = Math.floor(
      (containerWidth + spacing) / (targetRowHeight * avgAspectRatio + spacing)
    );

    const rowPhotos = photos.slice(index, index + estimatedPhotosPerRow);
    if (rowPhotos.length === 0) break;

    const sumAspectRatios = rowPhotos.reduce(
      (sum, p) => sum + p.width / p.height,
      0
    );
    const rowWidth = containerWidth - spacing * (rowPhotos.length - 1);
    const rowHeight = Math.min(
      rowWidth / sumAspectRatios,
      targetRowHeight * 1.5
    );

    // Check if this row is visible
    const rowTop = y;
    const rowBottom = y + rowHeight;
    const isVisible =
      rowBottom >= scrollTop - viewportHeight &&
      rowTop <= scrollTop + viewportHeight * 2;

    if (isVisible) {
      let x = 0;
      rowPhotos.forEach((photo, i) => {
        const aspectRatio = photo.width / photo.height;
        const width = rowHeight * aspectRatio;

        visibleBoxes.push({
          width: Math.round(width),
          height: Math.round(rowHeight),
          x: Math.round(x),
          y: Math.round(y),
          index: index + i
        });

        x += width + spacing;
      });
    }

    y += rowHeight + spacing;
    index += rowPhotos.length;
  }

  return {
    boxes: visibleBoxes,
    totalHeight: y - spacing
  };
}
