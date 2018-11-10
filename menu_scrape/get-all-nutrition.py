# get the HTML file for the nutrition label for each meal
# Get the calories for each menu item in menu_data.json and write back to the same file.
# This should have been part of the original scrape, but I forgot.
import json
from lxml import html
import requests
import collections
import os.path

full_menus = {}

with open('menu_data.json') as f:
    full_menus = json.load(f, object_pairs_hook=collections.OrderedDict)
    for loc in full_menus:
        for station in full_menus[loc]:
            print loc, station
            for date in full_menus[loc][station]['menus']:
                for meal in full_menus[loc][station]['menus'][date]['menu']:
                    print meal, date
                    for category in full_menus[loc][station]['menus'][date]['menu'][meal]:
                        for item in full_menus[loc][station]['menus'][date]['menu'][meal][category]:
                            nutrition_url = full_menus[loc][station]['menus'][date]['menu'][meal][category][item]["nutrition_url"]
                            htmlfname =  '../nutrition/' + '_'.join([loc, station, date, meal, category, item]).replace('/','') + '.html'
                            if not os.path.isfile(htmlfname): # only bother downloading if it doesn't already exist
                                try:
                                    nutrition_page = requests.get(nutrition_url)
                                    with open(htmlfname, "w") as html_file:
                                        html_file.write(nutrition_page.text.encode('utf-8'))
                                except requests.exceptions.ConnectionError:
                                    print 'couldn\'t load', nutrition_url
                            full_menus[loc][station]['menus'][date]['menu'][meal][category][item]["nutrition_url"] = htmlfname


print 'writing'                        
with open('menu_data.json', 'w') as outfile:  
     json.dump(full_menus, outfile)
