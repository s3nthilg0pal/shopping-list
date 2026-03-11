import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function ListDetail({ listId, onBack }) {
  const [list, setList] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  const fetchList = async () => {
    try {
      const data = await api.getList(listId);
      setList(data);
    } catch (err) {
      console.error('Failed to fetch list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [listId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await api.addItem(listId, { name: newItem.trim() });
      setNewItem('');
      fetchList();
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to add item', err);
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.updateItem(listId, item.id, { checked: !item.checked });
      fetchList();
    } catch (err) {
      console.error('Failed to toggle item', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.deleteItem(listId, itemId);
      fetchList();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <p className="text-retro-primary text-xs animate-blink">LOADING QUEST...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="mt-8 text-center">
        <p className="text-retro-danger text-xs">QUEST NOT FOUND!</p>
        <button onClick={onBack} className="pixel-btn mt-4">← BACK</button>
      </div>
    );
  }

  const checkedCount = list.items.filter((i) => i.checked).length;
  const totalCount = list.items.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && checkedCount === totalCount;

  const uncheckedItems = list.items.filter((i) => !i.checked);
  const checkedItems = list.items.filter((i) => i.checked);

  return (
    <div className="mt-4 space-y-4">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-retro-primary text-xs hover:text-retro-gold">
          ← BACK
        </button>
      </div>

      {/* List header */}
      <div className="pixel-border bg-retro-panel p-4">
        <h2 className={`text-sm ${isComplete ? 'text-retro-gold' : 'text-retro-primary'}`}>
          {isComplete && '★ '}{list.name}
        </h2>
        <p className="text-[10px] text-retro-muted mt-1">{list.date}</p>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-3 bg-retro-bg border border-retro-muted">
            <div
              className={`h-full transition-all duration-500 ${
                isComplete ? 'bg-retro-gold' : 'bg-retro-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`text-xs ${isComplete ? 'text-retro-gold' : 'text-retro-primary'}`}>
            {checkedCount}/{totalCount}
          </span>
        </div>

        {isComplete && totalCount > 0 && (
          <p className="text-retro-gold text-[10px] mt-2 animate-pixel-bounce text-center">
            ★ QUEST COMPLETE! ★
          </p>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="pixel-input flex-1"
          placeholder="ADD ITEM..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          maxLength={100}
        />
        <button type="submit" className="pixel-btn shrink-0">
          + ADD
        </button>
      </form>

      {/* Unchecked items */}
      {uncheckedItems.length > 0 && (
        <section>
          <h3 className="text-retro-secondary text-[10px] mb-2">▶ TO COLLECT</h3>
          <div className="space-y-1">
            {uncheckedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                listId={listId}
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDeleteItem(item.id)}
                onRefresh={fetchList}
              />
            ))}
          </div>
        </section>
      )}

      {/* Checked items */}
      {checkedItems.length > 0 && (
        <section>
          <h3 className="text-retro-muted text-[10px] mb-2">✓ COLLECTED</h3>
          <div className="space-y-1">
            {checkedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                listId={listId}
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDeleteItem(item.id)}
                onRefresh={fetchList}
              />
            ))}
          </div>
        </section>
      )}

      {totalCount === 0 && (
        <div className="pixel-border bg-retro-panel p-6 text-center">
          <p className="text-retro-muted text-xs">EMPTY INVENTORY!</p>
          <p className="text-retro-muted text-[10px] mt-2">ADD ITEMS ABOVE TO BEGIN</p>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, listId, onToggle, onDelete, onRefresh }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadItemImage(listId, item.id, file);
      onRefresh();
    } catch (err) {
      console.error('Failed to upload image', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (e) => {
    e.stopPropagation();
    try {
      await api.deleteItemImage(listId, item.id);
      setExpanded(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete image', err);
    }
  };

  return (
    <div
      className={`flex flex-col border-2 transition-colors ${
        item.checked
          ? 'bg-retro-bg border-retro-muted'
          : 'bg-retro-panel border-retro-border hover:border-retro-primary'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          onClick={onToggle}
          className={`pixel-checkbox ${item.checked ? 'checked' : ''}`}
        />
        <span
          onClick={onToggle}
          className={`flex-1 text-xs cursor-pointer select-none ${
            item.checked ? 'text-retro-muted line-through' : 'text-retro-text'
          }`}
        >
          {item.name}
        </span>

        {/* Image indicator / expand toggle */}
        {item.has_image && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-retro-gold text-[10px] hover:text-retro-primary px-1"
            title={expanded ? 'Hide image' : 'Show image'}
          >
            {expanded ? '▲IMG' : '▼IMG'}
          </button>
        )}

        {/* Camera / upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-retro-secondary text-[10px] hover:bg-retro-secondary hover:text-retro-bg px-2 py-1 border border-transparent hover:border-retro-secondary disabled:opacity-50"
          title="Capture or upload image"
        >
          {uploading ? '...' : '📷'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageCapture}
        />

        <button
          onClick={onDelete}
          className="text-retro-danger text-[10px] hover:bg-retro-danger hover:text-retro-bg px-2 py-1 border border-transparent hover:border-retro-danger"
        >
          DEL
        </button>
      </div>

      {/* Expanded image view */}
      {item.has_image && expanded && (
        <div className="px-3 pb-3 flex flex-col items-start gap-2">
          <img
            src={api.getItemImageUrl(listId, item.id)}
            alt={item.name}
            className="max-w-full max-h-48 border-2 border-retro-border object-contain"
          />
          <button
            onClick={handleDeleteImage}
            className="text-retro-danger text-[10px] hover:bg-retro-danger hover:text-retro-bg px-2 py-1 border border-retro-danger"
          >
            REMOVE IMAGE
          </button>
        </div>
      )}
    </div>
  );
}
