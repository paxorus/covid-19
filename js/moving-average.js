require("./array-monkey-patch.js");

function movingAverage({data, x, y, windowWidth, stepWidth, logarithmic}) {
	if (stepWidth <= 0) {
		throw new Error("Step width must be positive.");
	}
	if (stepWidth > windowWidth) {
		throw new Error("Step width must be less than or equal to window width, otherwise gaps will be left between windows.");
	}

	data.sort((row1, row2) => row1[x] - row2[x]);

	const slidingWindow = new SlidingWindow(data, x, y, windowWidth, stepWidth, logarithmic);
	const output = [];

	while (slidingWindow.hasNext()) {
		const aggregatedWindowOption = slidingWindow.next();
		if (aggregatedWindowOption !== null) {
			output.push(aggregatedWindowOption);
		}
	}

	return output;
}

function percentile(list, P) {
	return list[Math.min(list.length - 1, Math.max(0, Math.round(P / 100 * list.length)))];
}

class SlidingWindow {
	constructor(data, x, y, windowWidth, stepWidth, logarithmic) {
		this.data = data;
		this.x = x;
		this.y = y;
		this.startIndex = 0;
		this.width = windowWidth;// Width in terms of x-value, not in terms of # of items.
		this.logarithmic = logarithmic;
		this.stepWidth = stepWidth;

		const xMin = data[0][x];
		this.windowLeft = xMin;
		this.endIndex = this._linearSearchEnd(this.step(xMin), 0);
	}

	slide() {
		this.startIndex = this._linearSearchStart(this.windowLeft, this.startIndex);
		this.endIndex = this._linearSearchEnd(this.windowRight(), this.endIndex);
	}

	_linearSearchStart(targetValue, startIndex) {
		let i;
		// Stop when x >= targetValue
		for (i = startIndex; i < this.data.length && this.data[i][this.x] < targetValue; i ++) {}
		return i;
	}

	_linearSearchEnd(targetValue, startIndex) {
		let i;
		// Stop when x > targetValue
		for (i = startIndex; i < this.data.length && this.data[i][this.x] <= targetValue; i ++) {}
		return i;
	}

	getWindow() {
		return this.data.slice(this.startIndex, this.endIndex);
	}

	windowRight() {
		return this.logarithmic ? (this.windowLeft * (1 + this.width)) : (this.windowLeft + this.width);
	}

	windowCenter() {
		return this.logarithmic ? (this.windowLeft * (1 + this.width / 2)) : (this.windowLeft + this.width / 2);
	}

	step(val) {
		return this.logarithmic ? (val * (1 + this.stepWidth)) : (val + this.stepWidth);
	}

	next() {
		this.slide();
		const result = this.aggregateWindow();
		this.advance();
		return result;
	}

	advance() {
		this.windowLeft = this.step(this.windowLeft);
	}

	hasNext() {
		const xMax = this.data[this.data.length - 1][this.x];
		return this.windowRight() <= xMax;
	}

	aggregateWindow() {
		const dataWindow = this.getWindow();

		if (dataWindow.length === 0) {
			return null;
		}
		const yAverage = dataWindow.average(row => row[this.y]);
		const yStdDev = dataWindow.popStdDev(yAverage, row => row[this.y]);
		const yStdErr = (dataWindow.length > 1) ? yStdDev / Math.sqrt(dataWindow.length - 1) : 0;
		// dataWindow.sort((a, b) => a[this.y] - b[this.y]);
		// const yMedian = percentile(dataWindow, 50)[this.y];
		// const yLower = percentile(dataWindow, 2.5)[this.y];
		// const yUpper = percentile(dataWindow, 97.5)[this.y];

		const xCenter = this.windowCenter();

		return {
			[this.x]: xCenter,
			[this.x + "_window"]: [this.windowLeft, this.windowRight()],
			[this.y]: yAverage,
			[this.y + "_error_margins"]: [yAverage - 2 * yStdErr, yAverage + 2 * yStdErr],
			// [this.y]: yMedian,
			// [this.y + "_error_margins"]: [yLower, yUpper],
			n: dataWindow.length
		};
	}
}

module.exports = {
	movingAverage
};