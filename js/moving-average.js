require("./array-monkey-patch.js");

function movingAverage({data, x, y, windowWidth, stepWidth, logarithmic, errorMargins}) {
	if (stepWidth <= 0) {
		throw new Error("Step width must be positive.");
	}
	if (stepWidth > windowWidth) {
		throw new Error("Step width must be less than or equal to window width, otherwise gaps will be left between windows.");
	}

	data.sort((row1, row2) => row1[x] - row2[x]);

	const slidingWindow = new SlidingWindow(data, x, windowWidth, stepWidth, logarithmic);
	const output = [];

	while (slidingWindow.hasNext()) {
		const {dataWindow, windowLeft, windowCenter, windowRight} = slidingWindow.next();

		if (dataWindow.length > 0) {
			const yAverage = dataWindow.average(row => row[y]);

			const dataPoint = {
				[x]: windowCenter,
				[x + "_window"]: [windowLeft, windowRight],
				[y]: yAverage,
				n: dataWindow.length
			}

			if (errorMargins) {
				const yStdDev = dataWindow.sampleStdDev(yAverage, row => row[y]);
				const yStdErr = (dataWindow.length > 1) ? yStdDev / Math.sqrt(dataWindow.length) : 0;
				dataPoint[y + "_std_err"] = yStdErr;
				dataPoint[y + "_error_margins"] = [yAverage - 2 * yStdErr, yAverage + 2 * yStdErr];
			}

			output.push(dataPoint);
		}
	}

	return output;
}

function movingDelta() {

}

class SlidingWindow {
	constructor(data, x, windowWidth, stepWidth, logarithmic) {
		this.data = data;
		this.x = x;
		this.startIndex = 0;
		this.windowWidth = windowWidth;// Width in terms of x-value, not in terms of # of items.
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
		return this.logarithmic ? (this.windowLeft * (1 + this.windowWidth)) : (this.windowLeft + this.windowWidth);
	}

	windowCenter() {
		return this.logarithmic ? (this.windowLeft * (1 + this.windowWidth / 2)) : (this.windowLeft + this.windowWidth / 2);
	}

	step(val) {
		return this.logarithmic ? (val * (1 + this.stepWidth)) : (val + this.stepWidth);
	}

	next() {
		this.slide();

		const result = {
			dataWindow: this.getWindow(),
			windowLeft: this.windowLeft,
			windowCenter: this.windowCenter(),
			windowRight: this.windowRight()
		};

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
}

module.exports = {
	movingAverage
};