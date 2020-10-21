/* eslint-disable */
import Chart from 'chart.js';
import Hammer from 'hammerjs';

const { helpers } = Chart;

// Take the zoom namespace of Chart
const zoomNS = (Chart.Zoom = Chart.Zoom || {});

// Where we store functions to handle different scale types
const zoomFunctions = (zoomNS.zoomFunctions = zoomNS.zoomFunctions || {});
const panFunctions = (zoomNS.panFunctions = zoomNS.panFunctions || {});

Chart.Zoom.defaults = Chart.defaults.global.plugins.zoom = {
  pan: {
    enabled: false,
    mode: 'xy',
    speed: 20,
    threshold: 10,
  },
  zoom: {
    enabled: false,
    mode: 'xy',
    sensitivity: 3,
    speed: 0.1,
  },
};

function resolveOptions(chart, options) {
  const deprecatedOptions = {};
  if (typeof chart.options.pan !== 'undefined') {
    deprecatedOptions.pan = chart.options.pan;
  }
  if (typeof chart.options.pan !== 'undefined') {
    deprecatedOptions.zoom = chart.options.zoom;
  }
  const props = chart.$zoom;
  options = props._options = helpers.merge({}, [options, deprecatedOptions]);

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  const node = props._node;
  const zoomEnabled = options.zoom && options.zoom.enabled;
  const dragEnabled = options.zoom.drag;
  if (zoomEnabled && !dragEnabled) {
    node.addEventListener('wheel', props._wheelHandler);
  } else {
    node.removeEventListener('wheel', props._wheelHandler);
  }
  if (zoomEnabled && dragEnabled) {
    node.addEventListener('mousedown', props._mouseDownHandler);
    node.ownerDocument.addEventListener('mouseup', props._mouseUpHandler);
  } else {
    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);
  }
}

function storeOriginalOptions(chart) {
  const originalOptions = chart.$zoom._originalOptions;
  helpers.each(chart.scales, function(scale) {
    if (!originalOptions[scale.id]) {
      originalOptions[scale.id] = helpers.clone(scale.options);
    }
  });
  helpers.each(originalOptions, function(opt, key) {
    if (!chart.scales[key]) {
      delete originalOptions[key];
    }
  });
}

/**
 * @param {string} mode can be 'x', 'y' or 'xy'
 * @param {string} dir can be 'x' or 'y'
 */
function directionEnabled(mode, dir) {
  if (mode === undefined) {
    return true;
  }
  if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1;
  }

  return false;
}

function rangeMaxLimiter(zoomPanOptions, newMax) {
  if (
    zoomPanOptions.scaleAxes &&
    zoomPanOptions.rangeMax &&
    !helpers.isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])
  ) {
    const rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
    if (newMax > rangeMax) {
      newMax = rangeMax;
    }
  }
  return newMax;
}

function rangeMinLimiter(zoomPanOptions, newMin) {
  if (
    zoomPanOptions.scaleAxes &&
    zoomPanOptions.rangeMin &&
    !helpers.isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])
  ) {
    const rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
    if (newMin < rangeMin) {
      newMin = rangeMin;
    }
  }
  return newMin;
}

function zoomCategoryScale(scale, zoom, center, zoomOptions) {
  const { labels } = scale.chart.data;
  let { minIndex } = scale;
  const lastLabelIndex = labels.length - 1;
  let { maxIndex } = scale;
  const { sensitivity } = zoomOptions;
  const chartCenter = scale.isHorizontal()
    ? scale.left + scale.width / 2
    : scale.top + scale.height / 2;
  const centerPointer = scale.isHorizontal() ? center.x : center.y;

  zoomNS.zoomCumulativeDelta =
    zoom > 1 ? zoomNS.zoomCumulativeDelta + 1 : zoomNS.zoomCumulativeDelta - 1;

  if (Math.abs(zoomNS.zoomCumulativeDelta) > sensitivity) {
    if (zoomNS.zoomCumulativeDelta < 0) {
      if (centerPointer >= chartCenter) {
        if (minIndex <= 0) {
          maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
        } else {
          minIndex = Math.max(0, minIndex - 1);
        }
      } else if (centerPointer < chartCenter) {
        if (maxIndex >= lastLabelIndex) {
          minIndex = Math.max(0, minIndex - 1);
        } else {
          maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
        }
      }
      zoomNS.zoomCumulativeDelta = 0;
    } else if (zoomNS.zoomCumulativeDelta > 0) {
      if (centerPointer >= chartCenter) {
        minIndex =
          minIndex < maxIndex
            ? (minIndex = Math.min(maxIndex, minIndex + 1))
            : minIndex;
      } else if (centerPointer < chartCenter) {
        maxIndex =
          maxIndex > minIndex
            ? (maxIndex = Math.max(minIndex, maxIndex - 1))
            : maxIndex;
      }
      zoomNS.zoomCumulativeDelta = 0;
    }
    scale.options.ticks.min = rangeMinLimiter(zoomOptions, labels[minIndex]);
    scale.options.ticks.max = rangeMaxLimiter(zoomOptions, labels[maxIndex]);
  }
}

