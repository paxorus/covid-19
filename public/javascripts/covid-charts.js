function plotOverall(covidMortalityRawData, movingAveragesData) {
	const covidMortalityData = covidMortalityRawData
		.map(row => ({
			x: row.pop_density,
			y: row.covid_deaths / row.total_pop * 100_000,
			...row
		}));

	const datasets = [
		line({
			label: "Republican States (average)",
			color: "rgb(255, 99, 132)",
			data: getMovingAverage(movingAveragesData, "R")
		}),
		line({
			label: "Democratic States (average)",
			color: "rgb(99, 132, 255)",
			data: getMovingAverage(movingAveragesData, "D")
		}),
		line({
			label: "Swing States (average)",
			color: "rgb(132, 99, 255)",
			data: getMovingAverage(movingAveragesData, "S")
		}),
		{
			type: "scatter",
			label: "Republican States",
			data: covidMortalityData.filter(row => row.party === "R"),
			backgroundColor: "rgba(255, 99, 132, 0.5)"
		}, {
			type: "scatter",
			label: "Democratic States",
			data: covidMortalityData.filter(row => row.party === "D"),
			backgroundColor: "rgba(99, 132, 255, 0.5)"
		}, {
			type: "scatter",
			label: "Swing States",
			data: covidMortalityData.filter(row => row.party === "S"),
			backgroundColor: "rgba(132, 99, 255, 0.5)"
		}
	];

	const ctx = document.getElementById("overall").getContext("2d");
	const myChart = new Chart(ctx, buildChartConfig(datasets));
}

function plotDelta(movingDeltaData) {
	const datasets = [
		lineWithPoints({
			label: "Delta (Upper Bound)",
			color: "#39F8",
			data: movingDeltaData.map(row => ({...row, x: row.pop_density, y: row.mortality_rate_error_margins[1]}))
		}),
		lineWithPoints({
			label: "Delta",
			color: "#39F8",
			data: movingDeltaData.map(row => ({...row, x: row.pop_density, y: row.mortality_rate}))
		}),
		lineWithPoints({
			label: "Delta (Lower Bound)",
			color: "#08F",
			data: movingDeltaData.map(row => ({...row, x: row.pop_density, y: row.mortality_rate_error_margins[0]}))
		}),
		line({
			label: "No difference",
			color: "red",
			thickness: 2,
			data: [[0.1, 0], [10_000, 0]]
		})
	];

	const ctx = document.getElementById("delta").getContext("2d");
	const myChart = new Chart(ctx, buildDeltaChartConfig(datasets));
}

function getMovingAverage(movingAveragesData, party) {
	return movingAveragesData.find(row => row.party === party).movingAverage
		// .filter(row => row.pop_density < 50)
		.map(row => ([row.pop_density, row.mortality_rate]));
}

function getLowerBound(movingAveragesData, party) {
	return movingAveragesData.find(row => row.party === party).movingAverage
		.map(row => ([row.pop_density, row.mortality_rate_error_margins[0]]));
}

function getUpperBound(movingAveragesData, party) {
	return movingAveragesData.find(row => row.party === party).movingAverage
		.map(row => ([row.pop_density, row.mortality_rate_error_margins[1]]));
}

function line({label, color, data, thickness}) {
	return {
		type: "line",
		label,
		data,
		elements: {
			point: {
				radius: 0
			},
			line: {
				borderColor: color,
				borderWidth: thickness || 5
			}
		}
	};
}

function lineWithPoints({label, color, data}) {
	return {
		type: "line",
		label,
		data,
		elements: {
			point: {
				radius: 3,
				backgroundColor: "#7778"
			},
			line: {
				borderColor: color,
				borderWidth: 5
			}
		}
	};
}

function buildChartConfig(datasets) {
	return {
		data: {
			datasets
		},
		options: {
			responsive: true,
			scales: {
				x: {
					title: {
						display: true,
						text: "Population Density (people per square mile)"
					},
					type: "logarithmic",
					// type: "linear",
					position: "bottom"
				},
				y: {
					title: {
						display: true,
						text: "Covid-19 Mortality Rate (deaths per 100K)"
					},
					// Cut off outliers for a closer view.
					max: 1000
				}
			},
			plugins: {
				title: {
					display: true,
					text: "Covid-19 County Mortality Rate over Population Density"
				},
				tooltip: {
					callbacks: {
						label: (context) => [
							`${context.raw.county} (${context.raw.state}):`,
							`${Math.round(context.raw.pop_density)} people per sq mi,`,
							`${Math.round(context.parsed.y)} deaths / 100K`			
						].join(" ")
					}
				}
			}
		}
	};
}

function buildDeltaChartConfig(datasets) {
	return {
		data: {
			datasets
		},
		options: {
			responsive: true,
			scales: {
				x: {
					title: {
						display: true,
						text: "Population Density (people per square mile)"
					},
					type: "logarithmic",
					// type: "linear",
					position: "bottom"
				},
				y: {
					title: {
						display: true,
						text: "Difference in Covid-19 Mortality Rates (deaths per 100K)",
					},
					// Cut off outliers for a closer view.
					min: -500,
					max: 500
				}
			},
			plugins: {
				title: {
					display: true,
					text: "Difference between Republican and Democratic Covid-19 County Mortality Rates"
				},
				tooltip: {
					callbacks: {
						label: (context) => [
							`${Math.round(context.parsed.x)} people per sq mi,`,
							`${Math.round(context.parsed.y)} more deaths / 100K, `,
							`based on ${Math.round(context.raw.n)} counties`
						].join(" ")
					}
				}
			}
		}
	};
}