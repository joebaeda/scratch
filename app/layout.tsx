import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "./providers/Provider";

const comicSans = localFont({
  src: "./fonts/Comic-Sans-MS.ttf",
  variable: "--font-comic-sans",
  weight: "100 900",
});

const appUrl = "https://scratchnism.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/og-image.jpg`,
  button: {
    title: "Let's Scratching!",
    action: {
      type: "launch_frame",
      name: "Scratch of Art",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.svg`,
      splashBackgroundColor: "#ede4ca",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Scratch of Art",
    description: "Drawing like an artist and Mint to the base network instantly.",
    openGraph: {
      title: "Scratch of Art",
      description: "Drawing like an artist and Mint to the base network instantly.",
      url: 'https://scratchnism.vercel.app',
      type: 'website',
      images: [
        {
          url: 'https://scratchnism.vercel.app/og-image.jpg',
          width: 1200,
          height: 600,
          alt: 'Mint your Scratch',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Scratch of Art",
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
        className={`${comicSans.variable} antialiased`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