function zoomNumericalScale(scale, zoom, center, zoomOptions) {
  const range = scale.max - scale.min;
  const newDiff = range * (zoom - 1);

  const centerPoint = scale.isHorizontal() ? center.x : center.y;
  const minPercent = (scale.getValueForPixel(centerPoint) - scale.min) / range;
  const maxPercent = 1 - minPercent;

  const minDelta = newDiff * minPercent;
  const maxDelta = newDiff * maxPercent;

  scale.options.ticks.min = rangeMinLimiter(zoomOptions, scale.min + minDelta);
  scale.options.ticks.max = rangeMaxLimiter(zoomOptions, scale.max - maxDelta);
}

function zoomTimeScale(scale, zoom, center, zoomOptions) {
  zoomNumericalScale(scale, zoom, center, zoomOptions);

  const { options } = scale;
  if (options.time) {
    if (options.time.min) {
      options.time.min = options.ticks.min;
    }
    if (options.time.max) {
      options.time.max = options.ticks.max;
    }
  }
}

function zoomScale(scale, zoom, center, zoomOptions) {
  const fn = zoomFunctions[scale.type];
  if (fn) {
    fn(scale, zoom, center, zoomOptions);
  }
}

/**
 * @param chart The chart instance
 * @param {number} percentZoomX The zoom percentage in the x direction
 * @param {number} percentZoomY The zoom percentage in the y direction
 * @param {{x: number, y: number}} focalPoint The x and y coordinates of zoom focal point. The point which doesn't change while zooming. E.g. the location of the mouse cursor when "drag: false"
 * @param {string} whichAxes `xy`, 'x', or 'y'
 * @param {number} animationDuration Duration of the animation of the redraw in milliseconds
 */
function doZoom(
  chart,
  percentZoomX,
  percentZoomY,
  _focalPoint,
  whichAxes,
  animationDuration,
) {
  let yZoomEnable = true;
  const bidData = chart.data.datasets[0].data;
  const askData = chart.data.datasets[1].data;
  const bidMeta = chart.data.datasets[0]._meta[0];
  const askMeta = chart.data.datasets[1]._meta[0];
  const ca = chart.chartArea;

  const focalPointX =
    bidMeta && askMeta
      ? (askMeta.data[0]._model.x +
          bidMeta.data[bidMeta.data.length - 1]._model.x) /
        2
      : (ca.left + ca.right) / 2;

  // if (!focalPoint) {
  const focalPoint = {
    x: focalPointX,
    y: ca.bottom,
  };
  // }

  const zoomOptions = chart.$zoom._options.zoom;

  if (zoomOptions.enabled) {
    storeOriginalOptions(chart);
    // Do the zoom here
    const zoomMode =
      typeof zoomOptions.mode === 'function'
        ? zoomOptions.mode({ chart })
        : zoomOptions.mode;

    // Which axe should be modified when figers were used.
    let _whichAxes;
    if (zoomMode === 'xy' && whichAxes !== undefined) {
      // based on fingers positions
      _whichAxes = whichAxes;
    } else {
      // no effect
      _whichAxes = 'xy';
    }

    helpers.each(chart.scales, function(scale) {
      if (
        scale.isHorizontal() &&
        directionEnabled(zoomMode, 'x') &&
        directionEnabled(_whichAxes, 'x')
      ) {
        zoomOptions.scaleAxes = 'x';
        yZoomEnable =
          askData &&
          bidData &&
          askData.length &&
          bidData.length &&
          scale.options.ticks.min >= bidData[0].x &&
          scale.options.ticks.max <= askData[askData.length - 1].x;

        zoomScale(scale, percentZoomX, focalPoint, zoomOptions);
      } else if (
        !scale.isHorizontal() &&
        directionEnabled(zoomMode, 'y') &&
        directionEnabled(_whichAxes, 'y')
      ) {
        yZoomEnable =
          yZoomEnable || scale.options.ticks.max > zoomOptions.rangeMax.y;

        if (yZoomEnable) {
          // Do Y zoom
          zoomOptions.scaleAxes = 'y';
          zoomScale(scale, percentZoomY, focalPoint, zoomOptions);
        }
      }
    });

    if (animationDuration) {
      chart.update({
        duration: animationDuration,
        easing: 'easeOutQuad',
      });
    } else {
      chart.update(0);
    }

    if (typeof zoomOptions.onZoom === 'function') {
      zoomOptions.onZoom({ chart });
    }
  }
}

