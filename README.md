# rubygana

漢字にルビ(ふりがな)を付けちゃうぞ。

- HTML
- テキスト文書
- マークダウン


### <ruby>ルビ族のルビ族によるルビ族のためのコマンド<rt>ルビ族女帝にあたいはなるっ!</rt></ruby>

- 漢字を学び始めた人
- 教育関係者、出版社
- ルビ付きHTMLを迫られて悩むエンジニア

ルビ族以外もどうぞ!


## 特徴(rubygana 0.3.2)

1. ##### HTMLのルビ化
   `<ruby><rb>蝙蝠</rb><rt>こうもり</rt></ruby>`

2. ##### テキスト文書のルビ化
    `蝙蝠(こうもり)`

3. ##### ルビ化ずみHTMLに学年クラス名挿入
    `<ruby class="学年3 学年1"><rb>落下</rb><rt>らっか</rt></ruby>`

4. ##### マークダウンのHTML5化

5. ##### テキスト文書のHTML5化


#### ルビの調整

- ルビ指定: 自動のルビが不味いときは指定  
`猫の一撃(ネコパーンチ)`

- 学年指定: 自動ルビ化の範囲を小学3年以降とか常用漢字以外などに  
`猫が蝙蝠(こうもり)を食べるの?`

- CSSセレクタ: ルビ化の範囲を絞り込み  
`div.クラス>p`

- ルビの粒度  
`お気(き)に入(い)り`or`お気に入(きにい)り`or`お気に入り(おきにいり)`

- カタカナルビ  
`アリスはそう呟(ツブヤ)いた。`

- 他に、括弧の変更やrp要素の使用など


-------------------------------------------------

## インストール

なんとかして`git`と`npm`コマンドの環境を入れたあと、こうする。

    # 任意のディレクトリで、ダウンロード
    git clone https://github.com/big-stream/rubygana.git

    # インストール(依存ライブラリのダウンロード)
    cd rubygana/
    npm install --global

    # もうrubyganaコマンドが使えるぞ
    rubygana --help


#### 依存ライブラリに感謝

- 日本語解析: [kuromoji.js][]
- マークダウンのタグ化: [marked][]
- HTML解析: [cheerio][]


### オープンソース

MIT License  
©  2018 ころん:すとりーむ


-------------------------------------------------

## 使用法

    rubygana [オプション...] [ファイル]

一つのファイル指定か標準入力が必要で、結果はすべて標準出力。

    echo '猫と蝙蝠' | rubygana

    # 出力
    猫(ねこ)と蝙蝠(こうもり)

ルビ化の際、kuromoji.jsのビルドに1、2秒かかります。


-------------------------------------------------

## オプション

1. ### HTMLのルビ化: --html
       rubygana [-HKCy] [-b 括弧] [-g 学年] [-G 粒度]
                [-s セレクタ] [-n 除外セレクタ] [-N 除外要素]
                [--ruby [フレーズ:]単語:ルビ] [--ruby-comma]
                [-c [CSS]] [-T タイトル] [--ruby-size [フォント倍率]] [ファイル]

2. ### テキスト文書のルビ化: --text
       rubygana [-tKC] [-b 括弧] [-g 学年] [-G 粒度] [--ruby-comma]
                [--ruby [フレーズ:]単語:ルビ] [ファイル]

3. ### 学年クラス名付加: --add-class
       rubygana -a [-y] [クラス頭語] [-c [CSS]] [-s セレクタ]
                [-n 除外セレクタ] [ファイル]

4. ### マークダウンのHTML5化: --md-html
       rubygana -m [-c [CSS]] [-T タイトル] [-L 見出し] [ファイル]

5. ### テキスト文書のHTML5化: --text-html
       rubygana -w [-c [CSS]] [-T タイトル] [-L 見出し] [ファイル]


