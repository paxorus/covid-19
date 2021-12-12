require("./array-monkey-patch.js");
const {readCsv} = require("./csv-io.js");

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
		covid_deaths: row["Deaths involving COVID-19"].replace(",", "")
	}));

covidDeathsByCounty.writeCsv("data/intermediate/covid-deaths-by-county.csv");

const stateToParty = readCsv("data/input/state-to-party.csv");

const mortalityRateAndPopDensityByCounty = populationByCounty
	.innerJoin(covidDeathsByCounty, ["fips_code"], ["fips_code"])
	.innerJoin(stateToParty, ["state_code"], ["state_code"]);

mortalityRateAndPopDensityByCounty.writeCsv("data/output/mortality-vs-pop-density.csv");