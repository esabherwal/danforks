# reads menu_data.json (as output by scrape_menu.py); 
# outputs the subset of the menu which can be considered "specials"
import json

specials = {} # subset of menu which counts as "specials"


def get_neighbor_dates(date_list, date):
    date_list.sort(key=lambda d: int(d.split()[-1])) # TODO: this is a hack which relies on month/year staying the same. should have probably recorded them in a sortable way in the first place.
    this_index = date_list.index(date)
    return date_list[(this_index-1)%len(date_list)], date_list[(this_index+1)%len(date_list)]


def has_food_item(full_menus, loc, station, date, meal, category, item):
    if not loc in full_menus:
        return False
    
    if not station in full_menus[loc]:
        return False
    
    if not date in full_menus[loc][station]['menus']:
        return False
    
    if not meal in full_menus[loc][station]['menus'][date]['menu']:
        return False

    if not category in full_menus[loc][station]['menus'][date]['menu'][meal]:
        return False
        
    return (item in full_menus[loc][station]['menus'][date]['menu'][meal][category])


def add_special(full_menus, loc, station, date, meal, category, item):
    if not loc in specials:
        specials[loc] = {}
    
    if not station in specials[loc]:
        specials[loc][station] = {
            'menus': {}
        }
    
    if not date in specials[loc][station]['menus']:
        specials[loc][station]['menus'][date] = {
            'menu': {}
        }
    
    if not meal in specials[loc][station]['menus'][date]['menu']:
        specials[loc][station]['menus'][date]['menu'][meal] = {}
    
    if not category in specials[loc][station]['menus'][date]['menu'][meal]:
        specials[loc][station]['menus'][date]['menu'][meal][category] = {}
        
    specials[loc][station]['menus'][date]['menu'][meal][category][item] = full_menus[loc][station]['menus'][date]['menu'][meal][category][item]


with open('menu_data.json') as f:
    full_menus = json.load(f)
    for loc in full_menus:
        for station in full_menus[loc]:
            for date in full_menus[loc][station]['menus']:
                # TODO: awfully inefficient to re-sort and then re-seek each time. probably ought to calculate once and store.
                neighbor_dates = get_neighbor_dates(full_menus[loc][station]['menus'].keys(), date)
                for meal in full_menus[loc][station]['menus'][date]['menu']:
                    for category in full_menus[loc][station]['menus'][date]['menu'][meal]:
                        for item in full_menus[loc][station]['menus'][date]['menu'][meal][category]:
                            special = True # assume special
                            for n_date in neighbor_dates:
                                if has_food_item(full_menus, loc, station, n_date, meal, category, item):
                                    special = False
                                    break # stop checking whether it's a special
                            if special:
                                print loc, station, date, meal, category, item
                                add_special(full_menus, loc, station, date, meal, category, item)
                        
    with open('specials_data.json', 'w') as outfile:  
        json.dump(specials, outfile)
