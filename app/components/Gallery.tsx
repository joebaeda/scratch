"use client";

import { useState, useEffect } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import Image from "next/image";
import { abi } from "@/lib/contract";

const extractImageUrl = (base64Uri: string): string => {
    try {
        const json = JSON.parse(atob(base64Uri.split(',')[1]));
        return json.image || '';
    } catch (error) {
        console.error('Error parsing tokenURI:', error);
        return '';
    }
};

const Gallery = () => {
    const [tokenURIs, setTokenURIs] = useState<string[]>([]);

    // Fetch total supply of NFTs
    const { data: totalSupply } = useReadContract({
        address: "0x834a79FD83a7E2F4EB7025c46D46E095882E3204" as `0x${string}`,
        abi,
        functionName: "totalSupply",
    });

    // Prepare contracts for batch reading
    const tokenIds = totalSupply ? Array.from({ length: Number(totalSupply) }, (_, i) => i + 1) : [];
    const contracts = tokenIds.map((tokenId) => ({
        address: "0x834a79FD83a7E2F4EB7025c46D46E095882E3204" as `0x${string}`,
        abi,
        functionName: "tokenURI",
        args: [tokenId],
    }));

    // Batch read all tokenURIs
    const { data: tokenURIData } = useReadContracts({
        contracts,
    });

    useEffect(() => {
        if (tokenURIData) {
            const uris = tokenURIData.map((result) => {
                if (result.status === 'success') {
                    const base64Uri = result.result as string;
                    return extractImageUrl(base64Uri);
                }
                return '';
            });
            setTokenURIs(uris);
        }
    }, [tokenURIData]);

    return (
        <div className="relative w-full p-4 bg-white rounded-lg shadow-lg border-4 border-dashed border-yellow-500">
            {/* NFT Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tokenURIs.length > 0 ? (
                    tokenURIs.map((uri, index) => (
                        <div
                            key={index}
                            className="p-4 bg-yellow-100 rounded-lg border border-yellow-400 text-center"
                        >
                            <Image
                                src={uri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${uri.slice(7)}` : uri}
                                alt={`Scratch Art ${index}`}
                                width={200}
                                height={200}
                                className="rounded-lg mx-auto mb-2"
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center col-span-3">
                        No scratch art minted yet. Add your first one!
                    </p>
                )}
            </div>
        </div>
    )
};

export default Gallery;

