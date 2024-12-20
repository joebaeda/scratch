import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "./providers/Provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const appUrl = "https://scratchnism.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/og-image.jpg`,
  button: {
    title: "Mint Your Scratch!",
    action: {
      type: "launch_frame",
      name: "Scratch",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.svg`,
      splashBackgroundColor: "#ede4ca",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Scratch | Start from Scratch",
    description: "Drawing like an artist and Mint to the base network instantly.",
    openGraph: {
      title: "Scratch | Start from Scratch",
      description: "Drawing like an artist and Mint to the base network instantly.",
      url: 'https://scratchnism.vercel.app',
      type: 'website',
      images: [
        {
          url: 'https://scratchnism.vercel.app/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Start from Scratch',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Scratch | Start from Scratch",
      description: "Drawing like an artist and Mint to the base network instantly.",
      images: ['https://scratchnism.vercel.app/og-image.jpg'],
    },
    icons: {
      icon: '/favicon.ico',
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
