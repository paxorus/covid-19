require("./js/array-monkey-patch.js");
const {readCsv} = require("./js/csv-io.js");
const {movingAverage} = require("./js/moving-average.js");

const populationByCounty = readCsv("data/input/Average_Household_Size_and_Population_Density_-_County.csv")
	.map(({GEOID, NAME, State, B01001_001E, B01001_calc_PopDensity}) => ({
		fips_code: parseInt(GEOID, 10),
		county: NAME,
		state: State,
		total_pop: B01001_001E,
		pop_density: parseFloat(B01001_calc_PopDensity, 10)
	}));

populationByCounty.writeCsv("data/intermediate/population-by-county.csv");

const covidDeathsByCounty = readCsv("data/input/Provisional_COVID-19_Death_Counts_in_the_United_States_by_County.csv")
	.map(row => ({
		fips_code: parseInt(row["FIPS County Code"], 10),
		county: row["County name"],
		state_code: row["State"],
		// An empty cell indicates a value between 1-9 has been "suppressed in accordance with NCHS confidentiality standards."
		// These tend to be red states, so leniently assume the worst case, 9 deaths.
		covid_deaths: row["Deaths involving COVID-19"].replace(",", "") || 9
	}));

covidDeathsByCounty.writeCsv("data/intermediate/covid-deaths-by-county.csv");

const stateToParty = readCsv("data/input/state-to-party.csv");

const mortalityRateAndPopDensityByCounty = populationByCounty
	.innerJoin(covidDeathsByCounty, ["fips_code"], ["fips_code"])
	.innerJoin(stateToParty, ["state_code"], ["state_code"])
	.map(inputRow => {
		const row = {
			...inputRow,
			mortality_rate: inputRow.covid_deaths * 100_000 / inputRow.total_pop
		};
		delete row.fips_code;
		delete row.state_code;
		return row;
	});

mortalityRateAndPopDensityByCounty.writeCsv("data/output/mortality-vs-pop-density.csv");
console.log("Wrote data/output/mortality-vs-pop-density.csv");

const countyStatsByParty = mortalityRateAndPopDensityByCounty
	.groupBy(row => row.party)
	.filter(([party, countyStats]) => party !== "-")
	.map(([party, countyStats]) => ({
		party,
		movingAverage: movingAverage({
			data: countyStats,
			x: "pop_density",
			y: "mortality_rate",
			// windowWidth: 5,
			// stepWidth: 1,
			// logarithmic: false,
			windowWidth: 0.5,
			stepWidth: 0.1,
			logarithmic: true,
			errorMargins: false
		})
	}))
	.writeJson("data/output/mortality-vs-pop-density-trendlines.json");
console.log("Wrote data/output/mortality-vs-pop-density-trendlines.json");