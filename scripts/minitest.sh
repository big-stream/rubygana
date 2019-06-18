#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

echo "miniテスト開始:"

md5='d5e8cf205dcd6ff1b94eee70226a5eb4  -'
check=$( rubygana --readme-html | tee README.md.rubygana.html | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

