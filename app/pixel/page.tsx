'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/image";
import { useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import sdk from '@farcaster/frame-sdk';
import { pixelCastAbi, pixelCastAddress } from '@/lib/contracs/pixel';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';
import { SketchPicker } from 'react-color';
import { Palette, Trash2 } from 'lucide-react';

// Icons
import BaseButton from '../icons/pixel/BaseButton';
import CastButton from '../icons/pixel/CastButton';

// Components
import Transaction from '../components/pixel/Transactions';
import PixelGrid from '../components/pixel/PixelGrid';

// Farcaster
import { useViewer } from '../providers/FrameContextProvider';

export default function Home() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [embedHash, setEmbedHash] = useState("");
  const { fid, username, pfpUrl, url, token } = useViewer();
  const [isCastProcess, setIsCastProcess] = useState(false);
  const [isCastSuccess, setIsCastSuccess] = useState(false);

  // Wagmi
  const chainId = useChainId();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Basescan
  const linkToBaseScan = useCallback((hash?: string) => {
    if (hash) {
      sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
    }
  }, []);

  // Warpcast
  const linkToWarpcast = useCallback((ipfs?: string) => {
    if (ipfs) {
      sdk.actions.openUrl(`https://warpcast.com/~/compose?text=this%20is%20really%20cool%20-%20just%20minted%20one!&embeds[]=https://gateway.pinata.cloud/ipfs/${ipfs}`);
    }
  }, []);

  // Create Notifications
  useEffect(() => {
    if (isConfirmed) {
      // Notify user
      async function notifyUser() {
        try {
          await fetch('/api/send-notify', {
            method: 'POST',
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: fid,
              notificationDetails: {url,token},
              title: `New Pixel Art Minted! by ${username}`,
              body: "One Awesome Pixel Art has been minted!",
              targetUrl: "https://scratchnism.vercel.app/pixel",
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyUser();
    }

    if (isCastSuccess) {
      // Notify user
      async function notifyCast() {
        try {
          await fetch('/api/send-notify', {
            method: 'POST',
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: fid,
              notificationDetails: { url, token },
              title: `New Pixel Art Created!`,
              body: `One Awesome Pixel of Art by @${username} has been created.`,
              targetUrl: "https://scratchnism.vercel.app/pixel",
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyCast();
    }

  }, [fid, isCastSuccess, isConfirmed, token, url, username])

  // Load saved art on mount
  useEffect(() => {
    const savedArt = localStorage.getItem('pixelArt');
    if (savedArt && canvasRef.current) {
      const imgElement = new window.Image(); // Avoid conflict by explicitly using window.Image
      imgElement.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.drawImage(imgElement, 0, 0);
      };
      imgElement.src = savedArt;
    }
  }, []);

  // Save image to IPFS
  const handleSaveImage = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');

      // Convert data URL to Blob
      const blob = await fetch(dataURL).then(res => res.blob());

      // Create FormData for Pinata upload
      const formData = new FormData();
      formData.append('file', blob, `${username}-pixel`);
      try {

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          return data.ipfsHash; // Set the IPFS hash on success
        } else {
          console.log({ message: 'Something went wrong', type: 'error' });
        }
      } catch (err) {
        console.log({ message: 'Error uploading file', type: 'error', error: err });
      }
    }
  };

  // Handle Color
  const handleColorChange = (color: string) => setSelectedColor(color);

  // Handle Mint
  const handleMint = async () => {
    try {
      setIsCastProcess(true)
      // Show a loading state
      console.log("Saving image to IPFS...");

      // Save the image and retrieve the IPFS hash
      const ipfsHash = await handleSaveImage();

      if (ipfsHash) {
        console.log("IPFS hash received:", ipfsHash);
        setEmbedHash(ipfsHash)

        writeContract({
          abi: pixelCastAbi,
          chainId: base.id,
          address: pixelCastAddress as `0x${string}`,
          functionName: "mint",
          value: parseEther("0.001"),
          args: [`ipfs://${ipfsHash}`],
        });

        setIsCastProcess(false)

      } else {
        console.error("Failed to upload drawing to IPFS.");
      }
    } catch (error) {
      console.error("Error during the cast process:", error);
    }
  };

  // Handle Cast
  const handleCast = async () => {
    try {
      setIsCastProcess(true)
      // Show a loading state
      console.log("Saving image to IPFS...");

      // Save the image and retrieve the IPFS hash
      const ipfsHash = await handleSaveImage();

      if (ipfsHash) {
        console.log("IPFS hash received:", ipfsHash);

        // Cast proccess
        const intent = `https://warpcast.com/~/compose?text=this%20is%20really%20cool%20-%20just%20created%20one!%20Frame%20by%20@joebaeda&embeds[]=https://gateway.pinata.cloud/ipfs/${ipfsHash}%20https://scratchnism.vercel.app/pixel`;
        
        await sdk.actions.openUrl(intent);

        setIsCastProcess(false)

      } else {
        console.error("Failed to upload drawing to IPFS.");
      }
    } catch (error) {
      console.error("Error during the cast process:", error);
    } finally {
      setIsCastProcess(false)
      setIsCastSuccess(true)
    }
  };

  // Clear canvas
  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      localStorage.removeItem('pixelArt');
    }
  };


  return (
    <main className="min-h-[695px] sm:min-h-screen bg-gray-50 relative">

      {/* Header Section */}
      <div className="w-full bg-[#4f2d61] p-3 rounded-b-2xl flex flex-row justify-between">


        <div className="flex flex-row space-x-4">
          {/* Delete Pixel */}
          <button
            disabled={isConfirming || isPending}
            onClick={handleClearCanvas}
            className="disabled:opacity-50"
          >
            <Trash2 className="w-10 h-10 text-gray-200" />
          </button>
        </div>

        {/* Color picker & Profile */}
        <div className="flex flex-row space-x-4">
          <button
            disabled={isConfirming || isPending}
            onClick={() => setShowColorPicker(true)}
            className="disabled:opacity-50"
          >
            <Palette className="w-10 h-10 text-gray-200" />
          </button>
          <div className="flex text-white flex-row justify-between items-center gap-2">
            <Image className="w-10 h-10 object-cover rounded-full" src={pfpUrl as string} alt={username as string} width={50} height={50} priority />
            <p className="font-bold">{username}</p>
          </div>
        </div>

      </div>

      {/* Canvas Section */}
      <div className="w-full p-4 flex-1 flex mx-auto mt-8 items-center justify-center">

        {/* Canvas */}
        <PixelGrid
          gridSize={{ width: 48, height: 48 }}
          selectedColor={selectedColor}
          canvasRef={canvasRef}
        />

      </div>

      {/* Cast & Mint Buttons Section */}
      <div className="w-full sm:p-0 p-4 my-4 sm:max-w-[384px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

        {/* Mint Pixel Cast */}
        <button
          disabled={chainId !== base.id || isCastProcess || isConfirming || isPending}
          onClick={handleMint}
          className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-gradient-to-r from-[#2f1b3a] to-[#4f2d61] shadow-lg flex flex-row sm:justify-start justify-center items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <BaseButton className="w-8 h-8" />
          <p className="text-white text-lg font-semibold">
            {isPending ? "Confirming..." : isConfirming ? "Waiting..." : "Mint"}
          </p>
        </button>

        {/* Make a Cast */}
        <button
          disabled={isConfirming || isPending}
          onClick={handleCast}
          className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-gradient-to-r from-[#4f2d61] to-[#30173d] shadow-lg flex flex-row sm:justify-start justify-center items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <CastButton className="w-8 h-8" />
          <p className="text-white text-lg font-semibold">
            {isCastProcess ? "Process..." : "Cast"}
          </p>
        </button>

      </div>

      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="flex flex-col space-y-4 bg-white p-4 rounded-md shadow-lg">
            <SketchPicker
              color={selectedColor}
              onChange={(color) => handleColorChange(color.hex)}
            />
            <button
              onClick={() => setShowColorPicker(false)}
              className="w-full py-2 rounded-2xl bg-gradient-to-r from-[#4f2d61] to-[#2f1b3a] text-white text-2xl font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Transaction Success */}
      {isConfirmed && (
        <Transaction ipfs={embedHash} username={username as string} hash={hash as string} linkToBaseScan={(hash) => linkToBaseScan(hash)} linkToWarpcast={(embedHash) => linkToWarpcast(embedHash)} />
      )}

    </main>

  );
};