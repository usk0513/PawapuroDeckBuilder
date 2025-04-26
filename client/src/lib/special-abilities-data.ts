import { PlayerType } from "@shared/schema";

// 投手の金特殊能力
export const pitcherSpecialAbilities = [
  { 
    name: "直球○", 
    description: "直球の威力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "重い球", 
    description: "直球の体感速度がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "奪三振", 
    description: "三振を取る確率がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "リリース○", 
    description: "リリースポイントが高くなり、打ちにくくなる", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "鉄腕", 
    description: "球持ちが良くなり、連投が効きやすくなる", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "コントロール○", 
    description: "コントロールの精度がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "ノビ○", 
    description: "投じた球がバッターから見づらくなる", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "キレ○", 
    description: "変化球の切れ味がよくなる", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "尻上がり", 
    description: "イニングが進むごとに投球の威力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "逃げ球", 
    description: "2ストライク後の勝負強さがアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "クイック○", 
    description: "投手のクイック能力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "牽制○", 
    description: "牽制の精度がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "サイド○", 
    description: "サイドスローでの能力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "アンダー○", 
    description: "アンダースローでの能力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "起死回生", 
    description: "無死満塁などのピンチで能力を発揮する", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "イニング○", 
    description: "1イニングを守りきる能力がアップする", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "打たせ◯", 
    description: "打たせて取るのが上手くなる", 
    playerType: PlayerType.PITCHER 
  },
  { 
    name: "緩急○", 
    description: "緩急の使い分けが上手くなる", 
    playerType: PlayerType.PITCHER 
  }
];

// 野手の金特殊能力
export const batterSpecialAbilities = [
  { 
    name: "広角打法", 
    description: "全方向への打球が飛びやすくなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "チャンスメイカー", 
    description: "出塁率が上がり、チャンスを作りやすくなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "パワーヒッター", 
    description: "長打力がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "プルヒッター", 
    description: "引っ張った打球が飛びやすくなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "固め打ち", 
    description: "得意なコースへの打球が飛びやすくなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "粘り打ち", 
    description: "粘り強く打ち合えるようになる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "選球眼", 
    description: "ボールとストライクの見極めが上手くなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "バント○", 
    description: "バントの精度が上がる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "流し打ち", 
    description: "流し打ちが上手くなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "逆方向", 
    description: "逆方向への打球が飛びやすくなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "満塁男", 
    description: "満塁時に能力を発揮する", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "チャンス○", 
    description: "走者有りの時に能力を発揮する", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "初球○", 
    description: "初球打ちの成功率がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "盗塁○", 
    description: "盗塁の成功率がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "走塁○", 
    description: "ベースランニングが上手くなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "ヘッスラ", 
    description: "ヘッドスライディングが上手くなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "軽打○", 
    description: "軽打の精度が上がる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "内野安打○", 
    description: "内野安打の出やすさがアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "守備職人", 
    description: "守備能力が飛躍的にアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "ブロック", 
    description: "捕手としてのブロック能力がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "キャッチャー○", 
    description: "捕手としての能力がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "送球○", 
    description: "送球の精度がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "ホーム死守", 
    description: "本塁での守備能力がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "代打○", 
    description: "代打での能力がアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "高速チャージ", 
    description: "内野でのボールさばきが速くなる", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "レーザービーム", 
    description: "遠投能力が飛躍的にアップする", 
    playerType: PlayerType.BATTER 
  },
  { 
    name: "ダッシュ", 
    description: "走りだしが早くなる", 
    playerType: PlayerType.BATTER 
  }
];