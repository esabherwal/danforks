# get the HTML file for the nutrition label for each meal
# Get the calories for each menu item in menu_data.json and write back to the same file.
# This should have been part of the original scrape, but I forgot.
import collections
import errno
import json
import os.path

import requests

directory = '/tmp/danforks-data/nutrition/'
try:
    os.makedirs(directory)
except OSError as e:
    if e.errno != errno.EEXIST:
        raise e

with open('menu_data.json') as f:
    full_menus = json.load(f, object_pairs_hook=collections.OrderedDict)
    for loc in full_menus:
        loc_data = full_menus[loc]
        for station in loc_data:
            print(loc, station)
            menus_data = loc_data[station]['menus']
            for date in menus_data:
                menu_data = menus_data[date]['menu']
                for meal in menu_data:
                    print(meal, date)
                    meal_data = menu_data[meal]
                    for category in meal_data:
                        category_data = meal_data[category]
                        for item in category_data:
                            item_data = category_data[item]
                            nutrition_url = item_data['nutrition_url']
                            name_items = [loc, station, date, meal, category, item]
                            html_f_name = '_'.join(name_items).replace('/', '') + '.html'
                            html_f_path = directory + html_f_name
                            # only bother downloading if it doesn't already exist
                            if os.path.isfile(html_f_path):
                                continue
                            try:
                                nutrition_page = requests.get(nutrition_url)
                                with open(html_f_path, "w+") as html_file:
                                    html_file.write(nutrition_page.text)
                                new_url = '//data.danforks.com/nutrition/' + html_f_name
                                item_data['nutrition_url'] = new_url
                            except requests.exceptions.ConnectionError:
                                print("couldn't load", nutrition_url)

print('writing')
with open('/tmp/danforks-data/menu_data.json', 'w+') as outfile:
    json.dump(full_menus, outfile)
