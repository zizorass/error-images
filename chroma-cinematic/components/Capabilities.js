function Capabilities() {
  const { CinematicBackground } = window;
  const { MovementIcon, CrystalIcon, PrecisionIcon } = window.Icons;

  const cards = [
    {
      Icon: MovementIcon,
      tags: ['Swiss Automatic', 'Self-Winding', '42Hr Reserve', 'Hand-Finished'],
      title: 'Automatic Movement',
      body: 'Every CHROMA movement is hand-assembled and regulated in-house, so the seconds hand sweeps exactly as precision demands.',
    },
    {
      Icon: CrystalIcon,
      tags: ['Scratch-Proof', 'Anti-Reflective', 'Domed Glass', 'Optically Clear'],
      title: 'Sapphire Crystal',
      body: 'A dome of sapphire crystal protects the dial without ever dulling it — scratch-resistant enough to outlast the watch around it.',
    },
    {
      Icon: PrecisionIcon,
      tags: ['Hand-Finished', 'Quality Checked', 'Jeweled Bearings', 'Tested 72Hrs'],
      title: 'Precision Assembly',
      body: 'Each timepiece passes a 72-hour accuracy test before it ever reaches your wrist, verified down to the second.',
    },
  ];

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      <CinematicBackground variant="capabilities" />

      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        <div className="mb-auto">
          <div className="text-sm font-body text-white/80 mb-6">{'// Craftsmanship'}</div>
          <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
            Precision
            <br />
            assembled
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {cards.map(({ Icon, tags, title, body }) => (
            <div key={title} className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {tags.map((tag) => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <div className="mt-6">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">{title}</h3>
                <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Capabilities = Capabilities;
