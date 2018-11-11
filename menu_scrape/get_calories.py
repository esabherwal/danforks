# Get the calories for each menu item in menu_data.json and write back to the same file.
# This should have been part of the original scrape, but I forgot.
import json
from lxml import html
import requests
import collections


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
                            with open(nutrition_url, "r") as nutrition_f:
                                print nutrition_url
                                nutrition_tree = html.fromstring(nutrition_f.read())
                                calories = nutrition_tree.xpath('//b[starts-with(text(),"Calories")]/text()')[0].split()[1]
                                fat = nutrition_tree.xpath('//b[starts-with(text(),"Total Fat")]/../following-sibling::font/text()')[0]
                                protein = nutrition_tree.xpath('//b[starts-with(text(),"Protein")]/../following-sibling::font/text()')[0]
                                carbs = nutrition_tree.xpath('//b[starts-with(text(),"Tot. Carb.")]/../following-sibling::font/text()')[0]
                                full_menus[loc][station]['menus'][date]['menu'][meal][category][item]['calories'] = calories
                                full_menus[loc][station]['menus'][date]['menu'][meal][category][item]['fat'] = fat
                                full_menus[loc][station]['menus'][date]['menu'][meal][category][item]['protein'] = protein
                                full_menus[loc][station]['menus'][date]['menu'][meal][category][item]['carbs'] = carbs
            

print 'writing'                        
with open('menu_data.json', 'w') as outfile:  
     json.dump(full_menus, outfile)