その他オプション(引数なし):  

    -A, --sample-text   サンプルテキスト出力  
    -B, --sample-html   サンプルHTML出力  
    -M, --sample-md     サンプルマークダウン出力
    -d, --debug         デバッグ用  
    -h, --help          ヘルプ  
    -v, --verbose       デバッグ情報を増やす  
    -V, --version       バージョン情報  
    -い, --依存          依存ライブラリ確認  
    -ら, --ライセンス     ライセンス情報  
    -☺ , --感謝


-------------------------------------------------

### コマンドグループ:


#### `--html, -H`

HTML扱いしてルビ化。冒頭にDOCTYPEやxml宣言があれば自動判別のため、省略可。  

    # DOCTYPEやxml宣言がないのにHTML扱いしたい場合
    echo '蝙蝠なの?' | rubygana -H --only-body

    # 出力
    <ruby><rb>蝙蝠</rb><rt>こうもり</rt></ruby>なの?


#### `--text, -t`

テキスト扱いしてルビ化。

    # DOCTYPEやxml宣言あるのにテキスト扱いしたい場合
    echo '<!DOCTYPE html><html><body>蝙蝠なの?</body></html>' | rubygana -t

    # 出力
    <!DOCTYPE html><html><body>蝙蝠(こうもり)なの?</body></html>



#### `--add-class, -a ['クラス頭語']`

漢字の学習学年をruby要素のクラス名に付加。すでにruby要素があるHTMLに対してこの動作だけを行い、新たなルビ化はしない。学年別に色分けしたいとか。  
デフォルト: `学年`

    # 「落」は3年生、「下」は1年生なので
    echo '落下' | rubygana -H | rubygana -a --only-body

    # 出力
    <ruby class="学年3 学年1"><rb>落下</rb><rt>らっか</rt></ruby>

    # 中学生以降は「学年7」、常用漢字以外の漢字は「学年8」


#### `--md-html, -m`

ルビ化はせず、単にマークダウンをHTML5文書に変換。h1要素になるものをタイトル(title要素)にする。変更は`--headline`と`--title`


#### `--text-html, -w`

ルビ化はせず、単にテキスト文書をHTML5文書に変換。テキストは行ごとにp要素に入れ(空行は対象外)、冒頭の行を見出し(h1要素)とタイトル(title要素)にする。変更は`--headline`と`--title`


-------------------------------------------------

#### `--sample-text, -A`

練習用サンプルとして、ルビのない下記3行テキストを標準出力。

    不思議の国のアリス
    「猫が蝙蝠を食べるの? 蝙蝠が猫を食うの?」
    アリスは白ウサギの穴に落下しながら呟いた。すると突然…


#### `--sample-html, -B`

練習用サンプルとして、ルビのないHTMLを標準出力。


#### `--sample-md, -M`

練習用サンプルとして、ルビのないマークダウンを標準出力。


-------------------------------------------------

### ルビの調整:


#### `--ruby '[フレーズ:]単語:ルビ'`

ルビを指定したいなら。フレーズ(改行なし)で、フレーズ内の単語のみに作用。マッチした単語には`--grade`など自動ルビ用オプションの影響なし。

    # 自動のルビが不味いときや、工夫したいときに使う。
    echo '反復横飛びの無限反復' | rubygana -r '無限反復:反復:ループ'

    # 出力
    反復(はんぷく)横(よこ)飛(と)びの無限(むげん)反復(ループ)


    # --rubyはいくつも使用できるが、同じフレーズ・単語は先のものが優先
    echo 猫と蝙蝠 | rubygana -r '猫:cat' -r '猫:きゃっと' -r '蝙蝠:bat'

    # 出力
    猫(cat)と蝙蝠(bat)


    # --htmlでも
    echo '猫の一撃をくらった' | rubygana --html -r '猫の一撃:ネコパーンチ' --only-body

    # 出力
    <ruby><rb>猫の一撃</rb><rt>ネコパーンチ</rt></ruby>をくらった


#### `--ruby-comma`

`--ruby`の引数の区切りを:から,にしたいとき。

    echo 'ねえ、:コマンドって知ってる?' | rubygana -r ':,コロン' --ruby-comma

    # 出力
    ねえ、:(コロン)コマンドって知(し)ってる?


