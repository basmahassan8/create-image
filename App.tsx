import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import { UploadIcon, SparklesIcon, DownloadIcon, RefreshIcon, TrashIcon } from './components/Icons';
import { ImageData, ProcessingState } from './types';
import { editImageWithGemini } from './services/geminiService';

const PROMPT_CATEGORIES = [
  {
    name: "Color & Atmosphere",
    prompts: [
      "Change colors to a cyberpunk neon palette",
      "Apply a vintage sepia filter with film grain",
      "Add a dramatic sunset lighting effect",
      "Change the lighting to a moody rainy night",
      "Convert to black and white high contrast photography"
    ]
  },
  {
    name: "Art Styles",
    prompts: [
      "Convert this to a minimalist line art sketch",
      "Transform into a detailed oil painting",
      "Style as a 1990s anime screenshot",
      "Make it look like a 16-bit pixel art game",
      "Render as a low-poly 3D model"
    ]
  },
  {
    name: "Creative Effects",
    prompts: [
      "Make the object look like it is made of translucent glass",
      "Add a futuristic holographic wireframe overlay",
      "Turn the scene into a miniature diorama tilt-shift",
      "Make it look like a sticker with a white border",
      "Apply a psychedelic glitch art effect"
    ]
  }
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg("Please select a valid image file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setOriginalImage({
            base64: e.target.result as string,
            mimeType: file.type,
            url: URL.createObjectURL(file)
          });
          setResultImage(null);
          setStatus(ProcessingState.IDLE);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setStatus(ProcessingState.LOADING);
    setErrorMsg(null);
    setResultImage(null);

    try {
      const result = await editImageWithGemini(originalImage, prompt);
      
      if (result.imageUrl) {
        setResultImage(result.imageUrl);
        setStatus(ProcessingState.SUCCESS);
      } else {
        setErrorMsg(result.text || "The model responded, but did not generate an image.");
        setStatus(ProcessingState.ERROR);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
      setStatus(ProcessingState.ERROR);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setPrompt("");
    setStatus(ProcessingState.IDLE);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `nano-banana-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        
        {/* Intro Section (only visible when no image selected) */}
        {!originalImage && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              Reimagine Your Images
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mb-10">
              Upload an image and use natural language to edit it. Whether you want to change colors, add elements, or switch styles, Nano Banana makes it simple.
            </p>
            
            <label className="group relative cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative flex items-center gap-3 px-8 py-4 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
                <UploadIcon className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold text-white">Upload Image</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*" 
                className="hidden" 
              />
            </label>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
               {['Change Colors', 'Add Filters', 'Modify Content'].map((feature) => (
                 <div key={feature} className="px-4 py-2 bg-slate-900/50 rounded border border-slate-800 text-sm font-medium text-slate-400">
                   {feature}
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Workspace Section */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Controls & Input */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col max-h-[calc(100vh-8rem)]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h3 className="font-semibold text-white">Edit Instruction</h3>
                  <button 
                    onClick={handleReset} 
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-3 h-3" /> Clear All
                  </button>
                </div>
                
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to change the image... (e.g. 'Change the blue gradient to a fiery red and orange')"
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600 flex-shrink-0"
                />

                <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {PROMPT_CATEGORIES.map((category, catIdx) => (
                    <div key={catIdx}>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900/95 backdrop-blur py-1 z-10">
                        {category.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.prompts.map((suggestion, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setPrompt(suggestion)}
                             className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 text-left hover:border-slate-500 hover:text-white"
                           >
                             {suggestion}
                           </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex-shrink-0">
                  <button
                    onClick={handleGenerate}
                    disabled={status === ProcessingState.LOADING || !prompt.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
                      status === ProcessingState.LOADING || !prompt.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:shadow-lg hover:shadow-orange-500/25'
                    }`}
                  >
                    {status === ProcessingState.LOADING ? (
                      <>
                        <RefreshIcon className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate Edit
                      </>
                    )}
                  </button>
                </div>
                
                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-200 flex-shrink-0">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Image Display */}
            <div className="lg:col-span-8 flex flex-col gap-4 order-1 lg:order-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[400px]">
                
                {/* Original Image */}
                <div className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur rounded-md text-xs font-medium text-white z-10">
                    Original
                  </div>
                  <img 
                    src={originalImage.url} 
                    alt="Original" 
                    className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-950"
                  />
                </div>

                {/* Result Image */}
                <div className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                   <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500/90 backdrop-blur rounded-md text-xs font-bold text-slate-900 z-10">
                    Result
                  </div>
                  
                  {resultImage ? (
                    <>
                      <img 
                        src={resultImage} 
                        alt="Generated Result" 
                        className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-950"
                      />
                      <button 
                        onClick={downloadImage}
                        className="absolute bottom-4 right-4 p-3 bg-white text-slate-900 rounded-full shadow-xl hover:bg-slate-200 transition-all transform hover:scale-110 z-20"
                        title="Download Image"
                      >
                        <DownloadIcon className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      {status === ProcessingState.LOADING ? (
                         <div className="flex flex-col items-center gap-3">
                           <div className="w-12 h-12 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin"></div>
                           <p className="text-sm text-slate-400 animate-pulse">Consulting Nano Banana...</p>
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <SparklesIcon className="w-12 h-12 opacity-20" />
                          <p className="text-sm">Your edited image will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;