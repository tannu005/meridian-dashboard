import React, { useState, useMemo } from 'react';
import { WidgetComponentProps, NewsArticle } from '../types';
import { useDashboardStore } from '../store/dashboardStore';
import { Search, Flame, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const W05_NewsFeed: React.FC<WidgetComponentProps<any, NewsArticle[]>> = ({
  data,
  config,
}) => {
  const { selectedTicker, setSelectedTicker } = useDashboardStore();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sourceFilter = config.category || 'all';

  const processedNews = useMemo(() => {
    if (!data) return [];
    
    return data.filter((n) => {
      // Source filter
      if (sourceFilter !== 'all' && n.source !== sourceFilter) {
        return false;
      }
      
      // Cross-widget selected ticker filter
      if (selectedTicker) {
        const tickerLower = selectedTicker.toLowerCase();
        const matchesTicker = 
          n.title.toLowerCase().includes(tickerLower) ||
          n.summary.toLowerCase().includes(tickerLower) ||
          n.keywords.some(k => k.toLowerCase().includes(tickerLower)) ||
          (selectedTicker === 'HDFCBANK' && n.title.toLowerCase().includes('hdfc')) ||
          (selectedTicker === 'RELIANCE' && n.title.toLowerCase().includes('reliance')) ||
          (selectedTicker === 'ICICIBANK' && n.title.toLowerCase().includes('icici')) ||
          (selectedTicker === 'SBIN' && n.title.toLowerCase().includes('sbi')) ||
          (selectedTicker === 'KOTAKBANK' && n.title.toLowerCase().includes('kotak'));
          
        if (!matchesTicker) return false;
      }
      
      // Keyword/Text filter
      const match = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(match) ||
        n.summary.toLowerCase().includes(match) ||
        n.keywords.some(k => k.toLowerCase().includes(match))
      );
    });
  }, [data, sourceFilter, selectedTicker, search]);

  const [groupBySector, setGroupBySector] = useState(false);

  // Dynamic Sector Resolution for News
  const getArticleSector = (article: NewsArticle) => {
    const titleLower = article.title.toLowerCase();
    const sumLower = article.summary.toLowerCase();
    const keys = article.keywords.map(k => k.toLowerCase());
    
    if (keys.some(k => k.includes('reliance')) || titleLower.includes('reliance') || sumLower.includes('reliance')) return 'Energy & Infrastructure';
    if (keys.some(k => k.includes('hdfc')) || keys.some(k => k.includes('earnings')) || titleLower.includes('bank') || sumLower.includes('bank')) return 'Financial Services';
    if (keys.some(k => k.includes('sebi')) || keys.some(k => k.includes('disclosure') || k.includes('regulatory') || k.includes('risk'))) return 'Risk & Regulation';
    return 'Macro Economics';
  };

  // Grouped news aggregation
  const groupedNews = useMemo(() => {
    const groups: Record<string, NewsArticle[]> = {};
    processedNews.forEach(article => {
      const sec = getArticleSector(article);
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(article);
    });
    return groups;
  }, [processedNews]);

  const getSentimentBadge = (sentiment: NewsArticle['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-status-success/20 text-status-success border border-status-success/30 font-mono">
            <ThumbsUp className="w-2 h-2" /> Bullish
          </span>
        );
      case 'negative':
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-status-danger/20 text-status-danger border border-status-danger/30 font-mono">
            <ThumbsDown className="w-2.5 h-2.5" /> Bearish
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-bg-primary text-text-muted border border-border-primary font-mono">
            <Flame className="w-2 h-2" /> Neutral
          </span>
        );
    }
  };

  const handleArticleClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderArticleCard = (article: NewsArticle) => {
    const isExpanded = expandedId === article.id;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        key={article.id}
        onClick={() => handleArticleClick(article.id)}
        className={`
          p-2.5 rounded border border-border-primary bg-bg-primary hover:bg-bg-tertiary transition cursor-pointer select-text
          ${isExpanded ? 'bg-bg-tertiary border-accent' : ''}
        `}
      >
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent uppercase font-mono tracking-wider">
              {article.source}
            </span>
            <span className="text-[9px] text-text-muted font-mono">
              {new Date(article.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {getSentimentBadge(article.sentiment)}
        </div>

        {/* Article Title */}
        <h4 className="text-[11px] font-bold text-text-primary leading-snug font-sans">
          {article.title}
        </h4>

        {/* Click and expand summary overlay */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-[10px] text-text-secondary leading-relaxed border-t border-border-primary/50 pt-2 font-sans"
          >
            <p className="mb-2 select-text">{article.summary}</p>
            
            {/* Keywords tags */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {article.keywords.map(k => (
                <span key={k} className="px-1.5 py-0.5 rounded bg-bg-secondary text-[8px] font-mono text-text-muted">
                  #{k.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No financial news articles available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      {/* Filtering Toolbar */}
      <div className="flex flex-col gap-1.5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-text-muted" />
            <input
              type="text"
              placeholder="Filter news wires..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1 bg-bg-primary border border-border-primary rounded text-xs text-text-primary focus:outline-none focus:border-accent font-sans"
            />
          </div>
          <button
            onClick={() => setGroupBySector(!groupBySector)}
            className={`
              px-2.5 py-1 rounded border text-[10px] font-sans font-bold uppercase transition flex-shrink-0 focus:ring-1 focus:ring-accent focus:outline-none
              ${groupBySector 
                ? 'bg-accent border-accent text-bg-primary font-extrabold shadow-glow' 
                : 'bg-bg-tertiary border-border-primary hover:bg-bg-primary text-text-secondary'}
            `}
            title="Toggle Sector Grouping Mode"
          >
            {groupBySector ? '📂 Sectors' : '⏱️ Timeline'}
          </button>
        </div>
        {selectedTicker && (
          <div className="flex items-center justify-between px-2 py-1 rounded bg-accent/15 border border-accent/20 text-[10px] font-bold text-accent font-mono">
            <span>CONTEXT: {selectedTicker} RELEVANT NEWS</span>
            <button 
              onClick={() => setSelectedTicker(null)}
              className="p-0.5 rounded hover:bg-accent/20 transition text-accent"
              title="Clear active ticker filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Articles Feed */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {groupBySector ? (
            Object.entries(groupedNews).map(([sec, articles]) => (
              <div key={sec} className="space-y-1.5">
                <div className="text-[9px] font-extrabold text-accent uppercase font-mono tracking-widest border-b border-border-primary/30 pb-1 mt-3 mb-2 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {sec} ({articles.length})
                </div>
                {articles.map(article => renderArticleCard(article))}
              </div>
            ))
          ) : (
            processedNews.map(article => renderArticleCard(article))
          )}
        </AnimatePresence>
        
        {processedNews.length === 0 && (
          <div className="text-center py-6 text-xs text-text-muted">
            No articles match your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
export default W05_NewsFeed;