function panCategoryScale(scale, delta, panOptions) {
  const { labels } = scale.chart.data;
  const lastLabelIndex = labels.length - 1;
  const offsetAmt = Math.max(scale.ticks.length, 1);
  const panSpeed = panOptions.speed;
  let { minIndex } = scale;
  const step = Math.round(scale.width / (offsetAmt * panSpeed));
  let maxIndex;

  zoomNS.panCumulativeDelta += delta;

  minIndex =
    zoomNS.panCumulativeDelta > step
      ? Math.max(0, minIndex - 1)
      : zoomNS.panCumulativeDelta < -step
      ? Math.min(lastLabelIndex - offsetAmt + 1, minIndex + 1)
      : minIndex;
  zoomNS.panCumulativeDelta =
    minIndex !== scale.minIndex ? 0 : zoomNS.panCumulativeDelta;

  maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

  scale.options.ticks.min = rangeMinLimiter(panOptions, labels[minIndex]);
  scale.options.ticks.max = rangeMaxLimiter(panOptions, labels[maxIndex]);
}

function panNumericalScale(scale, delta, panOptions) {
  const tickOpts = scale.options.ticks;
  const prevStart = scale.min;
  const prevEnd = scale.max;
  let newMin = scale.getValueForPixel(
    scale.getPixelForValue(prevStart) - delta,
  );
  let newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd) - delta);
  // The time scale returns date objects so convert to numbers. Can remove at Chart.js v3
  newMin = newMin.valueOf ? newMin.valueOf() : newMin;
  newMax = newMax.valueOf ? newMax.valueOf() : newMax;
  let rangeMin = newMin;
  let rangeMax = newMax;
  let diff;

  if (
    panOptions.scaleAxes &&
    panOptions.rangeMin &&
    !helpers.isNullOrUndef(panOptions.rangeMin[panOptions.scaleAxes])
  ) {
    rangeMin = panOptions.rangeMin[panOptions.scaleAxes];
  }
  if (
    panOptions.scaleAxes &&
    panOptions.rangeMax &&
    !helpers.isNullOrUndef(panOptions.rangeMax[panOptions.scaleAxes])
  ) {
    rangeMax = panOptions.rangeMax[panOptions.scaleAxes];
  }

  if (newMin >= rangeMin && newMax <= rangeMax) {
    tickOpts.min = newMin;
    tickOpts.max = newMax;
  } else if (newMin < rangeMin) {
    diff = prevStart - rangeMin;
    tickOpts.min = rangeMin;
    tickOpts.max = prevEnd - diff;
  } else if (newMax > rangeMax) {
    diff = rangeMax - prevEnd;
    tickOpts.max = rangeMax;
    tickOpts.min = prevStart + diff;
  }
}

function panTimeScale(scale, delta, panOptions) {
  panNumericalScale(scale, delta, panOptions);

  const { options } = scale;
  if (options.time) {
    if (options.time.min) {
      options.time.min = options.ticks.min;
    }
    if (options.time.max) {
      options.time.max = options.ticks.max;
    }
  }
}

