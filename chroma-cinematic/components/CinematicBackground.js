// Static cinematic backdrop used in place of background video (no watch
// footage or image/video-generation tool available in this environment).
function CinematicBackground({ variant = 'hero' }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className={`cinematic-bg cinematic-bg--${variant}`} />
      <div className="cinematic-grain" />
    </div>
  );
}

window.CinematicBackground = CinematicBackground;
