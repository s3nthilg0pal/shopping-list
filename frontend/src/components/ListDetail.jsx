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
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDeleteItem(item.id)}
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
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDeleteItem(item.id)}
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

function ItemRow({ item, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 border-2 transition-colors ${
        item.checked
          ? 'bg-retro-bg border-retro-muted'
          : 'bg-retro-panel border-retro-border hover:border-retro-primary'
      }`}
    >
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
      <button
        onClick={onDelete}
        className="text-retro-danger text-[10px] hover:bg-retro-danger hover:text-retro-bg px-2 py-1 border border-transparent hover:border-retro-danger"
      >
        DEL
      </button>
    </div>
  );
}
