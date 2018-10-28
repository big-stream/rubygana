#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

version=$1
[[ $version =~ ^[0-9]\.[0-9]\.[0-9]$ ]] || exit 1


readme='rubygana [0-9]\.[0-9]\.[0-9]'
sed -i "s/$readme/rubygana $version/" README.md

help="'[0-9]\.[0-9]\.[0-9]'"
sed -i "s/$help/'$version'/" lib/help.js

package='"[0-9]\.[0-9]\.[0-9]"'
sed -i "s/$package/\"$version\"/" package.json

check=$( rubygana --readme-html | tee README.md.rubygana.html | md5sum )
sed -i "s/^md5=.*/md5='$check'/" scripts/minitest.sh

echo "バージョン書き換え完了:"
git diff

