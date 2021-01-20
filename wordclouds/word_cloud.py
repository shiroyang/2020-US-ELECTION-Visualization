# -*- coding: utf-8 -*-
"""
Created on Tue Jan 19 23:59:17 2021

@author: 25678
"""

import wordcloud
import os
import datetime
import matplotlib.pyplot as plt

os.chdir('tweets')


def generate_wordcloud(txt_file,fname,mask,stopwords):
    w = wordcloud.WordCloud(
        mask=mask,
        background_color='white',
        stopwords=stopwords,
        colormap="Blues",
        )
    w.generate(txt_file)
    w.to_file(fname+".png")
    
mask = plt.imread('USA.jpg')
stopwords = wordcloud.STOPWORDS
stopwords.add('will')

file_names = []
date = datetime.date(2020,11,4)
for i in range(65):
    datestr = str(date)
    file_names.append(datestr)
    date += datetime.timedelta(days=1)

for fname in file_names:
    f = open(fname+'.txt', encoding='utf-8')
    txt = f.read()
    f.close()
    generate_wordcloud(txt,fname,mask,stopwords)

