import React from 'react';
import { motion } from 'framer-motion';
import { Code, Download, Trash2, Calendar, Eye } from 'lucide-react';
import type { GeneratedScript } from '../types/AdsterraTypes';

interface SavedScriptsProps {
  scripts: GeneratedScript[];
  onDelete: (scriptId: string) => Promise<boolean>;
}

export const SavedScripts: React.FC<SavedScriptsProps> = ({ scripts, onDelete }) => {
  const downloadScript = (script: GeneratedScript) => {
    const blob = new Blob([script.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/\s+/g, '_')}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (scriptId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السكريپت؟')) {
      await onDelete(scriptId);
    }
  };

  if (scripts.length === 0) {
    return (
      <div className="text-center py-12">
        <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سكريپتات محفوظة</h3>
        <p className="text-gray-600">قم بتوليد سكريپت جديد وحفظه لعرضه هنا</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">السكريپتات المحفوظة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scripts.map((script) => (
          <motion.div
            key={script.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{script.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(script.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadScript(script)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="تنزيل"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(script.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الحملات:</span>
                <span className="font-medium">{script.campaigns.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المشغل:</span>
                <span className="font-medium">{script.config.triggerType}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">حجم الكود:</span>
                <span className="font-medium">{(script.code.length / 1024).toFixed(1)} KB</span>
              </div>

              {script.config.testMode && (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>وضع التجربة</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                {script.campaigns.slice(0, 3).map((campaign, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {campaign.name}
                  </span>
                ))}
                {script.campaigns.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    +{script.campaigns.length - 3} أكثر
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
