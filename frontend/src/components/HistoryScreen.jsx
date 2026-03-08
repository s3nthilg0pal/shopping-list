import { useState, useEffect } from 'react';
import { api } from '../api';

export default function HistoryScreen({ onOpenList, onBack }) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getDates();
        setDates(data);
      } catch (err) {
        console.error('Failed to fetch dates', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setLists([]);
      return;
    }
    (async () => {
      try {
        const data = await api.getLists(selectedDate);
        setLists(data);
      } catch (err) {
        console.error('Failed to fetch lists for date', err);
      }
    })();
  }, [selectedDate]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-retro-primary text-xs hover:text-retro-gold">
          ← BACK
        </button>
        <h2 className="text-retro-gold text-xs">📜 QUEST HISTORY</h2>
      </div>

      {loading ? (
        <p className="text-retro-primary text-xs animate-blink">LOADING...</p>
      ) : dates.length === 0 ? (
        <div className="pixel-border bg-retro-panel p-6 text-center">
          <p className="text-retro-muted text-xs">NO HISTORY YET!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dates.map((dateStr) => (
            <div key={dateStr}>
              <button
                onClick={() =>
                  setSelectedDate(selectedDate === dateStr ? null : dateStr)
                }
                className={`w-full text-left p-3 border-2 transition-colors text-xs ${
                  selectedDate === dateStr
                    ? 'border-retro-gold bg-retro-panel text-retro-gold'
                    : 'border-retro-border bg-retro-panel text-retro-text hover:border-retro-primary'
                }`}
              >
                <span className="mr-2">
                  {selectedDate === dateStr ? '▼' : '▶'}
                </span>
                {formatDate(dateStr)}
                {dateStr === todayStr && (
                  <span className="text-retro-primary ml-2">[TODAY]</span>
                )}
              </button>

              {selectedDate === dateStr && (
                <div className="ml-4 mt-1 space-y-1">
                  {lists.length === 0 ? (
                    <p className="text-retro-muted text-[10px] p-2">LOADING...</p>
                  ) : (
                    lists.map((list) => {
                      const isComplete =
                        list.item_count > 0 &&
                        list.checked_count === list.item_count;
                      return (
                        <div
                          key={list.id}
                          onClick={() => onOpenList(list.id)}
                          className={`p-3 border-2 cursor-pointer transition-colors ${
                            isComplete
                              ? 'border-retro-gold bg-retro-bg hover:bg-retro-panel'
                              : 'border-retro-border bg-retro-bg hover:bg-retro-panel hover:border-retro-primary'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${isComplete ? 'text-retro-gold' : 'text-retro-text'}`}>
                              {isComplete && '★ '}{list.name}
                            </span>
                            <span className="text-[10px] text-retro-muted">
                              {list.checked_count}/{list.item_count}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
