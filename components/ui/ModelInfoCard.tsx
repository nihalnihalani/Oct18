/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Model Information Helper Card
 */
'use client';

import React from 'react';
import { Info, Zap, Sparkles, Clock } from 'lucide-react';
import { VeoModel } from '@/types';

interface ModelInfoCardProps {
  selectedModel: VeoModel;
}

const ModelInfoCard: React.FC<ModelInfoCardProps> = ({ selectedModel }) => {
  const getModelInfo = (model: VeoModel) => {
    switch (model) {
      case VeoModel.VEO_3_1:
        return {
          quality: 'Highest',
          speed: 'Slower',
          time: '~2-3 min',
          color: 'purple',
          icon: <Sparkles className="w-4 h-4" />,
          tips: 'Best for professional work, complex scenes, and final outputs'
        };
      case VeoModel.VEO_3_1_FAST:
        return {
          quality: 'High',
          speed: 'Fast',
          time: '~1-2 min',
          color: 'green',
          icon: <Zap className="w-4 h-4" />,
          tips: 'Great for iterations, testing ideas, and quick results'
        };
      case VeoModel.VEO_3_0:
        return {
          quality: 'High',
          speed: 'Medium',
          time: '~2 min',
          color: 'blue',
          icon: <Sparkles className="w-4 h-4" />,
          tips: 'Balanced option for general use and good quality'
        };
      case VeoModel.VEO_3_0_FAST:
        return {
          quality: 'Standard',
          speed: 'Fast',
          time: '~1 min',
          color: 'green',
          icon: <Zap className="w-4 h-4" />,
          tips: 'Quick previews and drafts with decent quality'
        };
      case VeoModel.VEO_2_0:
        return {
          quality: 'Standard',
          speed: 'Medium',
          time: '~2 min',
          color: 'gray',
          icon: <Clock className="w-4 h-4" />,
          tips: 'Legacy model - use for compatibility or testing'
        };
      default:
        return {
          quality: 'Unknown',
          speed: 'Unknown',
          time: 'Unknown',
          color: 'gray',
          icon: <Info className="w-4 h-4" />,
          tips: 'Select a model from settings'
        };
    }
  };

  const info = getModelInfo(selectedModel);
  
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    gray: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[info.color as keyof typeof colorClasses]} backdrop-blur-sm`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{info.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold">Current Model</span>
            <span className="text-xs opacity-75">• Quality: {info.quality}</span>
            <span className="text-xs opacity-75">• ~{info.time}</span>
          </div>
          <p className="text-xs opacity-90">{info.tips}</p>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoCard;