#### `--grade, -g '学年'`

この学年までの漢字はルビ化しない。0-7を指定。2なら3年生以降の、6なら中学校(常用漢字の残り)以降の、7で常用漢字以外の漢字をルビ化。  
デフォルト: `0`

    # 常用漢字以外だけルビ化なら7
    rubygana --sample-text | rubygana -g 7

    # 出力
    不思議の国のアリス
    「猫が蝙蝠(こうもり)を食べるの? 蝙蝠(こうもり)が猫を食うの?」
    アリスは白ウサギの穴に落下しながら呟(つぶや)いた。すると突然…


学年の判断は、文科省[学年別漢字配当表][]、文化庁[常用漢字表][]による。


#### `--granularity, -G '粒度'`

かな交じり単語のルビの振り方の調整。0-2を指定。例えば「お気に入り」は1単語であり、  
0=> `お気(き)に入(い)り`  
1=> `お気に入(きにい)り`  
2=> `お気に入り(おきにいり)`  
デフォルト: `0`


    echo 'お気に入り' | rubygana --html -G 2 --only-body

    # 出力
    <ruby><rb>お気に入り</rb><rt>おきにいり</rt></ruby>


#### `--brackets, -b '括弧'`

括弧を変更したいなら。例 '[]'  
デフォルト: `()`

    # 指定文字が奇数個なら、左側に一つ多く配分
    echo '蝙蝠' | rubygana -b '(=)'

    # 出力
    蝙蝠(=こうもり)


#### `--katakana, -K`
カタカナのルビに(デフォルトはひらがな)

    echo 'アリスはそう呟いた。すると突然…' | rubygana --katakana
    => アリスはそう呟(ツブヤ)いた。すると突然(トツゼン)…


-------------------------------------------------

### HTMLの調整:

セレクタと除外セレクタは[cheerio][]による。

#### `--only-body, -y`

body要素の中身だけ出力(bodyタグ含まず)(`--comment`は出力)。以下例でも多用。


####  `--selector, -s 'セレクタ'`

この要素の子孫をルビ化。これに該当した要素(のうち)そのものを`--not-selector`なら除外できるが、`--ng-elements`では除外できない。  
例: `#id, p.クラス, ol>li:nth-child(1)`  
デフォルト: `body`

    # ol要素直下の1番目li要素と、文クラスのp要素だけルビ化
    rubygana --sample-html | rubygana -s 'ol>li:nth-child(1), p.文'


    # 「要素>*」にすると、要素直下の漢字は対象にならない
    echo '<p>猫と<span>蝙蝠</span></p>' | rubygana --html -s 'p>*' --only-body

    # 出力
    <p>猫と<span><ruby><rb>蝙蝠</rb><rt>こうもり</rt></ruby></span></p>


####  `--not-selector, -n '除外セレクタ'`

`-s`そのものから除外(子孫を除外するのではない)。`-s`のデフォルトはbodyなので、`-s`と一緒に使う。  
例: `li.クラス`  
デフォルト(`-h`の時): `ruby,script,style,code,pre,samp,blockquote`  
デフォルト(`-a`の時): 空

    # p要素をルビ化したいが、そのうち無視クラスを除外したいとき
    echo '<p class="無視">猫</p><p>蝙蝠</p>' | rubygana --html -s 'p' -n '.無視' --only-body

    # 出力
    <p class="無視">猫</p><p><ruby><rb>蝙蝠</rb><rt>こうもり</rt></ruby></p>


    # 該当した`-s`そのもの(と子孫)を除外できるが、該当しなかった`-s`の子孫は除外できない
    echo '<div><p>猫</p></div><p>蝙蝠</p>' | rubygana --html -s 'body>*' -n 'p' --only-body

    # 出力
    <div><p><ruby><rb>猫</rb><rt>ねこ</rt></ruby></p></div><p>蝙蝠</p>


#### `--ng-elements, -N '除外要素'`

