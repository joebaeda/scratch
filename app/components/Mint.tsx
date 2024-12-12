"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { SketchPicker } from "react-color";
import ColorPallete from "./ColorPallete";
import PaintBrush from "./PaintBrush";
import Image from "next/image";
import { BaseError, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import sdk from "@farcaster/frame-sdk";
import { base } from "wagmi/chains";
import { abi } from "@/lib/contract";
import { parseEther } from "viem";
import ColorBucket from "./ColorBucket";
import Undo from "./Undo";
import Redo from "./Redo";

interface Users {
    username: string;
    pfp: string;
}

const Mint: React.FC<Users> = (user) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [tool, setTool] = useState<'brush' | 'fill'>('brush');
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [embedHash, setEmbedHash] = useState("");

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
            if ('touches' in e) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top,
                };
            } else {
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                };
            }
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                setIsDrawing(true);
                if (tool === 'brush') {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                } else if (tool === 'fill') {
                    floodFill(ctx, x, y, color);
                }
            }
        }
    };

    const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || tool !== 'brush') return;
        const { x, y } = getCoordinates(e);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        saveToHistory();
    };

    const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const targetColor = getPixel(imageData, x, y);
        const fillColorRgb = hexToRgb(fillColor);

        if (!fillColorRgb) return;

        const stack = [{ x, y }];
        while (stack.length > 0) {
            const { x, y } = stack.pop()!;
            if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) continue;

            const currentColor = getPixel(imageData, x, y);
            if (!colorsMatch(currentColor, targetColor) || colorsMatch(currentColor, fillColorRgb)) continue;

            setPixel(imageData, x, y, fillColorRgb);

            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const getPixel = (imageData: ImageData, x: number, y: number): number[] => {
        const index = (y * imageData.width + x) * 4;
        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    };

    const setPixel = (imageData: ImageData, x: number, y: number, color: number[]) => {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color[0];
        imageData.data[index + 1] = color[1];
        imageData.data[index + 2] = color[2];
        imageData.data[index + 3] = color[3];
    };

    const colorsMatch = (color1: number[], color2: number[]): boolean => {
        return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
    };

    const hexToRgb = (hex: string): number[] | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            255
        ] : null;
    };

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
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


    const saveDrawing = async () => {
        const canvas = canvasRef.current
        if (canvas) {
            // Convert canvas to data URL
            const dataURL = canvas.toDataURL('image/png');

            // Convert data URL to Blob
            const blob = await fetch(dataURL).then(res => res.blob());

            // Create FormData for Pinata upload
            const formData = new FormData();
            formData.append('file', blob, `${user.username}`);
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
                abi,
                chainId: base.id,
                address: "0x834a79FD83a7E2F4EB7025c46D46E095882E3204" as `0x${string}`,
                functionName: "mint",
                value: parseEther("0.001"),
                args: [`ipfs://${ipfsHash}`],
            });

        } else {
            console.error("Failed to upload drawing to IPFS.");
        }
    };

    const linkToWarpcast = useCallback((embedHash?: string) => {
        if (embedHash) {
            sdk.actions.openUrl(`https://warpcast.com/~/compose?text=this%20is%20really%20cool%20-%20just%20minted%20one!&embeds[]=https://gateway.pinata.cloud/ipfs/${embedHash}`);
        }
    }, []);

    return (
        <div className="bg-gray-50 h-screen relative">
            {/* Color Picker Button */}
            <button onClick={() => setShowColorPicker(true)} className="absolute top-4 left-6">
                <ColorPallete width={35} height={35} />
            </button>

            <div className="absolute top-4 right-6">
                <div className="flex bg-slate-500 text-white rounded-2xl flex-row justify-between items-center gap-2">
                    <Image className="rounded-l-2xl" src={user.pfp} alt={user.username} width={50} height={50} priority />
                    <p className="font-bold pr-3">{user.username}</p>
                </div>
            </div>


            {/* Brush size options */}
            <div className="absolute w-full bottom-14 mx-auto p-6 bg-gray-50 rounded-t-2xl">
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

            {showColorPicker && (
                <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
                    <div className="relative bg-white p-4 rounded-md shadow-lg">
                        <SketchPicker
                            color={color}
                            onChange={(newColor) => setColor(newColor.hex)}
                        />
                        <button
                            onClick={() => setShowColorPicker(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold hover:bg-red-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
            />

            {/* Floating Brush Button */}
            <div className="absolute top-28 left-6 flex flex-col items-start">
                <button
                    onClick={() => setTool("brush")}
                >
                    <PaintBrush width={35} height={35} />
                </button>
            </div>

            {/* Floating Fill, Undo, and Redo Buttons */}
            <div className="absolute flex flex-col space-y-4 top-48">
                {/* Fill Button */}
                <button
                    onClick={() => setTool('fill')}
                >
                    <ColorBucket
                        width={80}
                        height={80} />
                </button>

                {/* Undo Button */}
                <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-4">
                    <Undo
                        width={45}
                        height={45} />
                </button>

                {/* Redo Button */}
                <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-4">
                    <Redo
                        width={45}
                        height={45} />
                </button>
            </div>


            {/* Fixed Bottom Buttons */}
            <div className="fixed bottom-0 w-full flex justify-between shadow-md">
                {isConfirmed ? (
                    <>
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
                    </>
                ) : (error ? (
                    <div className="bg-red-500 p-4 text-center text-white">Error: {(error as BaseError).shortMessage || error.message}</div>
                ) : (
                    <>
                        <button
                            onClick={clearCanvas}
                            className="w-full py-4 bg-red-500 text-white text-2xl font-semibold hover:bg-red-600 transition"
                        >
                            Clear
                        </button>
                        <button
                            className="w-full py-4 bg-slate-500 text-white text-2xl font-semibold hover:bg-slate-700 transition"
                            disabled={chainId !== base.id || isPending}
                            onClick={handleMint}
                        >
                            {isPending
                                ? "Confirming..."
                                : isConfirming
                                    ? "Waiting..."
                                    : "Mint"}
                        </button>
                    </>
                ))}
            </div>
        </div>
    );
};

export default Mint;
