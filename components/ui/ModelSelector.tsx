import React from "react";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
}) => {
  const models = [
    "veo-3.0-generate-preview",
    "veo-3.0-fast-generate-preview",
    "veo-2.0-generate-001",
  ];

  const formatModelName = (model: string) => {
    if (model.includes("veo-3.0-fast")) return "Veo 3 - Fast";
    if (model.includes("veo-3.0")) return "Veo 3";
    if (model.includes("veo-2.0")) return "Veo 2";
    return model;
  };

  return (
    <div className="relative flex items-center">
      <select
        aria-label="Model selector"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="pl-4 pr-10 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none font-medium text-slate-700 shadow-sm hover:shadow-md transition-all"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {formatModelName(model)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 h-5 w-5 text-slate-400 pointer-events-none" />
    </div>
  );
};

export default ModelSelector;
