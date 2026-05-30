import React, { useState } from 'react';
import { BookOpen, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from './MagneticButton';

const GLOSSARY_TERMS = [
  { term: 'AUM', definition: 'Assets Under Management. The total market value of the investments that a financial institution manages on behalf of clients.' },
  { term: 'NAV', definition: 'Net Asset Value. Represents the per share/unit price of the fund on a specific date or time.' },
  { term: 'P&L', definition: 'Profit and Loss. Shows the total gains or losses of the portfolio over a specified time period.' },
  { term: 'VaR', definition: 'Value at Risk. A statistic that measures and quantifies the level of financial risk within a firm, portfolio, or position over a specific time frame.' },
  { term: 'Benchmark', definition: 'A standard against which the performance of a security, mutual fund, or investment manager can be measured (e.g., S&P 500).' },
  { term: 'Drawdown', definition: 'The peak-to-trough decline during a specific record period of an investment, fund, or commodity.' },
  { term: 'Attribution', definition: 'A method for evaluating the performance of a portfolio manager. It separates the manager\'s active decisions into allocation and selection effects.' },
];

export const FinancialGlossary: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTerms = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed bottom-8 right-28 z-[9000]">
        <MagneticButton onClick={() => setIsOpen(true)}>
          <div
            className="flex items-center justify-center w-14 h-14 bg-accent text-white rounded-full shadow-glow transition pointer-events-auto"
            title="Financial Glossary"
          >
            <BookOpen className="w-6 h-6" />
          </div>
        </MagneticButton>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9995] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-bg-secondary border-l border-border-primary shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-primary">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Glossary</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-text-muted hover:text-text-primary transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-border-primary">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-primary rounded px-9 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {filteredTerms.length > 0 ? (
                  filteredTerms.map(item => (
                    <div key={item.term} className="bg-bg-tertiary border border-border-primary rounded-lg p-3">
                      <h4 className="text-xs font-bold text-accent mb-1">{item.term}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{item.definition}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted text-center pt-8">No terms found matching "{search}"</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
