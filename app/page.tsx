"use client"

import React, { useRef, useState, useEffect, useCallback } from "react";
import { SketchPicker } from "react-color";
import FloodFill from "q-floodfill";
import Image from "next/image";
import { BaseError, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import sdk from "@farcaster/frame-sdk";
import { base } from "wagmi/chains";
import { parseEther } from "viem";

// Icon
import ColorPallete from "./icons/scratch/ColorPallete";
import PaintBrush from "./icons/scratch/PaintBrush";
import ColorBucket from "./icons/scratch/ColorBucket";
import Undo from "./icons/scratch/Undo";
import Redo from "./icons/scratch/Redo";
import ToolMenu from "./icons/scratch/ToolMenu";
import Preview from "./icons/scratch/Preview";
import Delete from "./icons/scratch/Delete";
import CloseButton from "./icons/scratch/CloseButton";
import GalleryButton from "./icons/scratch/GalleryButton";

// Components
import Gallery from "./components/scratch/Gallery";
import { scratchAbi, scratchAddress } from "@/lib/contracs/scratch";

// Farcaster
import { useViewer } from "./providers/FrameContextProvider";


export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushTool, setShowBrushTool] = useState(false);
  const [tool, setTool] = useState<'brush' | 'fill'>('brush');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [embedHash, setEmbedHash] = useState("");
  const [showTool, setShowTool] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isCastProcess, setIsCastProcess] = useState(false);
  const [isCastSuccess, setIsCastSuccess] = useState(false);

  // Farcaster
  const { fid, username, pfpUrl, url, token } = useViewer();

  const chainId = useChainId();
  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const linkToBaseScan = useCallback((hash?: string) => {
    if (hash) {
      sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Save initial blank state
        saveToHistory();
      }
    }

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          redrawCanvas();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && history.length > 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
    }
  };

  const getCoordinates = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ('touches' in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
    }
    return { x: 0, y: 0 };
  };

  const bucketFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const floodFill = new FloodFill(imageData);
    floodFill.fill(fillColor, Math.floor(x), Math.floor(y), 0);
    ctx.putImageData(floodFill.imageData, 0, 0);
  };


  const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setIsDrawing(true);
        if (tool === 'brush') {
          ctx.beginPath();
          ctx.moveTo(Math.floor(x), Math.floor(y));
        } else if (tool === 'fill') {
          bucketFill(ctx, Math.floor(x), Math.floor(y), color);
        }
      }
    }
  };

  const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    if (!isDrawing || tool !== 'brush') return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(Math.floor(x), Math.floor(y));
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Specify the willReadFrequently option
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), imageData]);
        setHistoryIndex(prevIndex => prevIndex + 1);
      }
    }
  };


  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyIndex - 1], 0, 0);
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyIndex + 1], 0, 0);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  };

  const savePreview = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setPreviewUrl(dataURL);
    }
  }

  useEffect(() => {
    if (showBrushTool) {
      setTool("brush")
    }

    if (showPreview) {
      savePreview();
    }

    if (isConfirmed) {
      setShowPreview(false)
      // Notify user
      async function notifyUser() {
        try {
          await fetch('/api/send-notify', {
            method: 'POST',
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: fid,
              notificationDetails: { url, token },
              title: `New Scratch Art by @${username}`,
              body: "One Awesome Scratch of Art has been minted on the @base Network.",
              targetUrl: "https://scratchnism.vercel.app",
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyUser();
    }

    if (isCastSuccess) {
      setShowPreview(false)
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
              title: `New Scratch Art Created!`,
              body: `One Awesome Scratch of Art by @${username} has been created.`,
              targetUrl: "https://scratchnism.vercel.app",
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyCast();
    }

  }, [isConfirmed, showPreview, showBrushTool, fid, url, token, username, isCastSuccess])

  const saveDrawing = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');

      // Convert data URL to Blob
      const blob = await fetch(dataURL).then(res => res.blob());

      // Create FormData for Pinata upload
      const formData = new FormData();
      formData.append('file', blob, `${username}-scratch`);
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
  }

  const handleMint = async () => {
    const ipfsHash = await saveDrawing();
    if (ipfsHash) {

      setEmbedHash(ipfsHash)

      writeContract({
        abi: scratchAbi,
        chainId: base.id,
        address: scratchAddress as `0x${string}`,
        functionName: "mint",
        value: parseEther("0.001"),
        args: [`ipfs://${ipfsHash}`],
      });

    } else {
      console.error("Failed to upload drawing to IPFS.");
    }
  };

  // Handle Cast
  const handleCast = async () => {
    try {
      setIsCastProcess(true)
      // Show a loading state
      console.log("Saving image to IPFS...");

      // Save the image and retrieve the IPFS hash
      const ipfsHash = await saveDrawing();

      if (ipfsHash) {
        console.log("IPFS hash received:", ipfsHash);

        // Cast proccess
        const intent = `https://warpcast.com/~/compose?text=this%20is%20really%20cool%20-%20just%20created%20one!%20Frame%20by%20@joebaeda&embeds[]=https://gateway.pinata.cloud/ipfs/${ipfsHash}%20https://scratchnism.vercel.app`;

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

  const linkToWarpcast = useCallback((embedHash?: string) => {
    if (embedHash) {
      sdk.actions.openUrl(`https://warpcast.com/~/compose?text=this%20is%20really%20cool%20-%20just%20minted%20one!&embeds[]=https://gateway.pinata.cloud/ipfs/${embedHash}`);
    }
  }, []);

  return (
    <main className="min-h-screen sm:min-h-[695px] bg-gray-50 relative">

      <div ref={wrapperRef} className="p-4 flex justify-center items-center touch-none">
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-full p-4 flex-1 flex mx-auto mt-8 items-center justify-center">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="block w-full max-w-[360px] bg-gray-200 aspect-square cursor-crosshair shadow-inner touch-none rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="absolute flex flex-row space-x-4 top-4 right-4">
        <button
          className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
          onClick={() => setShowPreview(true)}
        >
          <Preview width={34} height={34} />
        </button>
        <div className="flex bg-slate-500 text-white rounded-2xl flex-row justify-between items-center gap-2">
          <Image className="object-cover rounded-l-2xl" src={pfpUrl as string} alt={username as string} width={50} height={50} priority />
          <p className="font-bold pr-3">{username}</p>
        </div>
      </div>

      {showTool ? (
        <div className="absolute flex flex-col space-y-6 top-4 left-4">
          {/* Menu Opened */}
          <button
            onClick={() => setShowTool(false)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ToolMenu
              width={34}
              height={34} />
          </button>

          {/* Color Picker Button */}
          <button
            onClick={() => setShowColorPicker(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ColorPallete
              width={34}
              height={34} />
          </button>

          {/*Brush button */}
          <button
            onClick={() => setShowBrushTool(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
          >
            <PaintBrush
              width={34}
              height={34} />
          </button>

          {/* Fill Button */}
          <button
            onClick={() => setTool('fill')}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
          >
            <ColorBucket
              width={34}
              height={34} />
          </button>

          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <Undo
              width={34}
              height={34} />
          </button>

          {/* Redo Button */}
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <Redo
              width={34}
              height={34} />
          </button>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <Delete
              width={34}
              height={34} />
          </button>

          {/* Show Gallery Button */}
          <button
            onClick={() => setShowGallery(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <GalleryButton
              width={34}
              height={34} />
          </button>
        </div>
      ) : (
        <div className="absolute flex flex-col top-4 left-4">
          {/* Menu Closed */}
          <button
            onClick={() => setShowTool(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ToolMenu
              width={34}
              height={34} />
          </button>
        </div>
      )}

      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="flex space-y-4 flex-col bg-white p-4 rounded-md shadow-lg">
            <SketchPicker
              color={color}
              onChange={(newColor) => setColor(newColor.hex)}
            />
            <button
              onClick={() => setShowColorPicker(false)}
              className="w-full py-2 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg w-[90%] max-w-[360px] aspect-square p-4 space-y-5">
            <Image
              src={previewUrl}
              width={360}
              height={360}
              alt={`Scratch Of Art by ${username}`}
              className="object-cover border border-gray-300 rounded-2xl w-full h-full"
              priority
            />
            <div className="flex flex-row gap-2 w-full">
              <button
                onClick={() => setShowPreview(false)}
                disabled={isPending || isCastProcess}
                className="w-full py-2 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
              >
                Close
              </button>
              <button
                className="w-full py-2 rounded-2xl bg-purple-500 text-white text-2xl font-semibold hover:bg-purple-700 transition"
                disabled={chainId !== base.id || isCastProcess || isPending}
                onClick={handleMint}
              >
                {isPending
                  ? "Confirming..."
                  : isConfirming
                    ? "Waiting..."
                    : "Mint"}
              </button>
            </div>
            {/* Make a Cast */}
            <button
              disabled={isConfirming || isCastProcess || isPending}
              onClick={handleCast}
              className="w-full py-2 rounded-2xl bg-purple-500 text-white text-2xl font-semibold hover:bg-purple-700 transition"
            >
              {isCastProcess ? "Process..." : "Make a Cast"}
            </button>
          </div>
        </div>

      )}

      {showBrushTool && (
        <div className="fixed flex flex-col space-y-4 p-4 inset-0 items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="w-64 p-4 bg-gray-200 rounded-2xl">
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
              aria-label="Brush size"
            />
          </div>
          <button
            onClick={() => setShowBrushTool(false)}
            disabled={isPending}
            className="w-64 py-2 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      )}

      {showGallery && (
        <div className="fixed p-4 inset-0 z-50 overflow-hidden bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setShowGallery(false)}
              className="absolute bg-red-600 top-0 z-10 right-0 rounded-bl-xl transition"
              aria-label="Close gallery"
            >
              <CloseButton className="w-10 h-10 text-gray-200" />
            </button>
            <div className="overflow-y-auto h-full p-6">
              <Gallery />
            </div>
          </div>
        </div>
      )}


      {/* Transaction Success */}
      {isConfirmed && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg w-[90%] max-w-[360px] aspect-square p-4 space-y-5">
            <Image
              src={`https://gateway.pinata.cloud/ipfs/${embedHash}`}
              width={360}
              height={360}
              alt={`Scratch Of Art by ${username}`}
              className="object-cover border border-gray-300 rounded-2xl w-full h-full"
              priority
            />
            <div className="flex flex-row gap-2 w-full">
              <button
                className="w-full py-4 bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-600 transition"
                onClick={() => linkToBaseScan(hash)}
              >
                Proof
              </button>
              <button
                className="w-full py-4 bg-purple-500 text-white text-2xl font-semibold hover:bg-purple-600 transition"
                onClick={() => linkToWarpcast(embedHash)}
              >
                Cast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Error */}
      {error && (
        <div className="fixed bottom-0 w-full flex justify-between shadow-md">
          <div className="bg-red-500 p-4 text-center text-white">Error: {(error as BaseError).shortMessage || error.message}</div>
        </div>
      )}

    </main>
  );
};

