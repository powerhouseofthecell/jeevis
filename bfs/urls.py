from django.conf.urls import url

from bfs.views import *

urlpatterns = [
    url(r'^', index),
]
