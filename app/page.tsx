import fs from "fs";
import Link from "next/link";
import path from "path";

export default function Home() {
  // using fs get all the files in the /winners folder
  const files = fs.readdirSync(path.join(process.cwd(), "winners"));

  console.log(files);

  return (
    <div className=" min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {files.map((file) => (
        <Link
          href={`/prize/${file}`}
          key={file}
          className="flex items-center gap-4"
        >
          {file}
        </Link>
      ))}
    </div>
  );
}
