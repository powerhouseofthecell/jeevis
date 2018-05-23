from django.conf.urls import url

from getjson.views import *

urlpatterns = [
    url(r'^random_graph', random_graph),
    url(r'^pyramid_graph', pyramid_graph),
    url(r'^circle_graph', circle_graph),
    url(r'^', index),
]
