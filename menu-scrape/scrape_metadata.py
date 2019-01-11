# Scrape metadata for each food place on campus (including menu URL), store in a .csv file
import errno
import os

from lxml import html
import requests
import csv


def get_all_metadata():
    page = requests.get('https://diningservices.wustl.edu/where-to-eat/')
    tree = html.fromstring(page.content)

    place_metadata = []

    for place in tree.xpath('//div[contains(@class,"gumm-filterable-item ")]'):
        place_name = place.xpath('.//h4[@class="head-link"]/a/text()')[0]  # place name
        station_name = ''
        if u'\u2013' in place_name:
            place_name, station_name = place_name.split(u'\u2013')
        print(place_name, station_name)

        # get hours listing (after "Map" link):
        hours = ''
        hours_pieces = place.xpath(
                './/div[@class="post-excerpt"]/a[contains(text(),"Map")]/following-sibling::*'
        )
        for hours_piece in hours_pieces:
            hours += html.tostring(hours_piece, encoding='unicode')

        # url for further metadata for the place.
        md_url = place.xpath('.//h4[@class="head-link"]/a/@href')[0]
        # get additional metadata from the place's dedicated page:
        menu_url, description = get_metadata_for_place(md_url)

        md = [place_name, station_name, hours, description, menu_url]
        md = [x.strip() for x in md]

        place_metadata.append(md)

    return place_metadata


def get_metadata_for_place(place_url):
    page_dump = requests.get(place_url)
    page_tree = html.fromstring(page_dump.content)

    # URL for getting menu data:
    menu_url = page_tree.xpath('.//a[text()="View Menus"]/@href')[0]

    # place description strings (before "Hours of Operation"):
    description = ''
    desc_pieces = page_tree.xpath(
            '//div[contains(@id,"single-post-content-element-")]/div[contains(@class,"row-fluid")]/*[.//text()="Hours of Operation"]/preceding-sibling::p/text()'
    )
    for desc_piece in desc_pieces:
        description += desc_piece

    return menu_url, description


def main():
    place_metadata = get_all_metadata()

    directory = '/tmp/danforks-data/'
    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise e
    filename = directory + 'places.csv'
    with open(filename, 'w+') as csv_file:
        writer = csv.writer(csv_file)
        # writer.writerow(['place name', 'station name', 'hours', 'description', 'menu url'])
        writer.writerows(place_metadata)


main()
