import re

import bs4
import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse, HttpResponse


class MetaScraper(object):

    def __init__(self, url):
        self.DJANGO_URL = 'http://localhost'
        self.url_regex = re.compile("((http|https)://)(www.)?" +
                                    "[a-zA-Z0-9@:%._\\+~#?&//=]" +
                                    "{2,256}\\.[a-z]" +
                                    "{2,6}\\b([-a-zA-Z0-9@:%" +
                                    "._\\+~#?&//=]*)")

        self.url = self.url_regex.match(url)
        self.required_attrs = ('image', 'description', 'title', 'site_name')
        self.soup: bs4.BeautifulSoup = None

    def validate_url(self, to_validate_url):
        return self.url_regex.match(to_validate_url)

    def create_soup_obj(self):

        if self.url is None:
            raise TypeError('Invalid URL')

        r = requests.get(self.url.string)
        self.soup = BeautifulSoup(r.text, 'html.parser')

    def get_og_data_from_prop(self):

        if self.soup is None:
            self.create_soup_obj()

        meta_tags: bs4.element.ResultSet[bs4.element.Tag] = self.soup.find_all(name='meta', attrs={
            'property': re.compile('^og')
        })

        url_filtered_meta_data = {}

        for i in meta_tags:
            ele_property = i.attrs['property'].split(':')

            if len(ele_property) > 2:
                continue
            property_name = ele_property[1]

            content = i.attrs['content']
            url_filtered_meta_data[property_name] = content
        return url_filtered_meta_data

    def scrape_og_from_name(self):

        if self.soup is None:
            self.create_soup_obj()

        soup = self.soup.find_all(name='meta', attrs={
            'name': re.compile('^og'),
        })

        url_filtered_meta_data = {}

        for i in soup:
            ele_property = i.attrs['name'].split(':')

            if len(ele_property) > 2:
                continue

            property_name = ele_property[1]

            content = i.attrs['content']
            url_filtered_meta_data[property_name] = content

        return url_filtered_meta_data

    def scrape(self):
        url_filtered_meta_data_from_property = self.get_og_data_from_prop()
        url_filtered_meta_data_from_name = None

        for i in self.required_attrs:

            from_prop = url_filtered_meta_data_from_property.get(i)

            if from_prop is None:

                # then scrape from name
                if url_filtered_meta_data_from_name is None:
                    url_filtered_meta_data_from_name = self.scrape_og_from_name()

                from_name = url_filtered_meta_data_from_name.get(i)

                # if attr isnt present in names too, then check
                if from_name is None:

                    # for site name
                    if i == 'site_name':
                        try:
                            url_filtered_meta_data_from_property['site_name'] = url_filtered_meta_data_from_property[
                                'title']
                        except KeyError as _:
                            url_filtered_meta_data_from_property['site_name'] = self.soup.find('title').text
                            url_filtered_meta_data_from_property['title'] = url_filtered_meta_data_from_property[
                                'site_name']

                    elif i == 'description':

                        url_filtered_meta_data_from_property[i] = self.soup.find('meta', attrs={
                            'name': re.compile('^description')
                        }).get('content')

                    elif i == 'image':
                        x = self.soup.find('meta', attrs={
                            'name': re.compile(':?image*')
                        })

                        if x is not None:
                            url_filtered_meta_data_from_property['image'] = x.get('content')

                        elif x is None:
                            x = self.soup.find('meta', attrs={
                                'property': re.compile(':?image*')
                            })
                            if x is None:
                                url_filtered_meta_data_from_property['image'] = self.DJANGO_URL + \
                                                                                '/media/defaults/default_hook_image.jpeg'

        return url_filtered_meta_data_from_property


def scrape(request):
    url = request.GET['url']

    if url is None:
        return JsonResponse('No URL supplied', status=400)

    obj = MetaScraper(url)
    try:
        data = obj.scrape()
        return JsonResponse(data)
    except TypeError as _:
        return HttpResponse('Invalid URL', status=400)
    except Exception as _:
        return HttpResponse('Error', status=500)
