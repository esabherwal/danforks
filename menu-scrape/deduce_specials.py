# reads menu_data.json (as output by scrape_menu.py); 
# outputs the subset of the menu which can be considered "specials"
import json

specials = {}  # subset of menu which counts as "specials"


def get_neighbor_dates(date_list, date):
    # TODO: this is a hack which relies on month/year staying the same.
    # should have probably recorded them in a sortable way in the first place.
    date_list.sort(key=lambda d: int(d.split()[-1]))
    this_index = date_list.index(date)
    return date_list[(this_index - 1) % len(date_list)], date_list[
        (this_index + 1) % len(date_list)]


def has_food_item(menus_data, date, meal, category, item):
    if date not in menus_data:
        return False

    menu_data = menus_data[date]
    if meal not in menu_data:
        return False

    meal_data = menu_data[meal]
    if category not in meal_data:
        return False

    return item in meal_data[category]


def add_special(full_menus, loc, station, date, meal, category, item):
    if loc not in specials:
        specials[loc] = {}

    loc_data = specials[loc]
    if station not in loc_data:
        loc_data[station] = {
            'menus': {}
        }

    menus_data = loc_data[station]['menus']
    if date not in menus_data:
        menus_data[date] = {
            'menu': {}
        }

    menu_data = menus_data[date]['menu']
    if meal not in menu_data:
        menu_data[meal] = {}

    meal_data = menu_data[meal]
    if category not in meal_data:
        meal_data[category] = {}

    category_data = meal_data[category]
    category_data[item] = full_menus[loc][station]['menus'][date]['menu'][meal][category][item]


def main():
    with open('/tmp/danforks-data/menu_data.json') as f:
        full_menus = json.load(f)
        for loc in full_menus:
            loc_data = full_menus[loc]
            for station in loc_data:
                menus_data = loc_data[station]['menus']
                for date in menus_data:
                    # TODO: awfully inefficient to re-sort and then re-seek each time.
                    # probably ought to calculate once and store.
                    neighbor_dates = get_neighbor_dates(list(menus_data.keys()), date)
                    menu_data = menus_data[date]['menu']
                    for meal in menu_data:
                        meal_data = menu_data[meal]
                        for category in meal_data:
                            for item in meal_data[category]:
                                not_special = any(
                                        has_food_item(menus_data, n_date, meal, category, item)
                                        for n_date in neighbor_dates
                                )
                                if not_special:
                                    continue
                                print(loc, station, date, meal, category, item)
                                add_special(full_menus, loc, station, date, meal, category, item)

        with open('/tmp/danforks-data/specials_data.json', 'w+') as outfile:
            json.dump(specials, outfile)


if __name__ == '__main__':
    main()
