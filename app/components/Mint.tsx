"use client";

import React, { useRef, useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import ColorPallete from "./ColorPallete";
import PaintBrush from "./PaintBrush";
import Image from "next/image";

interface Users {
    username: string;
    pfp: string;
}

const Mint: React.FC<Users> = (user) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBrushSize, setShowBrushSize] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
            }

            const resizeCanvas = () => {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            };

            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);

            return () => {
                window.removeEventListener("resize", resizeCanvas);
            };
        }
    }, []);

    const getCoordinates = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            if (e.nativeEvent instanceof TouchEvent) {
                const touch = e.nativeEvent.touches[0];
                return {
                    x: (touch.clientX - rect.left) * scaleX,
                    y: (touch.clientY - rect.top) * scaleY,
                };
            } else {
                return {
                    x: (e.nativeEvent.clientX - rect.left) * scaleX,
                    y: (e.nativeEvent.clientY - rect.top) * scaleY,
                };
            }
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                setIsDrawing(true);
            }
        }
    };

    const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
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
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const image = canvas.toDataURL("image/jpeg");
            const link = document.createElement("a");
            link.href = image;
            link.download = "cool-drawing.jpeg";
            link.click();
        }
    };

    return (
        <div className="bg-gray-50 h-screen relative">
            {/* Color Picker Button */}
            <button onClick={() => setShowColorPicker(true)} className="absolute top-4 left-4">
                <ColorPallete width={50} height={50}/>
            </button>

            <div className="absolute top-4 right-4">
                <div className="flex bg-slate-500 text-white rounded-2xl flex-row justify-between items-center gap-2">
                    <Image className="rounded-l-2xl" src={user.pfp} alt={user.username} width={50} height={50} priority />
                    <p className="font-bold pr-3">{user.username}</p>
                </div>
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
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full border border-gray-300 rounded-lg cursor-crosshair"
            />

            {/* Floating Brush Button */}
            <div className="absolute top-28 left-4 flex flex-col items-start">
                <button
                    onClick={() => setShowBrushSize(!showBrushSize)}
                >
                    <PaintBrush width={50} height={50} />
                </button>
                {showBrushSize && (
                    <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
                        <div className="relative bg-white p-4 rounded-md shadow-lg">
                            <label className="text-sm font-medium">Brush Size</label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-full mt-2"
                            />
                            <span className="text-sm">{brushSize}px</span>
                            
                        <button
                            onClick={() => setShowBrushSize(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold hover:bg-red-600 transition"
                        >
                            Close
                        </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="fixed bottom-0 w-full flex justify-between shadow-md">
                <button
                    onClick={clearCanvas}
                    className="w-full py-4 bg-red-500 text-white text-2xl font-semibold hover:bg-red-600 transition"
                >
                    Clear
                </button>
                <button
                    onClick={saveDrawing}
                    className="w-full py-4 bg-slate-500 text-white text-2xl font-semibold hover:bg-slate-700 transition"
                >
                    Mint
                </button>
            </div>
        </div>
    );
};

export default Mint;
