import type { AdsterraCamera, PopunderConfig } from '../types/AdsterraTypes';

export class PopunderGenerator {
  generateScript(campaigns: AdsterraCamera[], config: PopunderConfig): string {
    const encodedCampaigns = this.encodeCampaigns(campaigns);
    
    return `
(function() {
    'use strict';
    
    // إعدادات الـ Popunder
    const config = ${JSON.stringify(config, null, 2)};
    
    // الحملات المشفرة
    const campaigns = ${encodedCampaigns};
    
    let hasTriggered = false;
    let sessionTriggered = sessionStorage.getItem('adsterra_triggered') === 'true';
    
    // فك تشفير الحملات
    function decodeCampaigns(encoded) {
        return JSON.parse(atob(encoded)).map(campaign => ({
            ...campaign,
            url: atob(campaign.url)
        }));
    }
    
    // كشف الجهاز
    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }
    
    // كشف الدولة (تقريبي)
    function getUserCountry() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryMap = {
            'America/New_York': 'US',
            'Europe/London': 'UK',
            'Europe/Paris': 'FR',
            'Asia/Tokyo': 'JP',
            // يمكن إضافة المزيد
        };
        return countryMap[timezone] || 'ALL';
    }
    
    // اختيار أفضل حملة
    function selectBestCampaign() {
        const decodedCampaigns = decodeCampaigns(campaigns);
        const deviceType = getDeviceType();
        const userCountry = getUserCountry();
        
        // فلترة الحملات حسب الجهاز والدولة
        let filteredCampaigns = decodedCampaigns.filter(campaign => {
            const deviceMatch = campaign.device === 'all' || campaign.device === deviceType;
            const countryMatch = campaign.country === 'ALL' || campaign.country === userCountry;
            const cpmMatch = campaign.cpm >= config.minCpm;
            
            return deviceMatch && countryMatch && cpmMatch && campaign.status === 'active';
        });
        
        if (filteredCampaigns.length === 0) {
            filteredCampaigns = decodedCampaigns.filter(c => c.status === 'active');
        }
        
        // ترتيب حسب CPM (الأعلى أولاً)
        filteredCampaigns.sort((a, b) => b.cpm - a.cpm);
        
        return filteredCampaigns[0] || null;
    }
    
    // فتح الـ Popunder
    function openPopunder(url) {
        if (config.testMode) {
            console.log('وضع التجربة: سيتم فتح الرابط:', url);
            return;
        }
        
        try {
            const popup = window.open(url, '_blank', 
                'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=600'
            );
            
            if (popup) {
                popup.blur();
                window.focus();
                
                // تحديث إحصائيات الجلسة
                sessionStorage.setItem('adsterra_triggered', 'true');
                
                // إرسال إحصائية النقرة (اختياري)
                fetch('https://your-analytics-endpoint.com/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'popunder_opened',
                        url: url,
                        timestamp: Date.now()
                    })
                }).catch(() => {}); // تجاهل الأخطاء
            }
        } catch (error) {
            console.error('خطأ في فتح الـ Popunder:', error);
        }
    }
    
    // تحقق من إمكانية التشغيل
    function canTrigger() {
        if (hasTriggered && config.frequency === 'once') return false;
        if (sessionTriggered && config.frequency === 'session') return false;
        
        return true;
    }
    
    // تشغيل الـ Popunder
    function triggerPopunder() {
        if (!canTrigger()) return;
        
        const bestCampaign = selectBestCampaign();
        if (!bestCampaign) {
            console.warn('لم يتم العثور على حملة مناسبة');
            return;
        }
        
        openPopunder(bestCampaign.url);
        hasTriggered = true;
    }
    
    // إعداد المشغلات
    function setupTriggers() {
        switch (config.triggerType) {
            case 'click':
                document.addEventListener('click', function(e) {
                    // تجنب النقر على الروابط الداخلية
                    if (e.target.tagName === 'A' && e.target.hostname === window.location.hostname) {
                        return;
                    }
                    triggerPopunder();
                }, { once: config.frequency === 'once' });
                break;
                
            case 'time':
                setTimeout(triggerPopunder, config.delay * 1000);
                break;
                
            case 'scroll':
                let scrollTriggered = false;
                window.addEventListener('scroll', function() {
                    if (scrollTriggered) return;
                    
                    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                    if (scrollPercent >= config.delay) {
                        triggerPopunder();
                        scrollTriggered = true;
                    }
                });
                break;
        }
    }
    
    // تشغيل النظام
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTriggers);
    } else {
        setupTriggers();
    }
    
})();`;
  }

  private encodeCampaigns(campaigns: AdsterraCamera[]): string {
    const encodedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      url: btoa(campaign.url) // تشفير الرابط
    }));
    
    return `"${btoa(JSON.stringify(encodedCampaigns))}"`;
  }

  generatePreviewScript(campaigns: AdsterraCamera[], config: PopunderConfig): string {
    return this.generateScript(campaigns, { ...config, testMode: true });
  }
}
