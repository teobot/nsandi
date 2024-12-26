import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx/xlsx";

interface PrizeData {
  _id: string;
  prizeValue: number;
  bondNumber: string;
  totalVOfHolding: number;
  area: string;
  valOfBond: number;
  DateOfPurchase: Date;
}

// function to format currency
const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
});

function excelDateToJSDate(excelSerialDate: number) {
  // Excel dates are based on Jan 1, 1900, but Excel erroneously includes Feb 29, 1900.
  // JavaScript dates start from Jan 1, 1970 (Unix epoch).
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 is Excel's "0" date
  const jsDate = new Date(
    excelEpoch.getTime() + excelSerialDate * 24 * 60 * 60 * 1000
  );
  return jsDate;
}

export default async function Prize({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const filePath = path.resolve(process.cwd(), "winners", decodeURI(slug));

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }

  const file = XLSX.readFile(filePath);

  const sheet = file.Sheets[file.SheetNames[0]];

  const data = XLSX.utils
    .sheet_to_json(sheet)
    .map((row: object) => {
      const keys = Object.keys(row);
      return {
        _id: randomUUID(),
        prizeValue: Number(row[keys[0]]),
        bondNumber: row[keys[1]],
        totalVOfHolding: Number(row[keys[2]]),
        area: row[keys[3]],
        valOfBond: Number(row[keys[4]]),
        DateOfPurchase: excelDateToJSDate(Number(row[keys[5]])),
      } as PrizeData;
    })
    .filter(
      (row: PrizeData) =>
        !isNaN(row.prizeValue) &&
        !isNaN(row.totalVOfHolding) &&
        !isNaN(row.valOfBond) &&
        !isNaN(row.DateOfPurchase)
    );

  const totalMoneyWon = data.reduce(
    (acc: number, row: PrizeData) => acc + row.prizeValue,
    0
  );

  const mostCommonLocations = data.reduce(
    (acc: Record<string, number>, row) => {
      if (acc[row.area]) {
        acc[row.area]++;
      } else {
        acc[row.area] = 1;
      }
      return acc;
    },
    {}
  );

  const Card = ({ children }: { children: React.ReactNode }) => {
    return <div className="bg-slate-100 p-8 rounded-lg">{children}</div>;
  };

  // for each prize value, find the record that has the lowest value of holding
  const lowestValueOfHolding = data.reduce(
    (acc: Record<number, PrizeData>, row: PrizeData) => {
      if (
        !acc[row.prizeValue] ||
        acc[row.prizeValue].totalVOfHolding > row.totalVOfHolding
      ) {
        acc[row.prizeValue] = row;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="grid grid-cols-2 grid-rows-1 w-full gap-8 mb-4">
        <Card>
          <h1 className="text-lg">Total Money Won</h1>
          <h1 className="text-5xl font-bold">
            {formatter.format(totalMoneyWon)}
          </h1>
        </Card>
        <Card>
          <h1 className="text-lg">Top Locations</h1>
          <div className="text-2xl font-bold">
            <ol>
              {Object.keys(mostCommonLocations)
                .sort((a, b) => mostCommonLocations[b] - mostCommonLocations[a])
                .slice(0, 3)
                .map((location, index) => (
                  <li key={location}>
                    {index + 1}. {location} ({mostCommonLocations[location]})
                  </li>
                ))}
            </ol>
          </div>
        </Card>
      </div>

      <div className="divide-y border my-4">
        {Object.keys(lowestValueOfHolding).map((prizeValue) => (
          <div key={prizeValue} className="bg-white p-2">
            <h2 className="text-xl font-bold text-gray-800">
              Lowest Value of Holding for Prize Value:{" "}
              {formatter.format(Number(prizeValue))}
            </h2>
            <p className="text-gray-600">
              {lowestValueOfHolding[Number(prizeValue)].bondNumber} |{" "}
              {formatter.format(
                lowestValueOfHolding[Number(prizeValue)].totalVOfHolding
              )}{" "}
              | {lowestValueOfHolding[Number(prizeValue)].area} |{" "}
              {formatter.format(
                lowestValueOfHolding[Number(prizeValue)].valOfBond
              )}{" "}
              |{" "}
              {lowestValueOfHolding[
                Number(prizeValue)
              ].DateOfPurchase.toDateString()}
            </p>
          </div>
        ))}
      </div>

      <div className="divide-y border">
        {data.map((row: PrizeData) => (
          <div key={row._id} className="bg-white p-2">
            <h2 className="text-xl font-bold text-gray-800">
              Prize Value: {formatter.format(row.prizeValue)}
            </h2>
            <p className="text-gray-600">
              {row.bondNumber} | {formatter.format(row.totalVOfHolding)} |{" "}
              {row.area} | {formatter.format(row.valOfBond)} |{" "}
              {row.DateOfPurchase.toDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
