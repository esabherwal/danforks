# Get the calories for each menu item in menu-data.json and write back to the same file.
# This should have been part of the original scrape, but I forgot.
import collections
import json

from lxml import html


def main():
    with open('/tmp/danforks-data/menu-data.json') as f:
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
                                add_macros(item_data)

    print('writing')
    with open('/tmp/danforks-data/menu-data.json', 'w+') as outfile:
        json.dump(full_menus, outfile)


def add_macros(item_data):
    nutrition_url = item_data['nutrition_url']
    with open(nutrition_url) as nutrition_f:
        print(nutrition_url)
        nutrition_tree = html.fromstring(nutrition_f.read())
        calories = nutrition_tree.xpath(
                '//b[starts-with(text(),"Calories")]/text()'
        )[0].split()[1]
        fat = nutrition_tree.xpath(
                '//b[starts-with(text(),"Total Fat")]/../following-sibling::font/text()'
        )[0]
        protein = nutrition_tree.xpath(
                '//b[starts-with(text(),"Protein")]/../following-sibling::font/text()'
        )[0]
        carbs = nutrition_tree.xpath(
                '//b[starts-with(text(),"Tot. Carb.")]/../following-sibling::font/text()'
        )[0]
        item_data['calories'] = calories
        item_data['fat'] = fat
        item_data['protein'] = protein
        item_data['carbs'] = carbs


if __name__ == '__main__':
    main()
