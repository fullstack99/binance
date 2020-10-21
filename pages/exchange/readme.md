## Trading Documentation

### Orderbook

1) Data is grouped by decimal amount, and it is done by `getPartData` in `components/orderbook/index.js`

What `getPartData` do:  

- iterate source data, get fixed decimal part of each `value`.
- calculate sum of group which is made of entries ending `1 ~ 0`. 
  Ex: 0.00002341 ~ 0.00002350
- border values are emphasized.

2) Volume decimal amount calculation is done in `pages/exchange/index.js` line:294.

It gets decimal length of last trade value, and this will be used for all occurances in exchange page.

3) Background bar calculation is done in `getPartData` in `components/orderbook/index.js` line:145

It calculates percent by median price * 50 (to prevent relatively small volumes background disappears).

4) How to determine ask and bid group in orderbook?

It splits asks and bids dataset with last trade value, which means it will not show bids that is higher than last trade value, and asks that is lower than last trade value.

### Chart

1) What is the data shown on depth chart?

It is closest 100 bids and 100 asks to border value.

2) How is extra drawing(gap indicator, hover labels, x/y labels) working?

There is a special canvas on top of current depth chart.  
Depth chart meta data (for actual x/y location on canvas) is available after dataset is set to chart instance.  
Currently hovering sync (binding chart hover action to extra canvas added manually) is done in `pages/exchange/exchange-graph/depth-chart/config.js` line: 274.  
It is triggered with relative meta data.

- `fixTooltipPosition` is used to sync tooltip position when data is updated in real time.
- `updateConfig` is used to update dynamic functions like zoom, tooltip, etc.

3) How is zoom on depth chart working?

Zoom is done in `pages/exchange/exchange-graph/depth-chart/zoom-plugin.js`  
Basically it is done by setting `scale.min` and `scale.max`, function used here is at line: 150 - `zoomNumericalScale`

- `moveCenterPosX` in `config.js` is used to correct current chart center position.
- `fixScale` in `config.js` is used to correct zoom scale when changing symbols.