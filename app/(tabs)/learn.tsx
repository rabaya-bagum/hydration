import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArticleCard } from '@/components/ArticleCard';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ARTICLES, ARTICLE_CATEGORIES, type ArticleCategory } from '@/content/articles';
import { spacing } from '@/design/tokens';
import { useRewardsStore } from '@/store/rewardsStore';

type Filter = 'all' | 'saved' | ArticleCategory;

export default function LearnScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const bookmarks = useRewardsStore((s) => s.bookmarks);
  const read = useRewardsStore((s) => s.readArticles);
  const list = ARTICLES.filter((a) => (filter === 'all' ? true : filter === 'saved' ? bookmarks.includes(a.id) : a.category === filter));
  return (
    <Screen>
      <ScreenHeader title="Learn" subtitle="Short reads, 1–3 minutes." />
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label={`Saved${bookmarks.length ? ` (${bookmarks.length})` : ''}`} glyph="🔖" selected={filter === 'saved'} onPress={() => setFilter('saved')} testID="filter-saved" />
        {ARTICLE_CATEGORIES.map((c) => <Chip key={c.id} label={c.label} selected={filter === c.id} onPress={() => setFilter(c.id)} />)}
      </View>
      {list.length ? list.map((a) => (
        <ArticleCard key={a.id} article={a} bookmarked={bookmarks.includes(a.id)} read={read.includes(a.id)} onPress={() => router.push({ pathname: '/article/[id]', params: { id: a.id } })} />
      )) : <EmptyState glyph="🔖" title="Nothing saved yet" body="Tap the bookmark on any article to keep it here." />}
    </Screen>
  );
}
