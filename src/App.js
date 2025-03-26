import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://collab-draw-backend-1.onrender.com");

const App = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 100;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctxRef.current = ctx;

        // Listen for draw events from WebSockets
        socket.on("draw", ({ x, y, prevX, prevY }) => {
            console.log("Received draw event from WebSocket:", { x, y, prevX, prevY });
            drawOnCanvas(x, y, prevX, prevY);
        });

        return () => socket.off("draw");
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const prevX = x - 1;
        const prevY = y - 1;

        // Emit the drawing event
        socket.emit("draw", { x, y, prevX, prevY });

        // Draw locally
        drawOnCanvas(x, y, prevX, prevY);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Function to draw on canvas
    const drawOnCanvas = (x, y, prevX, prevY) => {
        if (!ctxRef.current) return;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(prevX, prevY);
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Collaborative Drawing App</h2>
            <canvas
                ref={canvasRef}
                style={{ border: "2px solid black", background: "white" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </div>
    );
};

export default App;
