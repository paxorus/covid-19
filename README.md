# Covid-19 Mortality Across Counties by Population Density

## How To
1. Optional: Download the latest data (links below).
2. Reproduce the data: `node main.js`
3. Start the server locally: `node index.js`
4. Open [http://localhost:5000](http://localhost:5000).

## Datasets
### Death count by county (CDC)
> "Provisional COVID-19 Death Counts in the United States by County"

1. Visit [https://data.cdc.gov/NCHS/...](https://data.cdc.gov/NCHS/Provisional-COVID-19-Death-Counts-in-the-United-St/kn79-hsxy)
2. Click Export > CSV for Excel.

### Population and population density by county (Census Bureau)
> "Average Household Size and Population Density - County"

1. Visit [https://covid19.census.gov/datasets/...](https://covid19.census.gov/datasets/average-household-size-and-population-density-county/explore?location=4.552846%2C0.315550%2C2.00&showTable=true)
2. Click the "down from cloud" icon with the Download tooltip > Download in CSV section.

### State party affiliations
Created manually based on 2016 and 2020 presidential election maps from Wikipedia. Each state is labelled as D (Democrat), R (Republican), S (swing), or - (excluded).
* https://en.wikipedia.org/wiki/2016_United_States_presidential_election
* https://en.wikipedia.org/wiki/2020_United_States_presidential_election

For a fair comparison, we exclude the following states/territories are excluded which are not part of the US mainland and thus may not receive comparable interstate roadway travel from other US states:
* Alaska (R): AL
* Hawaii (D): HI
* Virgin Islands (non-voting): VI
* Puerto Rico (non-voting): PR