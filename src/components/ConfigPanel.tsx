import React from 'react';
import { motion } from 'framer-motion';
import { Settings, TestTube, Globe, Smartphone } from 'lucide-react';
import type { PopunderConfig } from '../types/AdsterraTypes';

interface ConfigPanelProps {
  config: PopunderConfig;
  onConfigChange: (config: PopunderConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const updateConfig = (updates: Partial<PopunderConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">إعدادات الـ Popunder</h2>
      </div>

      <div className="space-y-6">
        {/* نوع المشغل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">نوع المشغل</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'click', label: 'عند النقر', desc: 'ينشط عند أول نقرة' },
              { value: 'time', label: 'بعد وقت', desc: 'ينشط بعد فترة زمنية' },
              { value: 'scroll', label: 'عند التمرير', desc: 'ينشط عند التمرير' }
            ].map((trigger) => (
              <label key={trigger.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="triggerType"
                  value={trigger.value}
                  checked={config.triggerType === trigger.value}
                  onChange={(e) => updateConfig({ triggerType: e.target.value as any })}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                  config.triggerType === trigger.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-sm">{trigger.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{trigger.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* التأخير */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.triggerType === 'time' ? 'التأخير (ثانية)' : 
             config.triggerType === 'scroll' ? 'نسبة التمرير (%)' : 'التأخير'}
          </label>
          <input
            type="number"
            min="0"
            max={config.triggerType === 'scroll' ? 100 : 60}
            value={config.delay}
            onChange={(e) => updateConfig({ delay: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* تكرار العرض */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">تكرار العرض</label>
          <div className="space-y-2">
            {[
              { value: 'once', label: 'مرة واحدة فقط', desc: 'لن يظهر مرة أخرى' },
              { value: 'session', label: 'مرة واحدة بالجلسة', desc: 'مرة واحدة لكل زيارة' },
              { value: 'always', label: 'دائماً', desc: 'في كل مرة يتم تشغيله' }
            ].map((freq) => (
              <label key={freq.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={freq.value}
                  checked={config.frequency === freq.value}
                  onChange={(e) => updateConfig({ frequency: e.target.value as any })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">{freq.label}</div>
                  <div className="text-xs text-gray-500">{freq.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* الحد الأدنى للـ CPM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للـ CPM ($)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={config.minCpm}
            onChange={(e) => updateConfig({ minCpm: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* وضع التجربة */}
        <div className="flex items-center gap-3">
          <TestTube className="w-5 h-5 text-orange-500" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.testMode}
              onChange={(e) => updateConfig({ testMode: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">وضع التجربة</span>
          </label>
        </div>
        {config.testMode && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-sm text-orange-700">
              في وضع التجربة، سيتم عرض رسالة في الكونسول بدلاً من فتح الـ Popunder
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
