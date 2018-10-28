#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

echo "miniテスト開始:"

md5='3b3a814f9efec5f7d28c9bec54ee67b5  -'
check=$( rubygana --readme-html | tee README.md.rubygana.html | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

