import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface DrawingCanvasRef {
  getImageDataUrl: () => string | null;
}

const BrushIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const EraserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const DrawingCanvas = forwardRef<DrawingCanvasRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = isErasing ? '#1f2937' : color; // bg-gray-800
        contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth, isErasing]);

  const getScaledCoordinates = (event: MouseEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getScaledCoordinates(nativeEvent);
    if (contextRef.current && point) {
        contextRef.current.beginPath();
        contextRef.current.moveTo(point.x, point.y);
        isDrawing.current = true;
    }
  };

  const stopDrawing = () => {
    if (contextRef.current) {
        contextRef.current.closePath();
        isDrawing.current = false;
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    const point = getScaledCoordinates(nativeEvent);
    if (contextRef.current && point) {
        contextRef.current.lineTo(point.x, point.y);
        contextRef.current.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  useImperativeHandle(ref, () => ({
    getImageDataUrl: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // create a temp canvas to draw a white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;
      tempCtx.fillStyle = '#111827'; // bg-gray-900
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      return tempCanvas.toDataURL('image/png');
    },
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">2. Draw A Pose</h2>
        <div className="aspect-square w-full bg-gray-900 rounded-lg overflow-hidden">
            <canvas
                ref={canvasRef}
                width="512"
                height="512"
                className="w-full h-full"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
            />
        </div>
        <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                 <button onClick={() => setIsErasing(false)} className={`p-2 rounded-md ${!isErasing ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`} aria-label="Brush tool"><BrushIcon className="w-5 h-5"/></button>
                 <button onClick={() => setIsErasing(true)} className={`p-2 rounded-md ${isErasing ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`} aria-label="Eraser tool"><EraserIcon className="w-5 h-5"/></button>
               </div>
               <input type="color" value={color} onChange={e => setColor(e.target.value)} disabled={isErasing} className="w-10 h-10 rounded-md cursor-pointer bg-gray-700 disabled:opacity-50" aria-label="Color picker"/>
               <button onClick={clearCanvas} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors">Clear</button>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="lineWidth" className="text-sm">Brush Size:</label>
                <input
                    type="range"
                    id="lineWidth"
                    min="1"
                    max="50"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    </div>
  );
});

export default DrawingCanvas;