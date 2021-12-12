require("./array-monkey-patch.js");

function movingAverage({data, x, y, windowWidth, stepWidth, logarithmic}) {
	if (stepWidth <= 0) {
		throw new Error("Step width must be positive.");
	}
	if (stepWidth > windowWidth) {
		throw new Error("Step width must be less than or equal to window width, otherwise gaps will be left between windows.");
	}

	const step = logarithmic ? (val => val * (1 + stepWidth)) : (val => val + stepWidth);
	const windowRight = logarithmic ? (val => val * (1 + windowWidth)) : (val => val + windowWidth);
	const windowCenter = logarithmic ? (val => val * (1 + windowWidth / 2)) : (val => val + windowWidth / 2);

	data.sort((row1, row2) => row1[x] - row2[x]);
	const xMin = data[0][x];
	const xMax = data[data.length - 1][x];

	const slidingWindow = new SlidingWindow(data, x, xMin, windowWidth, step, windowRight);
	const output = [];

	for (let windowLeft = xMin; windowRight(windowLeft) <= xMax; windowLeft = step(windowLeft)) {
		slidingWindow.slideTo(windowLeft);
		const dataWindow = slidingWindow.get();
		const yAverage = dataWindow.average(row => row[y]);
		const xCenter = windowCenter(windowLeft);
		output.push({
			[x]: xCenter,
			[y]: yAverage,
			[x + "_window"]: [windowLeft, windowRight(windowLeft)],
			n: dataWindow.length
		});
	}

	return output;
}

class SlidingWindow {
	constructor(data, x, xMin, width, step, windowRight) {
		this.data = data;
		this.x = x;
		this.startIndex = 0;
		this.width = width;// Width in terms of x-value, not in terms of # of items.
		this.windowRight = windowRight;

		this.endIndex = this._linearSearchEnd(step(xMin), 0);
		// console.log(width);
		// console.log(this.endIndex);
	}

	slideTo(startValue) {
		// console.log(startValue, startValue * () this.width);
		this.startIndex = this._linearSearchStart(startValue, this.startIndex);
		this.endIndex = this._linearSearchEnd(this.windowRight(startValue), this.endIndex);
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

	get() {
		// console.log(this.startIndex, this.endIndex);
		return this.data.slice(this.startIndex, this.endIndex);
	}
}

module.exports = {
	movingAverage
};