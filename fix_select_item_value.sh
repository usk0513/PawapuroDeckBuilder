#!/bin/bash
# SelectItemの空文字列の値を"_all"に変更
sed -i '429s/value=""/value="_all"/' client/src/components/admin/LevelBonusTab.tsx
sed -i '567s/value=""/value="_all"/' client/src/components/admin/LevelBonusTab.tsx
sed -i '675s/value=""/value="_all"/' client/src/components/admin/LevelBonusTab.tsx