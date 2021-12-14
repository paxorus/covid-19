require("./array-monkey-patch.js");

function movingAverage({data, x, y, windowWidth, stepWidth, logarithmic, errorMargins}) {
	if (stepWidth <= 0) {
		throw new Error("Step width must be positive.");
	}
	if (stepWidth > windowWidth) {
		throw new Error("Step width must be less than or equal to window width, otherwise gaps will be left between windows.");
	}

	data.sort((row1, row2) => row1[x] - row2[x]);

	const slidingWindow = new SlidingWindow(data, x, y, windowWidth, stepWidth, logarithmic, errorMargins);
	const output = [];

	while (slidingWindow.hasNext()) {
		const aggregatedWindowOption = slidingWindow.next();
		if (aggregatedWindowOption !== null) {
			output.push(aggregatedWindowOption);
		}
	}

	return output;
}

class SlidingWindow {
	constructor(data, x, y, windowWidth, stepWidth, logarithmic, errorMargins) {
		this.data = data;
		this.x = x;
		this.y = y;
		this.startIndex = 0;
		this.width = windowWidth;// Width in terms of x-value, not in terms of # of items.
		this.logarithmic = logarithmic;
		this.stepWidth = stepWidth;
		this.errorMargins = errorMargins;

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

		const xCenter = this.windowCenter();

		const dataPoint = {
			[this.x]: xCenter,
			[this.x + "_window"]: [this.windowLeft, this.windowRight()],
			[this.y]: yAverage,
			n: dataWindow.length
		}

		if (this.errorMargins) {
			const yStdDev = dataWindow.sampleStdDev(yAverage, row => row[this.y]);
			const yStdErr = (dataWindow.length > 1) ? yStdDev / Math.sqrt(dataWindow.length) : 0;
			dataPoint[this.y + "_std_err"] = yStdErr;
			dataPoint[this.y + "_error_margins"] = [yAverage - 2 * yStdErr, yAverage + 2 * yStdErr];
		}

		return dataPoint;
	}
}

module.exports = {
	movingAverage
};