# Change Log

## 0.0.8

Fix renaming of ref to files with same name as current folder.

Problem was this:
src/modules/Home/Home.redux.js
src/modules/Home/Home/Home.js
In content of Home.js:
import 'modules/home/Home.redux'
-> 'import '.redux' (start by removing 'modules/Home/Home')
-> 'import ./.redux' (then make it local ref)

now it will:
import 'modules/home/Home.redux'
-> 'import 'modules/home/Home.redux' (try to remove 'modules/Home/Home/')

## 0.0.7

Fix typo in readme.

## 0.0.6

Add new config: excludePattern

## 0.0.5

Fix folder move, to ref in other files are correct.

## 0.0.4

Remove '/' from know issues in readme.

## 0.0.3

Fix '/' and '\\' dif in systems.
Path in other file for imports witout file extension.

## 0.0.2

Update readme

## 0.0.1

Base code.

All notable changes to the "vsc-move" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release
