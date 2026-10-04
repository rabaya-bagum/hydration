import { Pressable, View } from 'react-native';
import { radius, shadow, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { ARTICLE_CATEGORIES, type Article } from '@/content/articles';
import { ArtTile } from './ArtTile';
import { Text } from './Text';

interface Props { article: Article; bookmarked: boolean; read: boolean; onPress: () => void }

export function ArticleCard({ article, bookmarked, read, onPress }: Props) {
  const { colors } = useTheme();
  const cat = ARTICLE_CATEGORIES.find((c) => c.id === article.category)!;
  return (
    <Pressable testID={`article-${article.id}`} accessibilityRole="button" onPress={onPress}
      accessibilityLabel={`${article.title}. ${article.summary} ${cat.label}, ${article.readMinutes} minute read.${read ? ' Read.' : ''}${bookmarked ? ' Bookmarked.' : ''}`}
      style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, minHeight: touch.large }, shadow.card]}>
      <ArtTile glyph={article.glyph} color={cat.color} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="caption" bold color={cat.color}>{cat.label.toUpperCase()}</Text>
        <Text bold variant="title">{article.title}</Text>
        <Text variant="small" muted numberOfLines={2}>{article.summary}</Text>
        <Text variant="caption" muted>{article.readMinutes} min read{read ? ' · ✓ Read' : ''}{bookmarked ? ' · 🔖' : ''}</Text>
      </View>
    </Pressable>
  );
}
