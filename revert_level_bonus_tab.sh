#!/bin/bash
# レベルボーナスタブの「共通」選択肢の値を元に戻す
sed -i '429s/value="common"/value=""/' client/src/components/admin/LevelBonusTab.tsx
sed -i '567s/value="common"/value=""/' client/src/components/admin/LevelBonusTab.tsx
sed -i '675s/value="common"/value=""/' client/src/components/admin/LevelBonusTab.tsx