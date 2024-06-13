export function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
          );
      }
  }

  return dp[m][n];
}

// Improved Fuzzy Search
export function fuzzySearch(query, items, threshold = 3) {
  if (!query.trim()) {
      // Arama sorgusu yoksa tüm öğeleri döndürür
      return items;
  }

  const lowerCaseQuery = query.toLowerCase();
  const queryWords = lowerCaseQuery.split(' ');

  const filteredItems = items.filter(item => {
      const itemString = item.name.toLowerCase();
      const itemWords = itemString.split(' ');

      // Calculate minimum distance for each query word against item words
      let minDistance = Infinity;
      queryWords.forEach(queryWord => {
          itemWords.forEach(itemWord => {
              const distance = levenshteinDistance(queryWord, itemWord);
              if (distance < minDistance) {
                  minDistance = distance;
              }
          });
      });

      return minDistance <= threshold;
  });

  return filteredItems;
}