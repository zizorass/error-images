function Navbar() {
  const { ArrowUpRight } = window.Icons;
  const links = ['Home', 'Collection', 'Craft', 'Story', 'Contact'];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 flex items-center justify-between">
      <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center">
        <span className="font-heading italic text-white text-2xl lowercase">c</span>
      </div>

      <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
        {links.map((link) => (
          <a key={link} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body">
            {link}
          </a>
        ))}
        <a href="#" className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium flex items-center gap-1 whitespace-nowrap">
          Shop Now
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="w-12 h-12" />
    </div>
  );
}

window.Navbar = Navbar;
