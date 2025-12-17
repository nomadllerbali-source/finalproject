import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Package {
  id: string;
  title: string;
  description: string;
  duration: string;
  price_from: number;
  image_url: string;
  highlights: string[];
  inclusions: string;
  exclusions: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  display_order: number;
}

const WebsiteManager: React.FC = () => {
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'packages' | 'promotions'>('packages');
  const [packages, setPackages] = useState<Package[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPackages();
    loadPromotions();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const handleSavePackage = async (packageData: Partial<Package>) => {
    setLoading(true);
    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update({ ...packageData, updated_at: new Date().toISOString() })
          .eq('id', editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('packages')
          .insert([{ ...packageData, created_by: authState.user?.id }]);
        if (error) throw error;
      }
      await loadPackages();
      setIsPackageModalOpen(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromotion = async (promotionData: Partial<Promotion>) => {
    setLoading(true);
    try {
      if (editingPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update({ ...promotionData, updated_at: new Date().toISOString() })
          .eq('id', editingPromotion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert([{ ...promotionData, created_by: authState.user?.id }]);
        if (error) throw error;
      }
      await loadPromotions();
      setIsPromotionModalOpen(false);
      setEditingPromotion(null);
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      await loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Failed to delete promotion');
    }
  };

  const togglePackageStatus = async (pkg: Package) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: !pkg.is_active })
        .eq('id', pkg.id);
      if (error) throw error;
      await loadPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const togglePromotionStatus = async (promo: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promo.is_active })
        .eq('id', promo.id);
      if (error) throw error;
      await loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Website Manager</h1>
              <p className="text-slate-600">Manage packages and promotions for your landing page</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'packages'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'promotions'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Promotions & Offers ({promotions.length})
            </button>
          </div>

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Travel Packages</h2>
                <button
                  onClick={() => {
                    setEditingPackage(null);
                    setIsPackageModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Plus className="h-5 w-5" />
                  Add Package
                </button>
              </div>

              {packages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No packages yet. Create your first travel package!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-4">
                        {pkg.image_url && (
                          <img
                            src={pkg.image_url}
                            alt={pkg.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
                              <p className="text-sm text-slate-600">{pkg.duration}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-600">
                                ${pkg.price_from}
                              </span>
                              {pkg.is_featured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  Featured
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {pkg.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">{pkg.description}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPackage(pkg);
                                setIsPackageModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => togglePackageStatus(pkg)}
                              className="flex items-center gap-1 px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm"
                            >
                              {pkg.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {pkg.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Promotions & Offers</h2>
                <button
                  onClick={() => {
                    setEditingPromotion(null);
                    setIsPromotionModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Plus className="h-5 w-5" />
                  Add Promotion
                </button>
              </div>

              {promotions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No promotions yet. Create your first special offer!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-4">
                        {promo.image_url && (
                          <img
                            src={promo.image_url}
                            alt={promo.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{promo.title}</h3>
                              <p className="text-sm text-slate-600">
                                Valid: {promo.valid_from} to {promo.valid_until}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-bold rounded">
                                {promo.discount_percentage}% OFF
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {promo.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">{promo.description}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPromotion(promo);
                                setIsPromotionModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => togglePromotionStatus(promo)}
                              className="flex items-center gap-1 px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm"
                            >
                              {promo.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {promo.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => handleDeletePromotion(promo.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Package Modal */}
      {isPackageModalOpen && (
        <PackageModal
          package={editingPackage}
          onSave={handleSavePackage}
          onClose={() => {
            setIsPackageModalOpen(false);
            setEditingPackage(null);
          }}
          loading={loading}
        />
      )}

      {/* Promotion Modal */}
      {isPromotionModalOpen && (
        <PromotionModal
          promotion={editingPromotion}
          onSave={handleSavePromotion}
          onClose={() => {
            setIsPromotionModalOpen(false);
            setEditingPromotion(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

const PackageModal: React.FC<{
  package: Package | null;
  onSave: (data: Partial<Package>) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ package: pkg, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    title: pkg?.title || '',
    description: pkg?.description || '',
    duration: pkg?.duration || '',
    price_from: pkg?.price_from || 0,
    image_url: pkg?.image_url || '',
    highlights: pkg?.highlights || [],
    inclusions: pkg?.inclusions || '',
    exclusions: pkg?.exclusions || '',
    is_featured: pkg?.is_featured || false,
    is_active: pkg?.is_active ?? true,
    display_order: pkg?.display_order || 0,
  });

  const [highlightInput, setHighlightInput] = useState('');

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, highlightInput.trim()],
      });
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {pkg ? 'Edit Package' : 'Add New Package'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Package Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 5 Days Bali Adventure"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Brief description of the package"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5 Days 4 Nights"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price From ($)</label>
              <input
                type="number"
                value={formData.price_from}
                onChange={(e) => setFormData({ ...formData, price_from: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Highlights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Add a highlight"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded">
                  <span className="flex-1">{highlight}</span>
                  <button
                    onClick={() => removeHighlight(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Inclusions</label>
            <textarea
              value={formData.inclusions}
              onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="What's included in this package"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Exclusions</label>
            <textarea
              value={formData.exclusions}
              onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="What's not included"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Featured Package</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromotionModal: React.FC<{
  promotion: Promotion | null;
  onSave: (data: Partial<Promotion>) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ promotion: promo, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    title: promo?.title || '',
    description: promo?.description || '',
    image_url: promo?.image_url || '',
    discount_percentage: promo?.discount_percentage || 0,
    valid_from: promo?.valid_from || '',
    valid_until: promo?.valid_until || '',
    is_active: promo?.is_active ?? true,
    display_order: promo?.display_order || 0,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {promo ? 'Edit Promotion' : 'Add New Promotion'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Promotion Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Summer Special Offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Promotion details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Discount Percentage</label>
            <input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="20"
              min="0"
              max="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Valid From</label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Valid Until</label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-slate-700">Active</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Promotion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManager;
