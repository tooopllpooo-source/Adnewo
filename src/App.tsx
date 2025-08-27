import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, BarChart3, Settings, LogOut, Code2, User } from 'lucide-react';

import { CampaignCard } from './components/CampaignCard';
import { ConfigPanel } from './components/ConfigPanel';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ApiSetup } from './components/ApiSetup';
import { AuthForm } from './components/AuthForm';
import { SavedScripts } from './components/SavedScripts';

import { AdsterraService } from './services/AdsterraService';
import { useAuth } from './hooks/useAuth';
import { useAdsterra } from './hooks/useAdsterra';
import type { PopunderConfig, ApiCredentials } from './types/AdsterraTypes';

type TabId = 'api' | 'campaigns' | 'config' | 'generate' | 'scripts';

function App() {
  const { user, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    campaigns,
    selectedCampaigns,
    credentials,
    savedScripts,
    loading: adsterraLoading,
    saveApiCredentials,
    fetchCampaigns,
    toggleCampaignSelection,
    saveScript,
    deleteScript
  } = useAdsterra(user?.id);

  const [activeTab, setActiveTab] = useState<TabId>('api');

  const [config, setConfig] = useState<PopunderConfig>({
    triggerType: 'click',
    delay: 0,
    frequency: 'session',
    geoTargeting: [],
    deviceTargeting: [],
    minCpm: 1.0,
    testMode: true
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  const handleApiValidation = async (creds: ApiCredentials): Promise<boolean> => {
    try {
      const service = new AdsterraService(creds);
      const isValid = await service.validateApiKey(creds.apiKey);
      
      if (isValid) {
        const saved = await saveApiCredentials(creds);
        if (saved) {
          setActiveTab('campaigns');
          await fetchCampaigns();
        }
        return saved;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const getSelectedCampaigns = () => {
    return campaigns.filter(c => selectedCampaigns.includes(c.id));
  };

  const getTotalStats = () => {
    const selected = getSelectedCampaigns();
    return {
      totalCampaigns: selected.length,
      avgCpm: selected.length > 0 
        ? selected.reduce((sum, c) => sum + c.cpm, 0) / selected.length 
        : 0,
      totalRevenue: selected.reduce((sum, c) => sum + c.revenue, 0),
      totalClicks: selected.reduce((sum, c) => sum + c.clicks, 0)
    };
  };

  const stats = getTotalStats();

  const tabConfig: { id: TabId; label: string; icon: React.ElementType; color: string; disabled?: boolean }[] = [
    { id: 'api', label: 'إعدادات API', icon: Settings, color: 'blue' },
    { id: 'campaigns', label: 'الحملات', icon: Target, color: 'green', disabled: !credentials },
    { id: 'config', label: 'إعدادات Popunder', icon: Zap, color: 'purple', disabled: !credentials },
    { id: 'generate', label: 'توليد الكود', icon: BarChart3, color: 'orange', disabled: selectedCampaigns.length === 0 },
    { id: 'scripts', label: 'السكريپتات المحفوظة', icon: Code2, color: 'indigo', disabled: !credentials }
  ];

  const tabColorClasses = {
    blue: { active: 'text-blue-600 border-blue-500', layout: 'bg-blue-500' },
    green: { active: 'text-green-600 border-green-500', layout: 'bg-green-500' },
    purple: { active: 'text-purple-600 border-purple-500', layout: 'bg-purple-500' },
    orange: { active: 'text-orange-600 border-orange-500', layout: 'bg-orange-500' },
    indigo: { active: 'text-indigo-600 border-indigo-500', layout: 'bg-indigo-500' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الرأس */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مدير إعلانات Adsterra</h1>
                <p className="text-sm text-gray-600">أداة متقدمة لإدارة الحملات الإعلانية</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {credentials && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{stats.totalCampaigns}</div>
                    <div className="text-gray-600">حملة مختارة</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">${stats.avgCpm.toFixed(2)}</div>
                    <div className="text-gray-600">متوسط CPM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</div>
                    <div className="text-gray-600">إجمالي الإيراد</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-900">{profile?.full_name || user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* التبويبات */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" dir="ltr">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              const colorClass = tabColorClasses[tab.color as keyof typeof tabColorClasses];
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`relative flex items-center gap-2 py-4 px-1 text-sm font-medium transition-colors ${
                    isActive
                      ? colorClass.active
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute bottom-[-1px] left-0 right-0 h-0.5 ${colorClass.layout}`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'api' && (
          <ApiSetup
            credentials={credentials}
            onValidate={handleApiValidation}
          />
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">إدارة الحملات</h2>
              <button
                onClick={fetchCampaigns}
                disabled={adsterraLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {adsterraLoading ? 'جاري التحديث...' : 'تحديث الحملات'}
              </button>
            </div>

            {adsterraLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isSelected={selectedCampaigns.includes(campaign.id)}
                    onSelect={toggleCampaignSelection}
                  />
                ))}
              </div>
            )}

            {campaigns.length === 0 && !adsterraLoading && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حملات</h3>
                <p className="text-gray-600">قم بجلب الحملات من API أو تحقق من إعدادات الاتصال</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <ConfigPanel config={config} onConfigChange={setConfig} />
        )}

        {activeTab === 'generate' && (
          <ScriptGenerator 
            campaigns={getSelectedCampaigns()} 
            config={config}
            onSaveScript={saveScript}
          />
        )}

        {activeTab === 'scripts' && (
          <SavedScripts scripts={savedScripts} onDelete={deleteScript} />
        )}
      </main>
    </div>
  );
}

export default App;
