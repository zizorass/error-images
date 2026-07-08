import { motion, AnimatePresence } from 'framer-motion'
import { FLAVOURS } from '../data/flavours.js'
import PacketVisual from './PacketVisual.jsx'

export default function CartDrawer({ open, items, onClose, onRemove }) {
  const lines = FLAVOURS.map((f) => ({ flavour: f, qty: items.filter((i) => i === f.id).length }))
    .filter((l) => l.qty > 0)
  const total = lines.reduce((sum, l) => sum + l.flavour.price * l.qty, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-koala-night/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed top-3 bottom-3 right-3 z-[61] w-[min(26rem,calc(100vw-1.5rem))] glass-strong rounded-3xl p-6 flex flex-col shadow-caramel-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-2xl text-koala-cream">Your bag</h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-koala-cream/70 hover:text-koala-gold hover:rotate-90 transition-all duration-300"
                aria-label="Close cart"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-3">
              {lines.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-koala-cream/50">
                  <span className="text-4xl">🍿</span>
                  <p className="text-sm">Your bag is tragically empty.<br />The popcorn is waiting.</p>
                </div>
              )}
              {lines.map(({ flavour, qty }) => (
                <motion.div
                  key={flavour.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="w-14 h-16 shrink-0">
                    <PacketVisual flavour={flavour} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-koala-cream truncate">{flavour.name}</p>
                    <p className="text-koala-gold text-sm">£{flavour.price.toFixed(2)} × {qty}</p>
                  </div>
                  <button
                    onClick={() => onRemove(flavour.id)}
                    className="text-koala-cream/40 hover:text-koala-gold text-xs underline underline-offset-2 shrink-0"
                  >
                    remove
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="pt-5 mt-4 border-t border-koala-cream/10">
              <div className="flex justify-between mb-4 text-koala-cream">
                <span className="text-koala-cream/60">Total</span>
                <span className="font-display font-bold text-xl">£{total.toFixed(2)}</span>
              </div>
              <button
                disabled={lines.length === 0}
                className="btn-caramel w-full rounded-full py-4 font-bold text-koala-night disabled:opacity-40 disabled:pointer-events-none"
              >
                Checkout — coming soon
              </button>
              <p className="text-center text-[11px] text-koala-cream/40 mt-3 tracking-wide">
                Free shipping on orders over £25 · Popped fresh weekly
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
