function Hero() {
  const { motion } = window.Motion;
  const { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon } = window.Icons;
  const { CinematicBackground, WatchVisual, BlurText, Navbar } = window;

  const fadeUp = (delay) => ({
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' },
  });

  const partners = ['Vogue', 'GQ', 'Hodinkee', 'Forbes', 'WatchTime'];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      <CinematicBackground variant="hero" />

      <div
        className="absolute inset-x-0 bottom-[-14%] z-[1] flex justify-center pointer-events-none opacity-60"
        style={{ filter: 'blur(1.5px)' }}
      >
        <WatchVisual size={620} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
          <motion.div {...fadeUp(0.4)} className="liquid-glass rounded-full flex items-center pl-1 pr-3 py-1 mb-6">
            <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold mr-2">New</span>
            <span className="text-sm text-white/90">New Automatic Collection Arrives 2026</span>
          </motion.div>

          <BlurText
            text="Time Reimagined In Precision"
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl tracking-[-4px]"
          />

          <motion.p {...fadeUp(0.8)} className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight text-center">
            CHROMA fuses Swiss automatic movements with two-tone steel and gold — watches built to be felt, not just worn.
          </motion.p>

          <motion.div {...fadeUp(1.1)} className="flex items-center gap-6 mt-6">
            <a href="#" className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2">
              Explore Collection
              <ArrowUpRight className="h-5 w-5" />
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-white">
              Watch the Story
              <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div {...fadeUp(1.3)} className="flex items-stretch gap-4 mt-8">
            <div className="liquid-glass rounded-[1.25rem] p-4 sm:p-5 w-[150px] sm:w-[220px] flex flex-col justify-between">
              <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              <div className="mt-4">
                <div className="font-heading italic text-white text-2xl sm:text-4xl tracking-[-1px] leading-none">50 Hrs</div>
                <div className="text-xs text-white font-body font-light mt-2">Hand-Assembled Per Watch</div>
              </div>
            </div>
            <div className="liquid-glass rounded-[1.25rem] p-4 sm:p-5 w-[150px] sm:w-[220px] flex flex-col justify-between">
              <GlobeIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              <div className="mt-4">
                <div className="font-heading italic text-white text-2xl sm:text-4xl tracking-[-1px] leading-none">40+</div>
                <div className="text-xs text-white font-body font-light mt-2">Countries We Ship To</div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div {...fadeUp(1.4)} className="flex flex-col items-center gap-4 pb-8">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            As featured in the world's leading publications
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 sm:gap-x-12 md:gap-x-16">
            {partners.map((name) => (
              <span key={name} className="font-heading italic text-white text-lg sm:text-2xl md:text-3xl tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

window.Hero = Hero;
