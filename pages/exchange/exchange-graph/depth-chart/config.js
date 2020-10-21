/* eslint-disable */
import Chart from 'chart.js';
import './zoom-plugin.js';
import get from 'lodash/get'

export const colors = {
  BASE_TEXT: '#585352',
  AXIS_TOOLTIP_BORDER: '#3983fa',
  AXIS_TOOLTIP_BG: '#fff',

  BID_STROKE: '#76a519',
  BID_HIGH_LIGHT: '#83b321',
  BID_HIGH_DARK: '#83b321',
  BID_LOW_LIGHT: '#fff',
  BID_LOW_DARK: '#000',

  ASK_STROKE: '#ea7a83',
  ASK_HIGH_LIGHT: '#ff7c86',
  ASK_HIGH_DARK: '#ea0070',
  ASK_LOW_LIGHT: '#fff',
  ASK_LOW_DARK: '#000',
};

const FONT_FAMILY =
  "DINNext, IBMPlexSans, Arial, PingFangSC-Regular, 'Microsoft YaHei', sans-serif";
const FONT_SIZE = 11;
const TEXT_COLOR = '#aaaaaa';
const DEFAULT_STROKE_COLOR = '#3983fa';

function formatNumber(number, lang = 'en') {
  return number.toLocaleString(lang, { maximumSignificantDigits: 8 });
}

function drawXLabel(ctx, x, y, iw, ih, text, fillStyle, strokeColor) {
  ctx.font = `${FONT_FAMILY} ${FONT_SIZE}`;
  const info = ctx.measureText(text);
  const PADDING = 5;

  const w = info.width + 2 * PADDING;
  const h = 16;

  ctx.moveTo(x - w / 2, y);
  ctx.beginPath();
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + iw / 2, y - h);
  ctx.lineTo(x, y - h - ih);
  ctx.lineTo(x - iw / 2, y - h);
  ctx.lineTo(x - w / 2, y - h);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(text, x - w / 2 + PADDING, y - 5);
}

function drawYLabel(ctx, x, y, text, fillStyle, strokeColor) {
  ctx.font = `${FONT_FAMILY} ${FONT_SIZE}`;
  const info = ctx.measureText(text);
  const PADDING = 3;

  const w = info.width + 2 * PADDING;
  const h = 14;

  ctx.moveTo(x, y);
  ctx.beginPath();
  ctx.lineTo(x + h / 2, y + h / 2);
  ctx.lineTo(x + h / 2 + w, y + h / 2);
  ctx.lineTo(x + h / 2 + w, y - h / 2);
  ctx.lineTo(x + h / 2, y - h / 2);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeColor;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(text, x + h / 2 + PADDING, y + 3);
}

function drawPoint(ctx, x, y, radius, strokeStyle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function drawDiffRuler(ctx, askBorder, bidBorder, diffPercent, strokeColor) {
  const centerPos = (askBorder.pos + bidBorder.pos) / 2;
  ctx.font = `${FONT_FAMILY} ${FONT_SIZE}`;
  ctx.fillStyle = strokeColor;
  ctx.strokeStyle = strokeColor;

  const yOffset = 15;
  const text = `${diffPercent}%`;
  const info = ctx.measureText(text);
  const textW = info.width;

  ctx.fillText(text, centerPos - textW / 2, yOffset);

  ctx.moveTo(bidBorder.pos, yOffset + 10);
  ctx.beginPath();
  ctx.moveTo(bidBorder.pos, yOffset + 10);
  ctx.lineTo(bidBorder.pos, yOffset + 5);
  ctx.lineTo(askBorder.pos, yOffset + 5);
  ctx.lineTo(askBorder.pos, yOffset + 10);

  ctx.stroke();
}

function drawSpecials({
  tooltip,
  ctx,
  quote,
  askBorder,
  bidBorder,
  diffPercent,
  lang,
  theme,
}) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const fillStyle = theme === 'light' ? '#fff' : '#1c1c1c';

  // draw border label
  if (askBorder) {
    drawXLabel(
      ctx,
      askBorder.pos,
      ctx.canvas.height - 5,
      10,
      6,
      `${formatNumber(askBorder.value, lang)} ${quote.toUpperCase()}`,
      fillStyle,
      colors.ASK_HIGH_LIGHT,
    );
  }
  if (bidBorder) {
    drawXLabel(
      ctx,
      bidBorder.pos,
      ctx.canvas.height - 5,
      10,
      6,
      `${formatNumber(bidBorder.value, lang)} ${quote.toUpperCase()}`,
      fillStyle,
      colors.BID_HIGH_LIGHT,
    );
  }
  if (tooltip && tooltip.opacity) {
    const { x, y, xLabel, yLabel } = tooltip.dataPoints[0];

    if (x !== undefined && y !== undefined) {
      drawPoint(ctx, x, y, 2, DEFAULT_STROKE_COLOR);
    }
    if (x && xLabel) {
      drawXLabel(
        ctx,
        x,
        ctx.canvas.height - 5,
        10,
        6,
        `${formatNumber(xLabel, lang)} ${quote.toUpperCase()}`,
        fillStyle,
        DEFAULT_STROKE_COLOR,
      );
    }
    if (y !== undefined && yLabel) {
      drawYLabel(
        ctx,
        0,
        y,
        formatNumber(yLabel, lang),
        fillStyle,
        DEFAULT_STROKE_COLOR,
      );
    }
  }
  if (diffPercent !== undefined) {
    drawDiffRuler(ctx, askBorder, bidBorder, diffPercent, DEFAULT_STROKE_COLOR);
  }
}