function panScale(scale, delta, panOptions) {
  const fn = panFunctions[scale.type];
  if (fn) {
    fn(scale, delta, panOptions);
  }
}

function doPan(chartInstance, deltaX, deltaY) {
  storeOriginalOptions(chartInstance);
  const panOptions = chartInstance.$zoom._options.pan;
  if (panOptions.enabled) {
    const panMode =
      typeof panOptions.mode === 'function'
        ? panOptions.mode({ chart: chartInstance })
        : panOptions.mode;

    helpers.each(chartInstance.scales, function(scale) {
      if (
        scale.isHorizontal() &&
        directionEnabled(panMode, 'x') &&
        deltaX !== 0
      ) {
        panOptions.scaleAxes = 'x';
        panScale(scale, deltaX, panOptions);
      } else if (
        !scale.isHorizontal() &&
        directionEnabled(panMode, 'y') &&
        deltaY !== 0
      ) {
        panOptions.scaleAxes = 'y';
        panScale(scale, deltaY, panOptions);
      }
    });

    chartInstance.update(0);

    if (typeof panOptions.onPan === 'function') {
      panOptions.onPan({ chart: chartInstance });
    }
  }
}

function getXAxis(chartInstance) {
  const { scales } = chartInstance;
  const scaleIds = Object.keys(scales);
  for (let i = 0; i < scaleIds.length; i++) {
    const scale = scales[scaleIds[i]];

    if (scale.isHorizontal()) {
      return scale;
    }
  }
}

function getYAxis(chartInstance) {
  const { scales } = chartInstance;
  const scaleIds = Object.keys(scales);
  for (let i = 0; i < scaleIds.length; i++) {
    const scale = scales[scaleIds[i]];

    if (!scale.isHorizontal()) {
      return scale;
    }
  }
}

// Store these for later
zoomNS.zoomFunctions.category = zoomCategoryScale;
zoomNS.zoomFunctions.time = zoomTimeScale;
zoomNS.zoomFunctions.linear = zoomNumericalScale;
zoomNS.zoomFunctions.logarithmic = zoomNumericalScale;
zoomNS.panFunctions.category = panCategoryScale;
zoomNS.panFunctions.time = panTimeScale;
zoomNS.panFunctions.linear = panNumericalScale;
zoomNS.panFunctions.logarithmic = panNumericalScale;
// Globals for category pan and zoom
zoomNS.panCumulativeDelta = 0;
zoomNS.zoomCumulativeDelta = 0;

