# katakana-translate

日本語をわかりやすく同時翻訳するWebアプリ

## 使い方

### テキスト入力

1. [このページ](https://tamakagi-14-it-11.github.io/katakana-translate/text-input/)にアクセス
2. 左上のドロップダウンメニューから変換したい言葉の種類を設定
3. 左（または上）側のテキストボックスに変換したい文章や単語を入力
4. 右（または下）側のテキストボックスに変換されて表示される

### 音声入力

1. [このページ](https://tamakagi-14-it-11.github.io/katakana-translate/voice-input/)にアクセス
2. 左上のドロップダウンメニューから変換したい言葉の種類を設定
3. 赤いボタンをクリック
4. マイクの使用を許可するか聞かれたら、許可
5. 話した内容が画面に表示される
6. 表示された内容が自動的に翻訳されて表示される

### 画像入力

1. [このページ](https://tamakagi-14-it-11.github.io/katakana-translate/image-input/)にアクセス
2. `画像をアップロード` と書かれたボタンをクリック
3. 変換したい文章または単語が含まれている画像をアップロード
4. 検出された文字列が翻訳されて表示される

## AI翻訳について

テキスト入力,音声入力ではAIを利用した高度な翻訳が可能です。左上のチェックボックスから有効化できます。

## セルフホストする方法

1. 任意のWebサーバーにコードをすべて配置
2. [ここ](https://github.com/tamakagi-14-it-11/katakana-translate-api?tab=readme-ov-file#katakana-translate-api)の指示に従ってAPIサーバーを起動
3. `common.js` の **2行目** にAPIサーバーのURLを書き換え

IPアドレスが `127.0.0.1` で、ポートがデフォルト( `5000` )の場合

```diff
//定数の宣言
- const apiUrl = "https://api.tkg14it11.f5.si/api2/";
+ const apiUrl = "http://127.0.0.1:5000/api2/";
```

4. Webサーバーにアクセスし、AI翻訳の動作を確認
