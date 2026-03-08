export default function Header({ onHome }) {
  return (
    <header
      className="w-full bg-retro-panel border-b-2 border-retro-primary px-4 py-4 flex items-center justify-center cursor-pointer"
      onClick={onHome}
    >
      <h1 className="text-retro-primary text-sm sm:text-base tracking-wider">
        <span className="text-retro-gold">🛒</span>{' '}
        SHOPPING QUEST
      </h1>
    </header>
  );
}