// Chartjs Zoom Plugin
const zoomPlugin = {
  id: 'zoom',

  afterInit(chartInstance) {
    chartInstance.resetZoom = function() {
      storeOriginalOptions(chartInstance);
      const originalOptions = chartInstance.$zoom._originalOptions;
      helpers.each(chartInstance.scales, function(scale) {
        const timeOptions = scale.options.time;
        const tickOptions = scale.options.ticks;

        if (originalOptions[scale.id]) {
          if (timeOptions) {
            timeOptions.min = originalOptions[scale.id].time.min;
            timeOptions.max = originalOptions[scale.id].time.max;
          }

          if (tickOptions) {
            tickOptions.min = originalOptions[scale.id].ticks.min;
            tickOptions.max = originalOptions[scale.id].ticks.max;
          }
        } else {
          if (timeOptions) {
            delete timeOptions.min;
            delete timeOptions.max;
          }

          if (tickOptions) {
            delete tickOptions.min;
            delete tickOptions.max;
          }
        }
      });

      chartInstance.update();
    };
  },

  beforeUpdate(chart, options) {
    resolveOptions(chart, options);
  },

  beforeInit(chartInstance, pluginOptions) {
    chartInstance.$zoom = {
      _originalOptions: {},
    };
    const node = (chartInstance.$zoom._node = chartInstance.ctx.canvas);
    resolveOptions(chartInstance, pluginOptions);

    const options = chartInstance.$zoom._options;
    const panThreshold = options.pan && options.pan.threshold;

    chartInstance.$zoom._mouseDownHandler = function(event) {
      node.addEventListener('mousemove', chartInstance.$zoom._mouseMoveHandler);
      chartInstance.$zoom._dragZoomStart = event;
    };

    chartInstance.$zoom._mouseMoveHandler = function(event) {
      if (chartInstance.$zoom._dragZoomStart) {
        chartInstance.$zoom._dragZoomEnd = event;
        chartInstance.update(0);
      }
    };

    chartInstance.$zoom._mouseUpHandler = function(event) {
      if (!chartInstance.$zoom._dragZoomStart) {
        return;
      }

      node.removeEventListener(
        'mousemove',
        chartInstance.$zoom._mouseMoveHandler,
      );

      const beginPoint = chartInstance.$zoom._dragZoomStart;

      const offsetX = beginPoint.target.getBoundingClientRect().left;
      const startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
      const endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;

      const offsetY = beginPoint.target.getBoundingClientRect().top;
      const startY = Math.min(beginPoint.clientY, event.clientY) - offsetY;
      const endY = Math.max(beginPoint.clientY, event.clientY) - offsetY;

      const dragDistanceX = endX - startX;
      const dragDistanceY = endY - startY;

      // Remove drag start and end before chart update to stop drawing selected area
      chartInstance.$zoom._dragZoomStart = null;
      chartInstance.$zoom._dragZoomEnd = null;

      if (dragDistanceX <= 0 && dragDistanceY <= 0) {
        return;
      }

      const { chartArea } = chartInstance;

      const zoomOptions = chartInstance.$zoom._options.zoom;
      const chartDistanceX = chartArea.right - chartArea.left;
      const xEnabled = directionEnabled(zoomOptions.mode, 'x');
      const zoomX =
        xEnabled && dragDistanceX
          ? 1 + (chartDistanceX - dragDistanceX) / chartDistanceX
          : 1;

      const chartDistanceY = chartArea.bottom - chartArea.top;
      const yEnabled = directionEnabled(zoomOptions.mode, 'y');
      const zoomY =
        yEnabled && dragDistanceY
          ? 1 + (chartDistanceY - dragDistanceY) / chartDistanceY
          : 1;

      doZoom(
        chartInstance,
        zoomX,
        zoomY,
        {
          x:
            (startX - chartArea.left) / (1 - dragDistanceX / chartDistanceX) +
            chartArea.left,
          y:
            (startY - chartArea.top) / (1 - dragDistanceY / chartDistanceY) +
            chartArea.top,
        },
        undefined,
        zoomOptions.drag.animationDuration,
      );

      if (typeof zoomOptions.onZoomComplete === 'function') {
        zoomOptions.onZoomComplete({ chart: chartInstance });
      }
    };

    let _scrollTimeout = null;
    chartInstance.$zoom._wheelHandler = function(event) {
      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const center = {
        x: offsetX,
        y: offsetY,
      };

      const zoomOptions = chartInstance.$zoom._options.zoom;
      let speedPercent = zoomOptions.speed;

      if (event.deltaY >= 0) {
        speedPercent = -speedPercent;
      }
      doZoom(chartInstance, 1 + speedPercent, 1 + speedPercent, center);

      clearTimeout(_scrollTimeout);
      _scrollTimeout = setTimeout(function() {
        if (typeof zoomOptions.onZoomComplete === 'function') {
          zoomOptions.onZoomComplete({ chart: chartInstance });
        }
      }, 250);

      // Prevent the event from triggering the default behavior (eg. Content scrolling).
      if (event.cancelable) {
        event.preventDefault();
      }
    };

    if (Hammer) {
      const mc = new Hammer.Manager(node);
      mc.add(new Hammer.Pinch());
      mc.add(
        new Hammer.Pan({
          threshold: panThreshold,
        }),
      );

      // Hammer reports the total scaling. We need the incremental amount
      let currentPinchScaling;
      const handlePinch = function(e) {
        const diff = (1 / currentPinchScaling) * e.scale;
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.center.x - rect.left;
        const offsetY = e.center.y - rect.top;
        const center = {
          x: offsetX,
          y: offsetY,
        };

        // fingers position difference
        const x = Math.abs(e.pointers[0].clientX - e.pointers[1].clientX);
        const y = Math.abs(e.pointers[0].clientY - e.pointers[1].clientY);

        // diagonal fingers will change both (xy) axes
        const p = x / y;
        let xy;
        if (p > 0.3 && p < 1.7) {
          xy = 'xy';
        } else if (x > y) {
          xy = 'x'; // x axis
        } else {
          xy = 'y'; // y axis
        }

        doZoom(chartInstance, diff, diff, center, xy);

        const zoomOptions = chartInstance.$zoom._options.zoom;
        if (typeof zoomOptions.onZoomComplete === 'function') {
          zoomOptions.onZoomComplete({ chart: chartInstance });
        }

        // Keep track of overall scale
        currentPinchScaling = e.scale;
      };

      mc.on('pinchstart', function() {
        currentPinchScaling = 1; // reset tracker
      });
      mc.on('pinch', handlePinch);
      mc.on('pinchend', function(e) {
        handlePinch(e);
        currentPinchScaling = null; // reset
        zoomNS.zoomCumulativeDelta = 0;
      });

      let currentDeltaX = null;
      let currentDeltaY = null;
      let panning = false;
      const handlePan = function(e) {
        if (currentDeltaX !== null && currentDeltaY !== null) {
          panning = true;
          const deltaX = e.deltaX - currentDeltaX;
          const deltaY = e.deltaY - currentDeltaY;
          currentDeltaX = e.deltaX;
          currentDeltaY = e.deltaY;
          doPan(chartInstance, deltaX, deltaY);
        }
      };

      mc.on('panstart', function(e) {
        currentDeltaX = 0;
        currentDeltaY = 0;
        handlePan(e);
      });
      mc.on('panmove', handlePan);
      mc.on('panend', function() {
        currentDeltaX = null;
        currentDeltaY = null;
        zoomNS.panCumulativeDelta = 0;
        setTimeout(function() {
          panning = false;
        }, 500);

        const panOptions = chartInstance.$zoom._options.pan;
        if (typeof panOptions.onPanComplete === 'function') {
          panOptions.onPanComplete({ chart: chartInstance });
        }
      });

      chartInstance.$zoom._ghostClickHandler = function(e) {
        if (panning && e.cancelable) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };
      node.addEventListener('click', chartInstance.$zoom._ghostClickHandler);

      chartInstance._mc = mc;
    }
  },

  beforeDatasetsDraw(chartInstance) {
    const { ctx } = chartInstance;

    if (chartInstance.$zoom._dragZoomEnd) {
      const xAxis = getXAxis(chartInstance);
      const yAxis = getYAxis(chartInstance);
      const beginPoint = chartInstance.$zoom._dragZoomStart;
      const endPoint = chartInstance.$zoom._dragZoomEnd;

      let startX = xAxis.left;
      let endX = xAxis.right;
      let startY = yAxis.top;
      let endY = yAxis.bottom;

      if (directionEnabled(chartInstance.$zoom._options.zoom.mode, 'x')) {
        const offsetX = beginPoint.target.getBoundingClientRect().left;
        startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
        endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
      }

      if (directionEnabled(chartInstance.$zoom._options.zoom.mode, 'y')) {
        const offsetY = beginPoint.target.getBoundingClientRect().top;
        startY = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
        endY = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;
      }

      const rectWidth = endX - startX;
      const rectHeight = endY - startY;
      const dragOptions = chartInstance.$zoom._options.zoom.drag;

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)';
      ctx.fillRect(startX, startY, rectWidth, rectHeight);

      if (dragOptions.borderWidth > 0) {
        ctx.lineWidth = dragOptions.borderWidth;
        ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)';
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);
      }
      ctx.restore();
    }
  },

  destroy(chartInstance) {
    if (!chartInstance.$zoom) {
      return;
    }
    const props = chartInstance.$zoom;
    const node = props._node;

    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);
    node.removeEventListener('wheel', props._wheelHandler);
    node.removeEventListener('click', props._ghostClickHandler);

    delete chartInstance.$zoom;

    const mc = chartInstance._mc;
    if (mc) {
      mc.remove('pinchstart');
      mc.remove('pinch');
      mc.remove('pinchend');
      mc.remove('panstart');
      mc.remove('pan');
      mc.remove('panend');
      mc.destroy();
    }
  },
};

Chart.plugins.register(zoomPlugin);
export default zoomPlugin;
