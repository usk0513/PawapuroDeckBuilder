// Seed special abilities script
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

// 投手の金特殊能力
const pitcherSpecialAbilities = [
  { 
    name: "直球○", 
    description: "直球の威力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "重い球", 
    description: "直球の体感速度がアップする", 
    playerType: "投手" 
  },
  { 
    name: "奪三振", 
    description: "三振を取る確率がアップする", 
    playerType: "投手" 
  },
  { 
    name: "リリース○", 
    description: "リリースポイントが高くなり、打ちにくくなる", 
    playerType: "投手" 
  },
  { 
    name: "鉄腕", 
    description: "球持ちが良くなり、連投が効きやすくなる", 
    playerType: "投手" 
  },
  { 
    name: "コントロール○", 
    description: "コントロールの精度がアップする", 
    playerType: "投手" 
  },
  { 
    name: "ノビ○", 
    description: "投じた球がバッターから見づらくなる", 
    playerType: "投手" 
  },
  { 
    name: "キレ○", 
    description: "変化球の切れ味がよくなる", 
    playerType: "投手" 
  },
  { 
    name: "尻上がり", 
    description: "イニングが進むごとに投球の威力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "逃げ球", 
    description: "2ストライク後の勝負強さがアップする", 
    playerType: "投手" 
  },
  { 
    name: "クイック○", 
    description: "投手のクイック能力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "牽制○", 
    description: "牽制の精度がアップする", 
    playerType: "投手" 
  },
  { 
    name: "サイド○", 
    description: "サイドスローでの能力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "アンダー○", 
    description: "アンダースローでの能力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "起死回生", 
    description: "無死満塁などのピンチで能力を発揮する", 
    playerType: "投手" 
  },
  { 
    name: "イニング○", 
    description: "1イニングを守りきる能力がアップする", 
    playerType: "投手" 
  },
  { 
    name: "打たせ◯", 
    description: "打たせて取るのが上手くなる", 
    playerType: "投手" 
  },
  { 
    name: "緩急○", 
    description: "緩急の使い分けが上手くなる", 
    playerType: "投手" 
  }
];

// 野手の金特殊能力
const batterSpecialAbilities = [
  { 
    name: "広角打法", 
    description: "全方向への打球が飛びやすくなる", 
    playerType: "野手" 
  },
  { 
    name: "チャンスメイカー", 
    description: "出塁率が上がり、チャンスを作りやすくなる", 
    playerType: "野手" 
  },
  { 
    name: "パワーヒッター", 
    description: "長打力がアップする", 
    playerType: "野手" 
  },
  { 
    name: "プルヒッター", 
    description: "引っ張った打球が飛びやすくなる", 
    playerType: "野手" 
  },
  { 
    name: "固め打ち", 
    description: "得意なコースへの打球が飛びやすくなる", 
    playerType: "野手" 
  },
  { 
    name: "粘り打ち", 
    description: "粘り強く打ち合えるようになる", 
    playerType: "野手" 
  },
  { 
    name: "選球眼", 
    description: "ボールとストライクの見極めが上手くなる", 
    playerType: "野手" 
  },
  { 
    name: "バント○", 
    description: "バントの精度が上がる", 
    playerType: "野手" 
  },
  { 
    name: "流し打ち", 
    description: "流し打ちが上手くなる", 
    playerType: "野手" 
  },
  { 
    name: "逆方向", 
    description: "逆方向への打球が飛びやすくなる", 
    playerType: "野手" 
  },
  { 
    name: "満塁男", 
    description: "満塁時に能力を発揮する", 
    playerType: "野手" 
  },
  { 
    name: "チャンス○", 
    description: "走者有りの時に能力を発揮する", 
    playerType: "野手" 
  },
  { 
    name: "初球○", 
    description: "初球打ちの成功率がアップする", 
    playerType: "野手" 
  },
  { 
    name: "盗塁○", 
    description: "盗塁の成功率がアップする", 
    playerType: "野手" 
  },
  { 
    name: "走塁○", 
    description: "ベースランニングが上手くなる", 
    playerType: "野手" 
  },
  { 
    name: "ヘッスラ", 
    description: "ヘッドスライディングが上手くなる", 
    playerType: "野手" 
  },
  { 
    name: "軽打○", 
    description: "軽打の精度が上がる", 
    playerType: "野手" 
  },
  { 
    name: "内野安打○", 
    description: "内野安打の出やすさがアップする", 
    playerType: "野手" 
  },
  { 
    name: "守備職人", 
    description: "守備能力が飛躍的にアップする", 
    playerType: "野手" 
  },
  { 
    name: "ブロック", 
    description: "捕手としてのブロック能力がアップする", 
    playerType: "野手" 
  },
  { 
    name: "キャッチャー○", 
    description: "捕手としての能力がアップする", 
    playerType: "野手" 
  },
  { 
    name: "送球○", 
    description: "送球の精度がアップする", 
    playerType: "野手" 
  },
  { 
    name: "ホーム死守", 
    description: "本塁での守備能力がアップする", 
    playerType: "野手" 
  },
  { 
    name: "代打○", 
    description: "代打での能力がアップする", 
    playerType: "野手" 
  },
  { 
    name: "高速チャージ", 
    description: "内野でのボールさばきが速くなる", 
    playerType: "野手" 
  },
  { 
    name: "レーザービーム", 
    description: "遠投能力が飛躍的にアップする", 
    playerType: "野手" 
  },
  { 
    name: "ダッシュ", 
    description: "走りだしが早くなる", 
    playerType: "野手" 
  }
];

async function seedSpecialAbilities() {
  // Create a new client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if special abilities already exist
    const checkRes = await client.query('SELECT COUNT(*) FROM special_abilities');
    const count = parseInt(checkRes.rows[0].count);
    
    if (count > 0) {
      console.log(`${count} special abilities already exist in database. Skipping seeding.`);
      return;
    }

    console.log('Seeding pitcher special abilities...');
    for (const ability of pitcherSpecialAbilities) {
      await client.query(
        'INSERT INTO special_abilities (name, description, player_type) VALUES ($1, $2, $3)',
        [ability.name, ability.description, ability.playerType]
      );
    }
    console.log(`Inserted ${pitcherSpecialAbilities.length} pitcher special abilities`);

    console.log('Seeding batter special abilities...');
    for (const ability of batterSpecialAbilities) {
      await client.query(
        'INSERT INTO special_abilities (name, description, player_type) VALUES ($1, $2, $3)',
        [ability.name, ability.description, ability.playerType]
      );
    }
    console.log(`Inserted ${batterSpecialAbilities.length} batter special abilities`);

    console.log('All special abilities seeded successfully');
  } catch (err) {
    console.error('Error seeding special abilities:', err);
  } finally {
    // Close the client
    await client.end();
    console.log('Connection closed');
  }
}

seedSpecialAbilities().catch(console.error);