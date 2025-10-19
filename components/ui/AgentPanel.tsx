'use client'

import { useEffect, useState } from 'react'
import { Bot, Sparkles, TrendingUp, CheckCircle, XCircle, Loader2, Settings } from 'lucide-react'
import { getAgentCoordinator, type AgentTask, type CoordinatorConfig } from '@/lib/fetchai/agentCoordinator'

interface AgentPanelProps {
  onOptimizePrompt?: (optimized: string) => void
  currentPrompt?: string
}

export default function AgentPanel({ onOptimizePrompt, currentPrompt }: AgentPanelProps) {
  const [config, setConfig] = useState<CoordinatorConfig>({
    autoOptimize: true,
    autoAnalyze: true,
    enableTrends: true,
    enableWorkflows: false,
  })
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const coordinator = getAgentCoordinator(config)

  useEffect(() => {
    // Update active tasks periodically
    const interval = setInterval(() => {
      const tasks = coordinator.getActiveTasks()
      setActiveTasks(tasks)
    }, 1000)

    return () => clearInterval(interval)
  }, [coordinator])

  const handleOptimizePrompt = async () => {
    if (!currentPrompt) return

    setIsOptimizing(true)
    try {
      const result = await coordinator.processContentGeneration({
        prompt: currentPrompt,
        contentType: 'video',
        model: 'veo-3.0',
      })

      if (result.optimized && onOptimizePrompt) {
        onOptimizePrompt(result.prompt)
      }

      if (result.suggestions.length > 0) {
        setSuggestions(result.suggestions.map(s => s.suggestion))
      }
    } catch (error) {
      console.error('Error optimizing prompt:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGetTrends = async () => {
    try {
      const trends = await coordinator.getTrendingSuggestions()
      setSuggestions(trends)
    } catch (error) {
      console.error('Error getting trends:', error)
    }
  }

  const toggleConfig = (key: keyof CoordinatorConfig) => {
    const newConfig = { ...config, [key]: !config[key] }
    setConfig(newConfig)
    coordinator.updateConfig(newConfig)
  }

  return (
    <div className="fixed right-4 top-20 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl z-30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Agents</h3>
            <p className="text-gray-400 text-xs">
              {activeTasks.length} active
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-700 space-y-3">
          <h4 className="text-white text-xs font-semibold uppercase">Agent Settings</h4>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300 text-sm">Auto-Optimize</span>
            <input
              type="checkbox"
              checked={config.autoOptimize}
              onChange={() => toggleConfig('autoOptimize')}
              className="w-4 h-4 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300 text-sm">Auto-Analyze</span>
            <input
              type="checkbox"
              checked={config.autoAnalyze}
              onChange={() => toggleConfig('autoAnalyze')}
              className="w-4 h-4 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300 text-sm">Trend Suggestions</span>
            <input
              type="checkbox"
              checked={config.enableTrends}
              onChange={() => toggleConfig('enableTrends')}
              className="w-4 h-4 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300 text-sm">Workflows</span>
            <input
              type="checkbox"
              checked={config.enableWorkflows}
              onChange={() => toggleConfig('enableWorkflows')}
              className="w-4 h-4 rounded"
            />
          </label>
        </div>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="p-4 border-b border-gray-700 space-y-2">
          <h4 className="text-white text-xs font-semibold uppercase mb-2">Active Tasks</h4>
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              {task.status === 'running' && (
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              )}
              {task.status === 'completed' && (
                <CheckCircle className="w-3 h-3 text-green-400" />
              )}
              {task.status === 'failed' && (
                <XCircle className="w-3 h-3 text-red-400" />
              )}
              <span className="text-gray-300 text-xs flex-1">{task.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={handleOptimizePrompt}
          disabled={!currentPrompt || isOptimizing}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimize Prompt
            </>
          )}
        </button>

        <button
          onClick={handleGetTrends}
          disabled={!config.enableTrends}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Get Trend Suggestions
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-white text-xs font-semibold uppercase mb-2">Suggestions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 bg-gray-800/50 rounded-lg text-gray-300 text-xs"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Status Indicators */}
      <div className="p-4 border-t border-gray-700 grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg ${config.autoOptimize ? 'bg-blue-500/20' : 'bg-gray-800/50'}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 rounded-full ${config.autoOptimize ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-300">Optimizer</span>
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${config.autoAnalyze ? 'bg-purple-500/20' : 'bg-gray-800/50'}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 rounded-full ${config.autoAnalyze ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-300">Analyzer</span>
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${config.enableTrends ? 'bg-green-500/20' : 'bg-gray-800/50'}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 rounded-full ${config.enableTrends ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-300">Trends</span>
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${config.enableWorkflows ? 'bg-yellow-500/20' : 'bg-gray-800/50'}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 rounded-full ${config.enableWorkflows ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-300">Workflows</span>
          </div>
        </div>
      </div>
    </div>
  )
}

