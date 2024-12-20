import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export default function Prize({ params }: { params: { slug: string } }) {
  const filePath = path.resolve(
    process.cwd(),
    "public",
    "winners",
    decodeURI(params.slug)
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }

  console.log(filePath);

  // const file = XLSX.readFile(filePath);

  // const sheetName = file.SheetNames[0];
  // const sheet = file.Sheets[sheetName];
  // const data = XLSX.utils.sheet_to_json(sheet);

  return (
    <div className=" min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {JSON.stringify({ filePath })}
    </div>
  );
}
