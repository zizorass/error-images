import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.8 }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-6 mix-blend-difference"
    >
      <span className="font-display text-2xl tracking-wide">CHROME</span>
      <nav className="hidden md:flex gap-10 text-xs tracking-widest2 uppercase text-white/80">
        <a href="#collection" className="hover:text-white transition-colors">Collection</a>
        <a href="#" className="hover:text-white transition-colors">Craftsmanship</a>
        <a href="#" className="hover:text-white transition-colors">Movement</a>
        <a href="#" className="hover:text-white transition-colors">Boutiques</a>
      </nav>
      <a href="#" className="text-xs tracking-widest2 uppercase border-b border-white/60 pb-0.5">
        Configure
      </a>
    </motion.header>
  )
}