`-s`の子孫から除外する要素を`|`区切りで。`-s`そのものから除外するには、`--not-selector`  
デフォルト: `ruby|script|style|code|pre|samp|blockquote`

    # 絶対に除外したい要素で使う。(最低限scriptとstyleは除外推奨)
    echo '<p>猫と<a>蝙蝠</a></p>' | rubygana --html -N 'a' --only-body

    # 出力
    <p><ruby><rb>猫</rb><rt>ねこ</rt></ruby>と<a>蝙蝠</a></p>


#### `--css, -c ['CSS']`

head要素末尾にstyle要素追加。そのCSSを指定。引数省略で下記デフォルトCSS。

- `--html`のとき、ルビのフォントサイズ(漢字に対する倍率)を0.5(又は--ruby-size)倍に。
   - `ruby>rp,ruby>rt{font-size:0.5em;}`
- `--add-class`のとき、常用漢字以外の漢字のルビの色をDarkRedに。
   - `ruby[class$="8"]>rt{color:DarkRed;}`
- `--text-html`と`--md-html`のとき、空(のstyle要素)


#### `--ruby-size [フォント倍率]`
head要素末尾に下記style要素追加。ルビのフォントサイズ(漢字に対する倍率): 0.1-2.0(デフォルト0.5)
   - `ruby>rp,ruby>rt{font-size:倍率em;}`


#### `--use-rp`

rp要素(ルビ非対応ブラウザのための括弧書き)を使用する。

    echo 猫なの? | rubygana -H --use-rp --only-body

     # 出力
    <ruby><rb>猫</rb><rp>(</rp><rt>ねこ</rt><rp>)</rp></ruby>なの?


#### `--title, -T 'タイトル'`

title要素の内容。


#### `--headline, -L '見出し'`

h1要素の内容。`--text-html`と`--md-html`で使う。


-------------------------------------------------

### その他:


#### `--comment, -C`

`--html`か`--text`のとき、文書末尾に下記3行挿入。HTMLの場合はソースからなら確認できるコメント。

    <!-- この文書のルビ振りは下記コマンド(rubygana VERSION)を用いました。
    (2行目に実際に実行したコマンドオプション・引数が入る)
    -->


#### `--debug, -d`

開発用オプション。kuromojiによる解析詳細(形態素)などが確認できる。`-dd`でオプション引数の確認だけして終了。


#### `--verbose, -v`

開発用オプション。debug情報を増やす。



-------------------------------------------------

## 1行ルビ族

    # ダウンロードし、ルビ化し、firefoxで開く
    page='ja.wikipedia.org/wiki/不思議の国のアリス'; wget --page-requisites --convert-links "https://$page" && rubygana $page > $page.ruby.html; firefox $page.ruby.html &


    # 入力の文字コードはUTF-8のみ受付:
    # 違うならiconvコマンドなどで変換してから
    cat shift-jis.txt | iconv -f 'shift-jis' -t 'utf8' | rubygana
    # (標準出力の文字コードは端末の設定で変更)


    # サンプルテキストを出力し、それをHTML化し、次にh1だけカタカナでルビ振りし、そしてp要素を2年生超でルビ振りし、
    # そして学年クラス名を付加して中学生以上常用漢字ルビは青色で常用漢字以外ルビは赤色スタイルにして、
    # それをalice.htmlとして保存し、それをFirefoxで開く。
    rubygana -A | rubygana -w | rubygana -HKs 'h1' | rubygana -s 'p' -g 2 | rubygana -ac 'ruby[class$="7"]>rt{color:blue;}ruby[class$="8"]>rt{color:red;}' > alice.html; firefox alice.html &



-------------------------------------------------

[kuromoji.js]: https://www.npmjs.com/package/kuromoji

[marked]: https://www.npmjs.com/package/marked

[cheerio]: https://www.npmjs.com/package/cheerio

[学年別漢字配当表]: http://www.mext.go.jp/a_menu/shotou/new-cs/youryou/syo/koku/001.htm

[常用漢字表]: http://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/
