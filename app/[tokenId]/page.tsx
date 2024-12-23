"use client";

import { useReadContract } from "wagmi";
import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
import sdk from '@farcaster/frame-sdk';
import { useViewer } from "../providers/FrameContextProvider";
import { scratchAbi, scratchAddress } from "@/lib/contracs/scratch";
import ArrowLeft from "../icons/ArrowLeft";

const extractImageUrl = (base64Uri: string): string => {
    try {
        const json = JSON.parse(atob(base64Uri.split(",")[1]));
        return json.image || "";
    } catch (error) {
        console.error("Error parsing tokenURI:", error);
        return "";
    }
};


export default function TokenDetails({
    params,
}: {
    params: Promise<{ tokenId: string }>
}) {
    const { tokenId } = use(params)
    const [tokenURIs, setTokenURIs] = useState("");
    const { username, pfpUrl } = useViewer();

    const { data: tokenURIData } = useReadContract({
        address: scratchAddress as `0x${string}`,
        abi: scratchAbi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
    });

    const linkToOpensea = useCallback((tokenId: string) => {
        if (tokenId) {
            sdk.actions.openUrl(`https://opensea.io/assets/base/pixelCastAddress/${tokenId}`);
        }
    }, []);

    useEffect(() => {
        if (tokenURIData) {
            const uris = extractImageUrl(tokenURIData);
            setTokenURIs(uris);
        }
    }, [tokenURIData]);

    const closeFrame = () => {
        sdk.actions.close()
    };

    return (
        <main className="sm:min-h-screen min-h-[695px] bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">

            {/* Header section */}
            <div className="w-full p-4 flex flex-row justify-between items-center space-x-4">

                {/* Back */}
                <button
                    onClick={closeFrame}
                    className="disabled:opacity-50"
                >
                    <ArrowLeft className="w-12 h-12 shadow-lg rounded-full" />
                </button>

                {/* Profile */}
                <div className="flex bg-slate-500 text-white rounded-2xl flex-row justify-between items-center gap-2">
                    <Image className="object-cover rounded-l-2xl" src={pfpUrl as string} alt={username as string} width={50} height={50} priority />
                    <p className="font-bold pr-3">{username}</p>
                </div>

            </div>

            {/* Pixel art detail */}
            <div className="w-full px-4 flex flex-col justify-center items-center mx-auto max-w-[402px] space-y-5">
                {tokenURIs ? (
                    <>
                        <Image
                            src={tokenURIs.startsWith("ipfs://")
                                ? `https://gateway.pinata.cloud/ipfs/${tokenURIs.slice(7)}`
                                : tokenURIs}
                            alt={`Scratch Art ${tokenId}`}
                            width={200}
                            height={200}
                            className="w-full max-h-[392px] p-4 bg-white rounded-2xl mx-auto"
                        />


                        <button
                            className="w-full py-4 bg-[#311535] text-white text-xl rounded-2xl font-semibold hover:bg-[#522358] transition"
                            onClick={() => linkToOpensea(tokenId)}
                        >
                            Make Offer
                        </button>
                    </>
                ) : (
                    <div className="fixed inset-0 flex max-w-[300px] mx-auto justify-center items-center text-gray-500 text-center col-span-3">
                        No Scratch of art minted yet. Add your first one!
                    </div>
                )}
            </div>
        </main>
    );
}
