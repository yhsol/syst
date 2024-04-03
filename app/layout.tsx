import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex justify-between items-center p-5 border-b-2 border-b-black">
          <h1 className="text-xl font-bold">
            <Link href={"/"}>syst</Link>
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href={"/trading"} className="hover:text-gray-500">
                  Trading
                </Link>
              </li>
              <li>
                <Link href={"/calc"} className="hover:text-gray-500">
                  Calc
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="text-center p-4 border-t-2 border-t-black">
          © 2024 syst. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
