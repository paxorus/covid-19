function plot(covidMortalityRawData, movingAveragesData) {
	const covidMortalityData = covidMortalityRawData
		.map(row => ({
			x: row.pop_density,
			y: row.covid_deaths / row.total_pop * 100_000,
			...row
		}))
		// Cut off outliers for a closer view.
		// .filter(row => row.x < 50 && row.y < 500);
		.filter(row => row.y < 1000);

	const datasets = [
		line({
			label: "Republican States (average)",
			color: "rgb(255, 99, 132)",
			data: getMovingAverage(movingAveragesData, "R")
		}),
		line({
			label: "Republican States (lower)",
			color: "red",
			data: getLowerBound(movingAveragesData, "R")
		}),
		line({
			label: "Democratic States (average)",
			color: "rgb(99, 132, 255)",
			data: getMovingAverage(movingAveragesData, "D")
		}),
		line({
			label: "Democratic States (upper)",
			color: "red",
			data: getLowerBound(movingAveragesData, "R")
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

	const ctx = document.getElementById("myChart").getContext("2d");
	const myChart = new Chart(ctx, buildChartConfig(datasets));
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

function line({label, color, data}) {
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
					}
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