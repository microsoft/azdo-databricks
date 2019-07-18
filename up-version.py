#!/usr/bin/env python
import sys
import os
import re
import json
import pprint

with open("vss-extension.json", "r") as fr:
   data = json.load(fr)
   oldVersion = data['version']
   #print(version)
   arr = oldVersion.split(".")
   arr[2] = str(int(arr[2])+1)
   newVersion = ".".join(arr)
   #print(newVersion)
   fr.close()

# Read in the file
with open('vss-extension.json', 'r') as file :
  filedata = file.read()

# Replace the target string
filedata = filedata.replace(oldVersion, newVersion)

#print(json.dumps(filedata, indent=4))

# Write the file out again
with open('vss-extension.json', 'w') as file:
  file.write(filedata)

exit(0)
