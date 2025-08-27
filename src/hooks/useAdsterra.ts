import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdsterraService } from '../services/AdsterraService';
import type { AdsterraCamera, ApiCredentials, GeneratedScript, PopunderConfig } from '../types/AdsterraTypes';

export const useAdsterra = (userId: string | undefined) => {
  const [campaigns, setCampaigns] = useState<AdsterraCamera[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);
  const [savedScripts, setSavedScripts] = useState<GeneratedScript[]>([]);
  const [loading, setLoading] = useState(false);

  // تحميل بيانات API المحفوظة
  useEffect(() => {
    if (userId) {
      loadApiCredentials();
      loadCampaigns();
      loadSavedScripts();
    }
  }, [userId]);

  const loadApiCredentials = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCredentials({
          apiKey: AdsterraService.decryptApiKey(data.api_key_encrypted),
          publisherId: data.publisher_id,
          endpoint: data.endpoint
        });
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات API:', error);
    }
  };

  const saveApiCredentials = async (creds: ApiCredentials) => {
    if (!userId) return false;

    try {
      // إلغاء تفعيل البيانات القديمة
      await supabase
        .from('api_credentials')
        .update({ is_active: false })
        .eq('user_id', userId);

      // حفظ البيانات الجديدة
      const { error } = await supabase
        .from('api_credentials')
        .insert({
          user_id: userId,
          api_key_encrypted: AdsterraService.encryptApiKey(creds.apiKey),
          publisher_id: creds.publisherId,
          endpoint: creds.endpoint
        });

      if (error) throw error;

      setCredentials(creds);
      return true;
    } catch (error) {
      console.error('خطأ في حفظ بيانات API:', error);
      return false;
    }
  };

  const loadCampaigns = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('cpm', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedCampaigns: AdsterraCamera[] = data.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          url: campaign.url,
          cpm: parseFloat(campaign.cpm.toString()),
          country: campaign.country,
          device: campaign.device,
          category: campaign.category,
          status: campaign.status,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          revenue: parseFloat(campaign.revenue.toString()),
          createdAt: campaign.created_at
        }));

        setCampaigns(formattedCampaigns);
        
        // تحديد الحملات المختارة
        const selected = data.filter(c => c.is_selected).map(c => c.id);
        setSelectedCampaigns(selected);
      }
    } catch (error) {
      console.error('خطأ في تحميل الحملات:', error);
    }
  };

  const fetchCampaigns = async () => {
    if (!credentials || !userId) return;

    setLoading(true);
    try {
      const service = new AdsterraService(credentials);
      const fetchedCampaigns = await service.fetchCampaigns();

      // حفظ الحملات في قاعدة البيانات
      await saveCampaigns(fetchedCampaigns);
      
      setCampaigns(fetchedCampaigns);
      
      // اختيار الحملات النشطة تلقائياً
      const activeCampaigns = fetchedCampaigns
        .filter(c => c.status === 'active')
        .map(c => c.id);
      setSelectedCampaigns(activeCampaigns);
      
      // تحديث حالة الاختيار في قاعدة البيانات
      await updateCampaignSelection(activeCampaigns);
      
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCampaigns = async (campaignsToSave: AdsterraCamera[]) => {
    if (!userId) return;

    try {
      // حذف الحملات القديمة
      await supabase
        .from('campaigns')
        .delete()
        .eq('user_id', userId);

      // إدراج الحملات الجديدة
      const { error } = await supabase
        .from('campaigns')
        .insert(
          campaignsToSave.map(campaign => ({
            id: campaign.id,
            user_id: userId,
            name: campaign.name,
            url: campaign.url,
            cpm: campaign.cpm,
            country: campaign.country,
            device: campaign.device,
            category: campaign.category,
            status: campaign.status,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            revenue: campaign.revenue
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('خطأ في حفظ الحملات:', error);
    }
  };

  const updateCampaignSelection = async (selectedIds: string[]) => {
    if (!userId) return;

    try {
      // إلغاء تحديد جميع الحملات
      await supabase
        .from('campaigns')
        .update({ is_selected: false })
        .eq('user_id', userId);

      // تحديد الحملات المختارة
      if (selectedIds.length > 0) {
        await supabase
          .from('campaigns')
          .update({ is_selected: true })
          .eq('user_id', userId)
          .in('id', selectedIds);
      }
    } catch (error) {
      console.error('خطأ في تحديث اختيار الحملات:', error);
    }
  };

  const toggleCampaignSelection = async (campaignId: string) => {
    const newSelection = selectedCampaigns.includes(campaignId)
      ? selectedCampaigns.filter(id => id !== campaignId)
      : [...selectedCampaigns, campaignId];
    
    setSelectedCampaigns(newSelection);
    await updateCampaignSelection(newSelection);
  };

  const saveScript = async (name: string, script: string, config: PopunderConfig, type: 'production' | 'preview') => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('generated_scripts')
        .insert({
          user_id: userId,
          name,
          script_code: script,
          config,
          campaign_ids: selectedCampaigns,
          script_type: type
        });

      if (error) throw error;
      
      await loadSavedScripts();
      return true;
    } catch (error) {
      console.error('خطأ في حفظ السكريپت:', error);
      return false;
    }
  };

  const loadSavedScripts = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('generated_scripts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const scripts: GeneratedScript[] = data.map(script => ({
          id: script.id,
          name: script.name,
          code: script.script_code,
          config: script.config,
          campaigns: campaigns.filter(c => script.campaign_ids.includes(c.id)),
          createdAt: script.created_at
        }));

        setSavedScripts(scripts);
      }
    } catch (error) {
      console.error('خطأ في تحميل السكريپتات:', error);
    }
  };

  const deleteScript = async (scriptId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('generated_scripts')
        .delete()
        .eq('id', scriptId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await loadSavedScripts();
      return true;
    } catch (error) {
      console.error('خطأ في حذف السكريپت:', error);
      return false;
    }
  };

  return {
    campaigns,
    selectedCampaigns,
    credentials,
    savedScripts,
    loading,
    saveApiCredentials,
    fetchCampaigns,
    toggleCampaignSelection,
    saveScript,
    deleteScript,
    loadSavedScripts
  };
};