export function moveCenterPosX({ chart, xPos }) {
  const { helpers } = Chart;

  helpers.each(chart.scales, function(scale) {
    if (scale.isHorizontal() && scale.min > 0) {
      const range = scale.max - scale.min;
      scale.options.ticks.min = xPos - range / 2;
      scale.options.ticks.max = xPos + range / 2;
    }
  });
}

export function fixScale({ chart, maxY, minX, maxX, fixX, onZoom }) {
  const { helpers } = Chart;
  let needCheck = false;

  helpers.each(chart.scales, function(scale) {
    if (scale.isHorizontal()) {
      needCheck =
        scale.options.ticks.max >= maxX && scale.options.ticks.min <= minX;

      if (fixX) {
        scale.options.ticks.max = maxX;
        scale.options.ticks.min = minX;
      }
    }
    if (needCheck && !scale.isHorizontal() && scale.max < maxY) {
      scale.options.ticks.max = maxY;
    }
  });
}

export function fixTooltipPosition({ chart }) {
 if (get(chart, 'lastTooltip.opacity')) {
    const { x } = chart?.lastTooltip.dataPoints[0];
    let index = -1;
    let diff = Number.MAX_VALUE;

    if (
      !chart.data.datasets[0]._meta[chart.id] ||
      !chart.data.datasets[1]._meta[chart.id]
    ) {
      return;
    }

    const bidDatasetMetaData = chart.data.datasets[0]._meta[chart.id].data;
    const askDatasetMetaData = chart.data.datasets[1]._meta[chart.id].data;

    bidDatasetMetaData.concat(askDatasetMetaData).forEach((v, i) => {
      if (diff === 0) {
        return;
      }
      if (diff > Math.abs(v._model.x - x)) {
        diff = Math.abs(v._model.x - x);
        index = i;
      }
    });

    if (index !== -1) {
      const metaData =
        index / 100 >= 1 ? askDatasetMetaData : bidDatasetMetaData;

      // prevent index out of range
      if (index % 100 < metaData.length) {
        chart.lastTooltip.dataPoints[0].y = metaData[index % 100]._model.y;
        chart.lastTooltip.dataPoints[0].yLabel = metaData[index % 100]._model.y;
      }
    }
  }
}

