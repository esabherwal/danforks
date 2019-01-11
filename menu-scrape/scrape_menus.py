# scrape menu data for each place in places.csv (as created by scrape_metadata.py)
import collections
import csv
import json

import requests
from lxml import html

menu_url_root = 'http://menus.wustl.edu/'


# given a "longmenu" url (for a single meal/category),
# parse the data therein and return datastructure with menu items.
def get_menu_items(long_menu_url):
    meal_menu = collections.OrderedDict()  # map of sub-section to dict of menu items
    meal_page = requests.get(long_menu_url)
    meal_tree = html.fromstring(meal_page.content)
    # in the menu table, get (in order) all rows that are either categories or menu entries
    current_category = ''
    xpath = meal_tree.xpath(
            '//table/form/..//div[@class="longmenucolmenucat" or @class="longmenucoldispname"]'
    )
    for menu_row in xpath:
        type_class = menu_row.xpath('./@class')[0]
        if type_class == 'longmenucolmenucat':
            # this is a category - switch current categories
            current_category = menu_row.xpath('./text()')[0].strip(' -').capitalize()
            print(current_category)
        else:
            this_name = menu_row.xpath('./a//text()')[0]
            # check that it's not a "closed" message masquerading as a menu item.
            if ('Closed for Today' in this_name) or ('We are Closed on Fridays' in this_name):
                continue
            # this is a menu item - add it to the current category.
            if current_category not in meal_menu:
                meal_menu[current_category] = {}
            this_nutrition_url = menu_url_root + menu_row.xpath('./a/@href')[0]
            # get the labels:
            this_labels = []
            for img in menu_row.xpath('./../following-sibling::td[@width="10%"]/img/@src'):
                label = img[img.find("/") + 1:img.rfind(".")]  # strip away first / and last .
                this_labels.append(label)
            meal_menu[current_category][this_name] = {
                'nutrition_url': this_nutrition_url,
                'labels': this_labels
            }

    return meal_menu


# given url for a menu page, get the actual menu data for the day.
# returns object with parsed data.
def get_day_menus(menu_url):
    menu = collections.OrderedDict()  # map of meal time (breakfast, etc.) to menu
    menu_page = requests.get(menu_url)
    menu_tree = html.fromstring(menu_page.content)
    for submenu in menu_tree.xpath('//div[@class="shortmenumeals"]'):
        meal_time = submenu.xpath('./text()')[0]
        print(meal_time)
        long_menu_url = menu_url_root + submenu.xpath('../following-sibling::td/a/@href')[0]
        menu_items = get_menu_items(long_menu_url)
        if len(menu_items) > 0:
            menu[meal_time] = menu_items
    return menu


# given standard dict with metadata for a place (station),
# get menus for all available dates on the page
# modifies passed-in place_dict
def get_all_menus_for_place(place_dict):
    # request HTML:
    menu_page = requests.get(place_dict['menu_url'])
    menu_tree = html.fromstring(menu_page.content)

    place_dict['menus'] = {}  # map of date string to menu metadata
    # find menus for the week:
    for menu_date_subtree in menu_tree.xpath('//span[@class="dateselections"]'):
        date_string = menu_date_subtree.xpath('./a/*/text()')[0]
        print(date_string)
        date_menu_url = menu_url_root + menu_date_subtree.xpath('./a/@href')[0]

        place_dict['menus'][date_string] = {}  # further dict of menu data
        place_dict['menus'][date_string]['url'] = date_menu_url
        this_menu = get_day_menus(date_menu_url)
        place_dict['menus'][date_string]['menu'] = this_menu


def main():
    # large dict which will be serialzed to json. maps location name to further nested dicts.
    menu_data = {}

    with open('/tmp/danforks-data/places.csv') as csv_file:
        md_reader = csv.reader(csv_file)
        for place_name, station_name, hours, description, menu_url in md_reader:
            # add location to menu_data dict, if necessary
            if place_name not in menu_data:
                menu_data[place_name] = {}

            # add other station-specific metadata:
            # (note: if this is not a place with stations, then station key will be empty string)
            this_station = {
                'hours': hours,
                'description': description,
                'menu_url': menu_url
            }

            print(place_name, station_name)

            get_all_menus_for_place(this_station)

            menu_data[place_name][station_name] = this_station

    with open('/tmp/danforks-data/menu_data.json', 'w+') as outfile:
        json.dump(menu_data, outfile)


if __name__ == '__main__':
    main()
