#!/bin/bash
sed -i '429s/<SelectItem value="">共通<\/SelectItem>/<SelectItem value="common">共通<\/SelectItem>/' client/src/components/admin/LevelBonusTab.tsx
sed -i '567s/<SelectItem value="">共通<\/SelectItem>/<SelectItem value="common">共通<\/SelectItem>/' client/src/components/admin/LevelBonusTab.tsx
sed -i '675s/<SelectItem value="">共通<\/SelectItem>/<SelectItem value="common">共通<\/SelectItem>/' client/src/components/admin/LevelBonusTab.tsx