import { useEffect } from 'react';
import { Linking, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArtTile } from '@/components/ArtTile';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { ARTICLE_CATEGORIES, getArticle } from '@/content/articles';
import { spacing } from '@/design/tokens';
import { analytics } from '@/services/analytics';
import { useRewardsStore } from '@/store/rewardsStore';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = getArticle(String(id));
  const bookmarked = useRewardsStore((s) => s.bookmarks.includes(String(id)));
  useEffect(() => {
    if (!article) return;
    useRewardsStore.getState().markRead(article.id);
    analytics.track('article_opened', { id: article.id });
  }, [article]);
  if (!article) return <Screen><ScreenHeader back title="Article" /><EmptyState title="Article not found" /></Screen>;
  const cat = ARTICLE_CATEGORIES.find((c) => c.id === article.category)!;
  return (
    <Screen>
      <ScreenHeader back title="" right={<IconButton glyph={bookmarked ? '🔖' : '📑'} label={bookmarked ? 'Remove bookmark' : 'Bookmark article'} filled onPress={() => useRewardsStore.getState().toggleBookmark(article.id)} testID="bookmark" />} />
      <View style={{ gap: spacing.md }}>
        <ArtTile glyph={article.glyph} color={cat.color} size={96} />
        <Text variant="caption" bold color={cat.color}>{cat.label.toUpperCase()} · {article.readMinutes} MIN READ</Text>
        <Text variant="h1" accessibilityRole="header">{article.title}</Text>
        <Text variant="title" muted>{article.summary}</Text>
        {article.body.map((p, i) => <Text key={i} style={{ lineHeight: 24 }}>{p}</Text>)}
        {article.sources?.length ? (
          <View style={{ gap: spacing.xs }}>
            <Text variant="small" bold muted>Sources</Text>
            {article.sources.map((s) => <Button key={s.url} kind="ghost" label={s.label} onPress={() => Linking.openURL(s.url)} />)}
          </View>
        ) : null}
        <Text variant="caption" muted>General wellness information, not medical advice.</Text>
      </View>
    </Screen>
  );
}
