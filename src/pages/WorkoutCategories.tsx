import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { WorkoutCategory } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export function WorkoutCategories() {
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    points_per_minute: 5
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await dataService.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (formData.points_per_minute < 1) {
      setError('Points per minute must be at least 1');
      return;
    }

    try {
      setError('');
      await dataService.categories.add(formData);
      setSuccess('Category added successfully!');
      setFormData({ name: '', points_per_minute: 5 });
      setShowAddForm(false);
      await loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    }
  }

  async function handleUpdate(id: string) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (!category.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (category.points_per_minute < 1) {
      setError('Points per minute must be at least 1');
      return;
    }

    try {
      setError('');
      await dataService.categories.update(id, {
        name: category.name,
        points_per_minute: category.points_per_minute
      });
      setSuccess('Category updated successfully!');
      setEditingId(null);
      await loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      await dataService.categories.delete(id);
      setSuccess('Category deleted successfully!');
      await loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setShowAddForm(false);
  }

  function handleCancelEdit() {
    setEditingId(null);
    loadCategories();
  }

  function updateCategory(id: string, field: keyof WorkoutCategory, value: any) {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Workout Categories</h2>
          <p className="text-gray-600 mt-1">Manage workout types and their point values</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ name: '', points_per_minute: 5 });
          }}
          className="flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {showAddForm && (
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Category</h3>
          <div className="space-y-4">
            <Input
              label="Category Name"
              placeholder="e.g., Running, Swimming, Cycling"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Points Per Minute"
              type="number"
              min="1"
              placeholder="5"
              value={formData.points_per_minute}
              onChange={(e) => setFormData({ ...formData, points_per_minute: parseInt(e.target.value) || 1 })}
            />
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Example Calculation:</p>
              <p>If a participant does this activity for 30 minutes, they will earn: <strong>{formData.points_per_minute * 30} points</strong></p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAdd} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', points_per_minute: 5 });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Categories</h3>
        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No categories found. Add one to get started!</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {editingId === category.id ? (
                  <>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input
                        label="Category Name"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      />
                      <Input
                        label="Points Per Minute"
                        type="number"
                        min="1"
                        value={category.points_per_minute}
                        onChange={(e) => updateCategory(category.id, 'points_per_minute', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdate(category.id)}
                        className="flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{category.name}</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-primary-600">{category.points_per_minute} points</span> per minute
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">30 mins = {category.points_per_minute * 30} points</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category.id)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Category Name:</strong> The type of workout (e.g., Running, Cycling)</p>
          <p>• <strong>Points Per Minute:</strong> How many points participants earn for each minute of this activity</p>
          <p>• <strong>Example:</strong> If Running = 7 points/min, and someone runs for 60 minutes, they earn 420 points</p>
          <p>• Participants will select a category and enter their workout duration to automatically calculate points</p>
        </div>
      </Card>
    </div>
  );
}
