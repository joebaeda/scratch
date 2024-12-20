import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Provider from "../providers/Provider";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const appUrl = "https://scratchnism.vercel.app/pixel";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/og-image.jpg`,
  button: {
    title: "Cast Your Pixel",
    action: {
      type: "launch_frame",
      name: "Pixel Cast",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.svg`,
      splashBackgroundColor: "#ede4ca",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pixel Cast | Everyday Pixel Cast",
    description: "Create and Mint any of your pixel art styles directly on farcaster client",
    openGraph: {
      title: "Pixel Cast | Everyday Pixel Cast",
      description: "Create and Mint any of your pixel art styles directly on farcaster client",
      url: 'https://scratchnism.vercel.app/pixel',
      type: 'website',
      images: [
        {
          url: 'https://scratchnism.vercel.app/pixel/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Pixel Cast',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Pixel Cast | Everyday Pixel Cast",
      description: "Create and Mint any of your pixel art styles directly on farcaster client",
      images: ['https://scratchnism.vercel.app/pixel/og-image.jpg'],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
