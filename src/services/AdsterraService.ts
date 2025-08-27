import axios from 'axios';
import { faker } from '@faker-js/faker';
import type { AdsterraCamera, ApiCredentials } from '../types/AdsterraTypes';

export class AdsterraService {
  private credentials: ApiCredentials;

  constructor(credentials: ApiCredentials) {
    this.credentials = credentials;
  }

  async fetchCampaigns(): Promise<AdsterraCamera[]> {
    try {
      // محاولة الاتصال بـ API الحقيقي أولاً
      const response = await axios.get(`${this.credentials.endpoint}/campaigns`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Publisher-ID': this.credentials.publisherId,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // مهلة 5 ثوانٍ
      });

      return response.data.campaigns || response.data;
    } catch (error) {
      console.warn('تعذر الاتصال بـ API الحقيقي، سيتم استخدام البيانات التجريبية:', error);
      // إرجاع بيانات تجريبية في حالة فشل API الحقيقي
      return this.generateMockCampaigns();
    }
  }

  private generateMockCampaigns(): AdsterraCamera[] {
    const campaigns: AdsterraCamera[] = [];
    const categories = ['Gaming', 'Finance', 'Technology', 'Health', 'Education', 'Entertainment', 'Shopping'];
    const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'BR', 'ALL'];
    const devices: ('mobile' | 'desktop' | 'all')[] = ['mobile', 'desktop', 'all'];
    const statuses: ('active' | 'paused' | 'expired')[] = ['active', 'active', 'active', 'paused', 'expired'];

    // توليد 8-12 حملة
    const campaignCount = faker.number.int({ min: 8, max: 12 });

    for (let i = 0; i < campaignCount; i++) {
      const category = faker.helpers.arrayElement(categories);
      const device = faker.helpers.arrayElement(devices);
      const status = faker.helpers.arrayElement(statuses);
      const impressions = faker.number.int({ min: 1000, max: 50000 });
      const clicks = faker.number.int({ min: 50, max: Math.floor(impressions * 0.1) });
      const cpm = faker.number.float({ min: 0.5, max: 5.0, fractionDigits: 2 });
      
      campaigns.push({
        id: faker.string.alphanumeric(8),
        name: `${category} ${device === 'all' ? 'Universal' : device === 'mobile' ? 'Mobile' : 'Desktop'}`,
        url: `https://adsterra.com/click/${faker.string.alphanumeric(12)}`,
        cpm: cpm,
        country: faker.helpers.arrayElement(countries),
        device: device,
        category: category,
        status: status,
        impressions: impressions,
        clicks: clicks,
        revenue: parseFloat((clicks * (cpm / 1000)).toFixed(2)),
        createdAt: faker.date.recent({ days: 30 }).toISOString()
      });
    }

    // ترتيب حسب CPM (الأعلى أولاً)
    return campaigns.sort((a, b) => b.cpm - a.cpm);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // محاولة التحقق من API الحقيقي
      const response = await axios.get(`${this.credentials.endpoint}/validate`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return response.status === 200;
    } catch (error) {
      console.warn('تعذر التحقق من API الحقيقي، سيتم قبول أي مفتاح غير فارغ:', error);
      
      // في حالة فشل التحقق الحقيقي، نقبل أي مفتاح غير فارغ للتجربة
      if (apiKey && apiKey.trim().length > 5) {
        return true;
      }
      
      return false;
    }
  }

  // وظيفة لتشفير بيانات API بسيط
  static encryptApiKey(apiKey: string): string {
    // تشفير بسيط باستخدام Base64 (في التطبيق الحقيقي استخدم تشفير أقوى)
    return btoa(apiKey);
  }

  static decryptApiKey(encryptedKey: string): string {
    try {
      return atob(encryptedKey);
    } catch {
      return encryptedKey; // إرجاع المفتاح كما هو في حالة فشل فك التشفير
    }
  }
}
