import { useState } from 'react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import ListDetail from './components/ListDetail';
import HistoryScreen from './components/HistoryScreen';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | detail | history
  const [selectedListId, setSelectedListId] = useState(null);

  const navigate = (s, listId = null) => {
    setScreen(s);
    setSelectedListId(listId);
  };

  return (
    <div className="scanlines min-h-screen bg-retro-bg flex flex-col">
      <Header onHome={() => navigate('home')} />
      <main className="flex-1 w-full max-w-lg mx-auto px-3 pb-6">
        {screen === 'home' && (
          <HomeScreen
            onOpenList={(id) => navigate('detail', id)}
            onHistory={() => navigate('history')}
          />
        )}
        {screen === 'detail' && (
          <ListDetail
            listId={selectedListId}
            onBack={() => navigate('home')}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen
            onOpenList={(id) => navigate('detail', id)}
            onBack={() => navigate('home')}
          />
        )}
      </main>
    </div>
  );
}
