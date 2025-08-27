import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, Smartphone, Monitor, Eye, MousePointer, DollarSign } from 'lucide-react';
import type { AdsterraCamera } from '../types/AdsterraTypes';

interface CampaignCardProps {
  campaign: AdsterraCamera;
  isSelected: boolean;
  onSelect: (campaignId: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, isSelected, onSelect }) => {
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => onSelect(campaign.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{campaign.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getDeviceIcon(campaign.device)}
          <span className="text-sm text-gray-600">{campaign.country}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">CPM</span>
          </div>
          <span className="text-lg font-bold text-green-600">${campaign.cpm.toFixed(2)}</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">عرض</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{campaign.impressions.toLocaleString()}</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MousePointer className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">نقرة</span>
          </div>
          <span className="text-lg font-bold text-purple-600">{campaign.clicks.toLocaleString()}</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">إيراد</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">${campaign.revenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>CTR: {ctr}%</span>
        <span className="bg-gray-100 px-2 py-1 rounded">{campaign.category}</span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600 break-all">{campaign.url}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
