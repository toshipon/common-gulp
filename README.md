# common-gulp
gulpの共通タスク集  

# Usage
```bash
$ npm install --save-dev git://github.com/feb0223/common-gulp.git
```
OR  
```json
"devDependencies": {
  "common-gulp": "git@github.com:feb0223/common-gulp.git"
}
```

## Stylus
指定したsrcDirの中から_で始まらないstylファイルを対象にコンパイルを実施する。  
autoprefixerの設定も同時に可能。  

## Webpack
指定したsrcDirの中から_で始まらないjsファイルを対象にコンパイルを実施する。  
uglifyでの圧縮も可能。（compressオプションがtrueのときのみ）

## Aeromock
Aeromockの起動制御。  
node内の子プロセスとしてAeromockのプロセスを立ち上げる。  

## Sprite
指定したsrcDirの中の画像ファイルを元にスプライト画像とcssを生成。  

## Webserver
指定したrootDirをルートとしてwebserverを起動。  

## Rsync
指定したサーバーとのrsyncを実行。  
秘密鍵の設定は~/.ssh/configに記載する前提。  

## Freemarker
config.ymlの設定通りにftlファイルをhtmlにコンパイルする。  

## FreemarkerServer
サーバーを起動し、config.ymlの設定通りのパスにftlのコンパイル結果を返す。  
