function App() {
  const { Hero, Capabilities } = window;
  return (
    <>
      <Hero />
      <Capabilities />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
