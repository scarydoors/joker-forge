import Background from "./Background";

function App() {
  return (
    <>
      <Background />
      <div className="min-h-screen font-game text-white">
        <div className="container mx-auto p-4">
          <h1 className="text-4xl text-balatro-attention">Joker Forge</h1>
          <p className="text-balatro-chips mt-2">
            Create custom Balatro jokers with ease
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
