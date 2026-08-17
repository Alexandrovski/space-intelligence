import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"SPACE // INTELLIGENCE",description:"A Bloomberg-style intelligence dashboard for active space exploration.",openGraph:{title:"SPACE // INTELLIGENCE",description:"Humanity's active eyes and machines beyond Earth.",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
