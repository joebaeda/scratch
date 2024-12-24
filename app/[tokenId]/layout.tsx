import localFont from "next/font/local";
import "../globals.css";
import Provider from "../providers/Provider";
import { Metadata } from "next";

const comicSans = localFont({
    src: "../fonts/Comic-Sans-MS.ttf",
    variable: "--font-comic-sans",
    weight: "100 900",
});

export const revalidate = 300;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tokenId: string }>
}): Promise<Metadata> {
    const { tokenId } = await params;

    try {
        // Dynamically set the og-image based on the tokenId
        const ogImageUrl = `https://scratchnism.vercel.app/api/og-image?tokenId=${tokenId}`;

        return {
            title: "Scratch of Art",
            description:
                "Drawing like an artist and Mint to the base network instantly.",
            openGraph: {
                title: `Scratch of Art | Token #${tokenId}`,
                description:
                    "Drawing like an artist and Mint to the base network instantly.",
                url: `https://scratchnism.vercel.app/${tokenId}`,
                type: "website",
                images: [
                    {
                        url: ogImageUrl, // Use the dynamically generated og-image URL
                        width: 402,
                        height: 392,
                        alt: `Scratch of Art for Token #${tokenId}`,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: `Scratch of Art | Token #${tokenId}`,
                description:
                    "Drawing like an artist and Mint to the base network instantly.",
                images: [ogImageUrl], // Use the dynamically generated og-image URL
            },
            icons: {
                icon: "/favicon.ico",
            },
            other: {
                "fc:frame": JSON.stringify({
                    version: "next",
                    imageUrl: ogImageUrl, // Use the dynamically generated og-image URL
                    button: {
                        title: "Make Offer",
                        action: {
                            type: "launch_frame",
                            name: "Scratch of Art",
                            url: `https://scratchnism.vercel.app/${tokenId}`,
                            splashImageUrl:
                                "https://scratchnism.vercel.app/splash.svg",
                            splashBackgroundColor: "#ede4ca",
                        },
                    },
                }),
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Scratch of Art',
            description: 'Failed to load token data',
        };
    }
}

export default function TokenDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${comicSans.variable} antialiased`}>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
