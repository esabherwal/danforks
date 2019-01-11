import os

import boto3

import deduce_specials
import get_all_nutrition
import get_calories
import scrape_menus
import scrape_metadata


def main():
    s3 = boto3.client('s3')

    print('scraping metadata')
    scrape_metadata.main()
    print('uploading places')
    s3.upload_file(
            '/tmp/danforks-data/places.csv',
            'data.danforks.com',
            'places.csv'
    )

    print('scraping menus')
    scrape_menus.main()

    print('getting all nutrition')
    get_all_nutrition.main()
    print('uploading nutrition')
    for filename in os.listdir('/tmp/danforks-data/nutrition/'):
        s3.upload_file(
                '/tmp/danforks-data/nutrition/' + filename,
                'data.danforks.com',
                'nutrition/' + filename
        )

    print('getting calories')
    get_calories.main()
    print('uploading menu data')
    s3.upload_file(
            '/tmp/danforks-data/menu-data.json',
            'data.danforks.com',
            'menu-data.json'
    )

    print('deducing specials')
    deduce_specials.main()
    print('uploading specials data')
    s3.upload_file(
            '/tmp/danforks-data/specials-data.json',
            'data.danforks.com',
            'specials-data.json'
    )


if __name__ == '__main__':
    main()
