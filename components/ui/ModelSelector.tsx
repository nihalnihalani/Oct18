/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enhanced Model Selector with Descriptions
 */
import React, { useState } from "react";
import { ChevronDown, Sparkles, Zap, Clock, Info } from "lucide-react";
import { VeoModel } from "@/types";

interface ModelInfo {
  name: string;
  displayName: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'highest';
  bestFor: string;
  icon: React.ReactNode;
}

const MODEL_INFO: Record<VeoModel, ModelInfo> = {
  [VeoModel.VEO_3_1]: {
    name: VeoModel.VEO_3_1,
    displayName: "Veo 3.1",
    description: "Latest and most advanced model with best quality",
    speed: 'slow',
    quality: 'highest',
    bestFor: "Highest quality, complex scenes, professional work",
    icon: <Sparkles className="w-4 h-4" />,
  },
  [VeoModel.VEO_3_1_FAST]: {
    name: VeoModel.VEO_3_1_FAST,
    displayName: "Veo 3.1 Fast",
    description: "Latest model optimized for speed",
    speed: 'fast',
    quality: 'high',
    bestFor: "Quick iterations, testing, rapid prototyping",
    icon: <Zap className="w-4 h-4" />,
  },
  [VeoModel.VEO_3_0]: {
    name: VeoModel.VEO_3_0,
    displayName: "Veo 3.0",
    description: "Stable version with excellent quality",
    speed: 'medium',
    quality: 'high',
    bestFor: "Balanced quality and speed, general use",
    icon: <Sparkles className="w-4 h-4" />,
  },
  [VeoModel.VEO_3_0_FAST]: {
    name: VeoModel.VEO_3_0_FAST,
    displayName: "Veo 3.0 Fast",
    description: "Faster generation with good quality",
    speed: 'fast',
    quality: 'standard',
    bestFor: "Quick generations, previews, drafts",
    icon: <Zap className="w-4 h-4" />,
  },
  [VeoModel.VEO_2_0]: {
    name: VeoModel.VEO_2_0,
    displayName: "Veo 2.0",
    description: "Legacy model (older generation)",
    speed: 'medium',
    quality: 'standard',
    bestFor: "Testing, compatibility, specific use cases",
    icon: <Clock className="w-4 h-4" />,
  },
};

interface ModelSelectorProps {
  selectedModel: VeoModel;
  setSelectedModel: (model: VeoModel) => void;
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = MODEL_INFO[selectedModel];

  if (compact) {
    // Compact version for the existing interface
    return (
      <div className="relative flex items-center">
        <select
          aria-label="Model selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as VeoModel)}
          className="pl-4 pr-10 py-3 text-sm rounded-xl border border-gray-600 bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none font-medium text-white shadow-sm hover:shadow-md transition-all hover:bg-gray-800/50"
        >
          {Object.values(VeoModel).map((model) => (
            <option key={model} value={model}>
              {MODEL_INFO[model].displayName}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  // Detailed version with descriptions
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 hover:border-purple-500 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            {currentModel.icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">
              {currentModel.displayName}
            </div>
            <div className="text-xs text-gray-400">
              {currentModel.description}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
            <div className="p-2 bg-gray-900/50 border-b border-gray-700">
              <p className="text-xs text-gray-400 px-2">Select a model based on your needs</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {Object.values(VeoModel).map((modelKey) => {
                const model = MODEL_INFO[modelKey];
                const isSelected = selectedModel === modelKey;
                
                return (
                  <button
                    key={modelKey}
                    onClick={() => {
                      setSelectedModel(modelKey);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-700/50 transition-all border-l-4 ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-purple-500/30' : 'bg-gray-700/50'
                      }`}>
                        {model.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${
                            isSelected ? 'text-purple-400' : 'text-white'
                          }`}>
                            {model.displayName}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Speed indicator */}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              model.speed === 'fast' 
                                ? 'bg-green-500/20 text-green-400' 
                                : model.speed === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {model.speed === 'fast' ? '⚡ Fast' : model.speed === 'medium' ? '⚙️ Medium' : '🐌 Slow'}
                            </span>
                            {/* Quality indicator */}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              model.quality === 'highest'
                                ? 'bg-purple-500/20 text-purple-400'
                                : model.quality === 'high'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {model.quality === 'highest' ? '⭐ Highest' : model.quality === 'high' ? '✨ High' : '📊 Standard'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {model.description}
                        </p>
                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{model.bestFor}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 bg-gray-900/50 border-t border-gray-700">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <span className="text-gray-400 font-medium">Tip:</span> Use fast variants for testing, 
                  standard for final outputs. Higher quality = longer generation time.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
