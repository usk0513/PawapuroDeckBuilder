// ESモジュール形式
import { db } from '../server/db.js';
import { specialAbilities, PlayerType } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

/**
 * オリジナル変化球を追加するスクリプト
 */
async function addOriginalPitches() {
  console.log('オリジナル変化球を追加中...');

  const originalPitches = [
    {
      name: 'オリジナル変化球(ストレート系)',
      description: 'オリジナルのストレート系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(スライダー系)',
      description: 'オリジナルのスライダー系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(カーブ系)',
      description: 'オリジナルのカーブ系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(シュート系)',
      description: 'オリジナルのシュート系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(シンカー系)',
      description: 'オリジナルのシンカー系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(フォーク系)',
      description: 'オリジナルのフォーク系変化球を習得します',
      playerType: PlayerType.PITCHER
    },
    {
      name: 'オリジナル変化球(任意変化系)',
      description: 'オリジナルの任意変化系変化球を習得します',
      playerType: PlayerType.PITCHER
    }
  ];

  for (const pitch of originalPitches) {
    // 既存のものがあるか確認
    const existing = await db.select().from(specialAbilities).where(eq(specialAbilities.name, pitch.name));
    
    if (existing.length === 0) {
      // 存在しない場合は追加
      await db.insert(specialAbilities).values(pitch);
      console.log(`追加しました: ${pitch.name}`);
    } else {
      console.log(`既に存在します: ${pitch.name}`);
    }
  }

  console.log('オリジナル変化球の追加が完了しました');
}

// スクリプト実行
addOriginalPitches()
  .catch(console.error)
  .finally(() => process.exit(0));