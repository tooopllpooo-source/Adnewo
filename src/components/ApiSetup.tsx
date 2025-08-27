import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Server, User, CheckCircle, AlertCircle } from 'lucide-react';
import type { ApiCredentials } from '../types/AdsterraTypes';

interface ApiSetupProps {
  credentials: ApiCredentials | null;
  onValidate: (credentials: ApiCredentials) => Promise<boolean>;
}

export const ApiSetup: React.FC<ApiSetupProps> = ({ credentials, onValidate }) => {
  const [localCredentials, setLocalCredentials] = useState<ApiCredentials>(
    credentials || {
      apiKey: '',
      publisherId: '',
      endpoint: 'https://api.adsterra.com/v1'
    }
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await onValidate(localCredentials);
      setValidationResult(isValid ? 'success' : 'error');
    } catch (error) {
      setValidationResult('error');
    } finally {
      setIsValidating(false);
    }
  };

  const updateCredentials = (updates: Partial<ApiCredentials>) => {
    setLocalCredentials(prev => ({ ...prev, ...updates }));
    setValidationResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Key className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">إعدادات API</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <input
            type="password"
            value={localCredentials.apiKey}
            onChange={(e) => updateCredentials({ apiKey: e.target.value })}
            placeholder="أدخل API Key الخاص بك"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Publisher ID
          </label>
          <input
            type="text"
            value={localCredentials.publisherId}
            onChange={(e) => updateCredentials({ publisherId: e.target.value })}
            placeholder="أدخل Publisher ID الخاص بك"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Server className="w-4 h-4" />
            API Endpoint
          </label>
          <input
            type="url"
            value={localCredentials.endpoint}
            onChange={(e) => updateCredentials({ endpoint: e.target.value })}
            placeholder="https://api.adsterra.com/v1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isValidating || !localCredentials.apiKey || !localCredentials.publisherId}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'جاري التحقق...' : 'حفظ والتحقق'}
        </button>

        {validationResult === 'success' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            <CheckCircle className="w-5 h-5" />
            <span>تم التحقق من البيانات بنجاح!</span>
          </div>
        )}

        {validationResult === 'error' && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            <AlertCircle className="w-5 h-5" />
            <span>خطأ في التحقق من البيانات. تأكد من صحة المعلومات.</span>
          </div>
        )}
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">كيفية الحصول على بيانات API:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>قم بتسجيل الدخول إلى حسابك في Adsterra</li>
          <li>انتقل إلى قسم "API" أو "Integration"</li>
          <li>أنشئ API Key جديد أو استخدم المتوفر</li>
          <li>انسخ Publisher ID من إعدادات الحساب</li>
        </ol>
      </div>
    </motion.div>
  );
};
