import { useState, useEffect } from 'react';
import { api } from '../api';

export default function HomeScreen({ onOpenList, onHistory }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      const data = await api.getLists();
      setLists(data);
    } catch (err) {
      console.error('Failed to fetch lists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const created = await api.createList({ name: newListName.trim(), items: [] });
      setNewListName('');
      onOpenList(created.id);
    } catch (err) {
      console.error('Failed to create list', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteList(id);
      fetchLists();
    } catch (err) {
      console.error('Failed to delete list', err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const todayLists = lists.filter((l) => l.date === todayStr);
  const olderLists = lists.filter((l) => l.date !== todayStr);

  return (
    <div className="mt-4 space-y-5">
      {/* New list form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          className="pixel-input flex-1"
          placeholder="NEW LIST NAME..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          maxLength={50}
        />
        <button type="submit" className="pixel-btn shrink-0">
          + NEW
        </button>
      </form>

      {/* Today's lists */}
      <section>
        <h2 className="text-retro-gold text-xs mb-3 flex items-center gap-2">
          <span>★</span> TODAY'S QUESTS
        </h2>
        {loading ? (
          <p className="text-retro-muted text-xs animate-blink">LOADING...</p>
        ) : todayLists.length === 0 ? (
          <div className="pixel-border bg-retro-panel p-4 text-center">
            <p className="text-retro-muted text-xs">NO QUESTS YET!</p>
            <p className="text-retro-muted text-[10px] mt-2">CREATE A NEW LIST ABOVE</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => onOpenList(list.id)}
                onDelete={(e) => handleDelete(e, list.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Older lists preview */}
      {olderLists.length > 0 && (
        <section>
          <h2 className="text-retro-cyan text-xs mb-3 flex items-center gap-2">
            <span>◆</span> RECENT QUESTS
          </h2>
          <div className="space-y-2">
            {olderLists.slice(0, 3).map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => onOpenList(list.id)}
                onDelete={(e) => handleDelete(e, list.id)}
                showDate
              />
            ))}
          </div>
        </section>
      )}

      {/* History button */}
      <button
        onClick={onHistory}
        className="pixel-btn-gold w-full text-center"
      >
        📜 VIEW HISTORY
      </button>
    </div>
  );
}

function ListCard({ list, onOpen, onDelete, showDate = false }) {
  const progress = list.item_count > 0
    ? Math.round((list.checked_count / list.item_count) * 100)
    : 0;
  const isComplete = list.item_count > 0 && list.checked_count === list.item_count;

  return (
    <div
      onClick={onOpen}
      className={`pixel-border bg-retro-panel p-3 cursor-pointer hover:bg-retro-border transition-colors ${
        isComplete ? 'border-retro-gold' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isComplete && <span className="text-retro-gold text-xs">★</span>}
            <h3 className={`text-xs truncate ${isComplete ? 'text-retro-gold' : 'text-retro-text'}`}>
              {list.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-retro-muted">
              {list.checked_count}/{list.item_count} ITEMS
            </span>
            {showDate && (
              <span className="text-[10px] text-retro-muted">
                {list.date}
              </span>
            )}
          </div>
          {/* Progress bar */}
          {list.item_count > 0 && (
            <div className="mt-2 h-2 bg-retro-bg border border-retro-muted">
              <div
                className={`h-full transition-all duration-300 ${
                  isComplete ? 'bg-retro-gold' : 'bg-retro-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-retro-danger text-xs hover:bg-retro-danger hover:text-retro-bg px-2 py-1 border border-retro-danger"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