export function updateConfig({
  chart,
  quote,
  diffPercent,
  onZoom,
  lang = 'en',
  theme = 'light',
}) {
  const ctx = document.getElementById('labelLayer').getContext('2d');
  let bidBorder = null;
  let askBorder = null;
  if (
    !chart.data.datasets[0]._meta[chart.id] ||
    !chart.data.datasets[1]._meta[chart.id]
  ) {
    return;
  }

  const bidDatasetMetaData = chart.data.datasets[0]._meta[chart.id].data;
  const askDatasetMetaData = chart.data.datasets[1]._meta[chart.id].data;
  const bidDataset = chart.data.datasets[0].data;
  const askDataset = chart.data.datasets[1].data;

  if (bidDatasetMetaData.length && bidDataset.length) {
    bidBorder = {
      pos: bidDatasetMetaData[bidDatasetMetaData.length - 1]._model.x,
      value: bidDataset[bidDataset.length - 1].x,
    };
  }
  if (askDatasetMetaData.length && askDataset.length) {
    askBorder = {
      pos: askDatasetMetaData[0]._model.x,
      value: askDataset[0].x,
    };
  }
  if (bidBorder && askBorder) {
    // update zoom options
    const centerX = (askBorder.value + bidBorder.value) / 2;
    const minX =
      centerX - (askDataset[askDataset.length - 1].x - bidDataset[0].x);
    const maxX =
      centerX + (askDataset[askDataset.length - 1].x - bidDataset[0].x);
    const extraZoomOptions = {
      onZoom: ({ chart }) => {
        updateConfig({ chart, quote, diffPercent, lang, theme, onZoom });
        onZoom();
      },
      rangeMin: {
        x: minX,
        y: 0,
      },
      rangeMax: {
        x: maxX,
        y: Math.max(bidDataset[0].y, askDataset[askDataset.length - 1].y) * 1.2,
      },
    };
    chart.options.plugins.zoom.zoom = {
      ...chart.options.plugins.zoom.zoom,
      ...extraZoomOptions,
    };

    setTimeout(() => {
      fixTooltipPosition({ chart });
      drawSpecials({
        tooltip: chart.lastTooltip,
        ctx,
        quote,
        askBorder,
        bidBorder,
        diffPercent,
        lang,
        theme,
      });
    }, 0);
  }
  if (quote && lang && theme) {
    chart.options.tooltips.custom = tooltip => {
      chart.lastTooltip = tooltip;
      drawSpecials({
        tooltip,
        ctx,
        quote,
        askBorder,
        bidBorder,
        diffPercent,
        lang,
        theme,
      });
    };
  }
  if (lang) {
    chart.options.scales.xAxes[0].ticks.callback = v =>
      v !== 0 ? formatNumber(v, lang) : '';
    chart.options.scales.yAxes[0].ticks.callback = v =>
      v !== 0 ? formatNumber(v, lang) : '';
  }
}

export function createChart() {
  const chartEl = document.getElementById('depthChart');
  const ctx = chartEl.getContext('2d');

  chartEl.style.cursor = 'pointer';

  return new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Bid Dataset',
          borderColor: colors.BID_STROKE,
          borderWidth: 1,
          steppedLine: 'middle',
        },
        {
          label: 'Ask Dataset',
          borderColor: colors.ASK_STROKE,
          borderWidth: 1,
          steppedLine: 'middle',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            type: 'linear',
            gridLines: {
              drawTicks: true,
              color: '#00000020',
            },
            ticks: {
              fontSize: FONT_SIZE,
              fontFamily: FONT_FAMILY,
              fontColor: TEXT_COLOR,
              maxTicksLimit: 9,
              padding: 0,
            },
            afterFit: axis => {
              axis.paddingRight = 0;
              axis.paddingLeft = 0;
            },
            afterTickToLabelConversion(axis) {
              axis.ticks[0] = null;
              axis.ticks[axis.ticks.length - 1] = null;
              axis.ticksAsNumbers[0] = null;
              axis.ticksAsNumbers[axis.ticksAsNumbers.length - 1] = null;
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              drawTicks: true,
              color: '#00000020',
            },
            ticks: {
              mirror: true,
              z: 10,
              maxTicksLimit: 20,
              stepSize: 0.15,
              fontSize: FONT_SIZE,
              fontColor: TEXT_COLOR,
              fontFamily: FONT_FAMILY,
            },
            afterTickToLabelConversion(axis) {
              axis.ticks[0] = null;
              axis.ticks[axis.ticks.length - 1] = null;
              axis.ticksAsNumbers[0] = null;
              axis.ticksAsNumbers[axis.ticksAsNumbers.length - 1] = null;
            },
          },
        ],
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      animation: {
        duration: 0,
      },
      tooltips: {
        enabled: false,
        mode: 'nearest',
        axis: 'x',
        animationDuration: 0,
        intersect: false,
      },
      responsiveAnimationDuration: 0,
      plugins: {
        zoom: {
          zoom: {
            enabled: true,
            mode: 'xy',
            speed: 0.1,
          },
        },
      },
    },
  });
}
