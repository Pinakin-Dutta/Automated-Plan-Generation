/**
 * Generates a clean SVG string representing a plot of land with labeled dimensions.
 * @param width The width (length) of the plot.
 * @param height The height (breadth) of the plot.
 * @returns A string containing the SVG markup.
 */
export const getPlotSvg = (width: number, height: number): string => {
  // Add padding for labels to ensure they don't get cut off.
  const padding = 50;
  const viewBoxWidth = width + padding * 2;
  const viewBoxHeight = height + padding * 2;

  // Using a simple, clean style for the architectural plot.
  const svgString = `
    <svg 
      width="${viewBoxWidth}" 
      height="${viewBoxHeight}" 
      viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" 
      xmlns="http://www.w3.org/2000/svg" 
      style="background-color: white;"
    >
      <style>
        .plot-label {
          font: bold 32px sans-serif;
          fill: #333;
        }
        .plot-rect {
          stroke: black;
          stroke-width: 4;
          fill: #f4f4f2; /* Light stone color for the plot area */
        }
      </style>
      <rect 
        x="${padding}" 
        y="${padding}" 
        width="${width}" 
        height="${height}" 
        class="plot-rect" 
      />
      <text 
        x="${width / 2 + padding}" 
        y="${padding - 10}" 
        text-anchor="middle" 
        class="plot-label"
      >
        ${width} ft
      </text>
      <text 
        x="${padding - 10}" 
        y="${height / 2 + padding}" 
        text-anchor="middle" 
        transform="rotate(-90, ${padding - 10}, ${height / 2 + padding})" 
        class="plot-label"
      >
        ${height} ft
      </text>
    </svg>
  `;

  return svgString.trim();
};
