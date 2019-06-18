/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

const readme = __dirname.slice(0, -3) + 'README.md'
const バージョン = '0.7.3'

exports.バージョン = バージョン

exports.コマンド説明 = `rubygana ${バージョン}
MIT License  
©  2018 ころん:すとりーむ

漢字にルビ(ふりがな)を付けちゃうぞ。結果は標準出力。

使用法: rubygana [オプション...] [--] [ファイル]

オプション:
 -H, --html: HTMLのルビ化
rubygana [-HKCy] [-g 学年] [-G 粒度]
         [-s セレクタ] [-n 除外セレクタ] [-N 除外要素]
         [-c [CSS]] [-T タイトル] [--ruby-size [フォント倍率]]
         [--ruby [フレーズ:]単語:ルビ]
         [--ruby-re 正規表現:単語:ルビ] [ファイル]

 -t, --text: テキスト文書のルビ化
rubygana [-tKC] [-b 括弧] [-g 学年] [-G 粒度]
         [--ruby [フレーズ:]単語:ルビ]
         [--ruby-re 正規表現:単語:ルビ] [ファイル]

 -a, --add-class: 学年クラス名付加
rubygana -a [-y] [クラス頭語] [-c [CSS]] [--switch]
         [-s セレクタ] [-n 除外セレクタ] [ファイル]

 -m, --md-html: マークダウンのHTML5化
rubygana -m [-c [CSS]] [-T タイトル] [-L 見出し] [ファイル]

 -w, --text-html: テキスト文書のHTML5化
rubygana -w [-c [CSS]] [-T タイトル] [-L 見出し] [ファイル]

ルビ調整:
 -b, --brackets		括弧変更
 -g, --grade		この学年までルビ化せず(0-7)
 -G, --granularity	ルビ粒度(0-2): 例「お気に入り」でtry
 -r, --ruby		ルビ指定、複数可、フレーズで絞り込み
 --ruby-comma		-rの代わりに(引数が,区切りの場合)
 --ruby-re		正規表現でルビ指定、複数可
 -K, --katakana		ルビをカナカタに

HTML調整:
 -y, --only-body	body要素の中だけ出力
 -s, --selector		CSSセレクタ(cheerio)
 -n, --not-selector	-sそのものから除く
 -N, --ng-elements	ルビ化したくない要素を|区切りで
 -c, --css		style要素
 --ruby-size		フォント倍率
 --use-rp		rp要素使用
 -T, --title		title要素
 -L, --headline		h1要素
 --switch		ページトップにルビの学年スイッチ

その他:  
 -A, --sample-text	サンプルテキスト出力
 -B, --sample-html	サンプルHTML出力
 -M, --sample-md	サンプルマークダウン出力
 -C, --comment		rubygana実行のコメントを末尾に付加
 -d, --debug		デバッグ用、-ddでオプション確認のみ
 -h, --help		このヘルプ
 --readme-md		詳細ヘルプ(マークダウン)
 --readme-html		詳細ヘルプ(HTML)
 -v, --verbose		デバッグ情報を増やす
 -V, --version		バージョン情報
 -い, --依存		依存ライブラリ確認
 -ら, --ライセンス	ライセンス情報
 -☺ , --感謝

詳細:
${readme}`
