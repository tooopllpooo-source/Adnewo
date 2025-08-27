import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AdsterraService } from '../services/AdsterraService';
import type { AdsterraCamera, ApiCredentials, GeneratedScript, PopunderConfig } from '../types/AdsterraTypes';

export const useAdsterra = (userId: string | undefined) => {
  const [campaigns, setCampaigns] = useState<AdsterraCamera[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);
  const [savedScripts, setSavedScripts] = useState<GeneratedScript[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApiCredentials = useCallback(async () => {
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
  }, [userId]);

  const loadCampaigns = useCallback(async (): Promise<AdsterraCamera[] | null> => {
    if (!userId) return null;
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
        const selected = data.filter(c => c.is_selected).map(c => c.id);
        setSelectedCampaigns(selected);
        return formattedCampaigns;
      }
      setCampaigns([]);
      return [];
    } catch (error) {
      console.error('خطأ في تحميل الحملات:', error);
      return null;
    }
  }, [userId]);

  const loadSavedScripts = useCallback(async (allCampaigns: AdsterraCamera[]) => {
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
          campaigns: allCampaigns.filter(c => script.campaign_ids.includes(c.id)),
          createdAt: script.created_at
        }));
        setSavedScripts(scripts);
      }
    } catch (error) {
      console.error('خطأ في تحميل السكريپتات:', error);
    }
  }, [userId]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await loadApiCredentials();
        const loadedCampaigns = await loadCampaigns();
        if (loadedCampaigns) {
          await loadSavedScripts(loadedCampaigns);
        }
      } catch (error) {
        console.error("Failed to load initial adsterra data", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [userId, loadApiCredentials, loadCampaigns, loadSavedScripts]);

  const saveApiCredentials = async (creds: ApiCredentials) => {
    if (!userId) return false;
    try {
      await supabase
        .from('api_credentials')
        .update({ is_active: false })
        .eq('user_id', userId);
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

  const saveCampaigns = async (campaignsToSave: AdsterraCamera[]) => {
    if (!userId) return;
    try {
      await supabase
        .from('campaigns')
        .delete()
        .eq('user_id', userId);
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
      await supabase
        .from('campaigns')
        .update({ is_selected: false })
        .eq('user_id', userId);
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

  const fetchCampaigns = async () => {
    if (!credentials || !userId) return;
    setLoading(true);
    try {
      const service = new AdsterraService(credentials);
      const fetchedCampaigns = await service.fetchCampaigns();
      await saveCampaigns(fetchedCampaigns);
      setCampaigns(fetchedCampaigns);
      const activeCampaigns = fetchedCampaigns
        .filter(c => c.status === 'active')
        .map(c => c.id);
      setSelectedCampaigns(activeCampaigns);
      await updateCampaignSelection(activeCampaigns);
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error);
    } finally {
      setLoading(false);
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
      await loadSavedScripts(campaigns);
      return true;
    } catch (error) {
      console.error('خطأ في حفظ السكريپت:', error);
      return false;
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
      await loadSavedScripts(campaigns);
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
  };
};
