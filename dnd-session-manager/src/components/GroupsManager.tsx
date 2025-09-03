import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { CharacterGroup } from '../lib/types';
import { Button } from './ui/Button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Palette,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupsManagerProps {
  className?: string;
}

interface GroupFormData {
  name: string;
  color: string;
  description: string;
}

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange  
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function GroupsManager({ className }: GroupsManagerProps) {
  const { session, addGroup, updateGroup, removeGroup, assignCharacterToGroup, removeCharacterFromGroup } = useSession();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CharacterGroup | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    color: defaultColors[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: formData.name,
        color: formData.color,
        description: formData.description
      });
    } else {
      addGroup({
        name: formData.name,
        color: formData.color,
        description: formData.description,
        isActive: true
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', color: defaultColors[0], description: '' });
    setEditingGroup(null);
    setShowForm(false);
  };

  const handleEdit = (group: CharacterGroup) => {
    setFormData({
      name: group.name,
      color: group.color,
      description: group.description || ''
    });
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleDelete = (groupId: string) => {
    if (confirm(t('confirmDeleteGroup'))) {
      removeGroup(groupId);
    }
  };

  const handleCharacterToggle = (characterId: string, groupId: string, isInGroup: boolean) => {
    if (isInGroup) {
      removeCharacterFromGroup(characterId, groupId);
    } else {
      assignCharacterToGroup(characterId, groupId);
    }
  };

  const getGroupMembers = (groupId: string) => {
    return session.characters.filter(char => char.groupIds.includes(groupId));
  };

  const getAvailableCharacters = (groupId: string) => {
    return session.characters.filter(char => !char.groupIds.includes(groupId));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('groups')}</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('createGroup')}
        </Button>
      </div>

      {/* Group Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingGroup ? t('editGroup') : t('createGroup')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('groupName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('groupColor')}
                </label>
                <div className="flex items-center space-x-2">
                  {defaultColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        formData.color === color 
                          ? 'border-gray-900 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('groupDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('groupDescriptionPlaceholder')}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                {t('cancel')}
              </Button>
              <Button type="submit">
                {editingGroup ? t('update') : t('add')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      {session.groups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noGroupsYet')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('createGroupsToOrganize')}</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addFirstGroup')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {session.groups.map(group => {
            const members = getGroupMembers(group.id);
            const availableCharacters = getAvailableCharacters(group.id);
            
            return (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Group Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                        {group.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(group.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Group Members */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('groupMembers')} ({members.length})
                    </h4>
                  </div>
                  
                  {/* Current Members */}
                  {members.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {members.map(character => (
                        <div 
                          key={character.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {character.name}
                            </span>
                            {character.isPlayer && (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                {t('player')}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCharacterToggle(character.id, group.id, true)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Available Characters to Add */}
                  {availableCharacters.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        {t('availableCharacters')}
                      </h5>
                      <div className="space-y-1">
                        {availableCharacters.map(character => (
                          <div 
                            key={character.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {character.name}
                              </span>
                              {character.isPlayer && (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                  {t('player')}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCharacterToggle(character.id, group.id, false)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {availableCharacters.length === 0 && members.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('noCharactersInGroup')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}