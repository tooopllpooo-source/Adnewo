import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Download, Eye, Check, Save } from 'lucide-react';
import { PopunderGenerator } from '../services/PopunderGenerator';
import type { AdsterraCamera, PopunderConfig } from '../types/AdsterraTypes';

interface ScriptGeneratorProps {
  campaigns: AdsterraCamera[];
  config: PopunderConfig;
  onSaveScript?: (name: string, script: string, config: PopunderConfig, type: 'production' | 'preview') => Promise<boolean>;
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ campaigns, config, onSaveScript }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'production' | 'preview'>('production');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scriptName, setScriptName] = useState('');
  const [saving, setSaving] = useState(false);
  
  const generator = new PopunderGenerator();
  const productionScript = generator.generateScript(campaigns, config);
  const previewScript = generator.generatePreviewScript(campaigns, config);
  
  const currentScript = activeTab === 'production' ? productionScript : previewScript;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('فشل نسخ الكود:', error);
    }
  };

  const downloadScript = () => {
    const blob = new Blob([currentScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adsterra-popunder-${activeTab}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveScript = async () => {
    if (!scriptName.trim() || !onSaveScript) return;

    setSaving(true);
    try {
      const success = await onSaveScript(scriptName, currentScript, config, activeTab);
      if (success) {
        setShowSaveModal(false);
        setScriptName('');
      }
    } catch (error) {
      console.error('خطأ في حفظ السكريپت:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Code className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">مولد الكود</h2>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'production'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Code className="w-4 h-4 inline-block mr-1" />
          الإنتاج
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4 inline-block mr-1" />
          المعاينة
        </button>
      </div>

      {/* إحصائيات الكود */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600">الحملات المختارة</div>
          <div className="text-xl font-bold text-blue-600">{campaigns.length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600">حجم الكود</div>
          <div className="text-xl font-bold text-green-600">{(currentScript.length / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600">نوع المشغل</div>
          <div className="text-xl font-bold text-purple-600">{config.triggerType}</div>
        </div>
      </div>

      {/* منطقة الكود */}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
          <code>{currentScript}</code>
        </pre>
        
        {/* أزرار الإجراءات */}
        <div className="absolute top-2 right-2 flex gap-2">
          {onSaveScript && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4 inline-block mr-1" />
              حفظ
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'تم النسخ!' : 'نسخ'}
          </button>
          <button
            onClick={downloadScript}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 inline-block mr-1" />
            تنزيل
          </button>
        </div>
      </div>

      {/* تعليمات الاستخدام */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">تعليمات الاستخدام:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>انسخ الكود أعلاه أو قم بتنزيله كملف JavaScript</li>
          <li>ضع الكود في صفحة HTML قبل إغلاق tag الـ &lt;/body&gt;</li>
          <li>أو ارفع الملف إلى خادمك واستدعيه باستخدام &lt;script src="..."&gt;</li>
          <li>تأكد من أن موقعك يدعم JavaScript</li>
        </ol>
      </div>

      {activeTab === 'preview' && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-900 mb-2">وضع المعاينة:</h3>
          <p className="text-sm text-orange-800">
            هذا الكود في وضع التجربة، سيعرض رسائل في كونسول المتصفح بدلاً من فتح النوافذ المنبثقة.
            استخدمه لاختبار الوظائف قبل النشر.
          </p>
        </div>
      )}

      {/* نافذة حفظ السكريپت */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">حفظ السكريپت</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم السكريپت
              </label>
              <input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="أدخل اسم السكريپت"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveScript}
                disabled={!scriptName.trim() || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
