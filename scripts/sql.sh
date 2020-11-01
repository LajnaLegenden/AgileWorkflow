#!/bin/bash
for filename in ./../sqlSetup/*.js; do
   node $filename
done