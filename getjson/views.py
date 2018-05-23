from django.shortcuts import render
from django.http import JsonResponse

from random import random, randint

class Graph():
    def add_node(self, selected, children, weight):
        self.graph["nodes"].append({
            "id": self.graph["n"],
            "selected": selected,
            "children": children,
            "weight": weight
        })
        self.graph["n"] += 1

    def add_edge(self, node, v, weight):
        self.graph["links"].append({
            "id": self.m,
            "source": node["id"],
            "target": v,
            "weight": weight
        })
        self.m += 1

        node["children"].append(v)

    def __init__(self, n):
        self.graph = {
            "n": 0,
            "nodes": list(),
            "links": list()
        }

        self.m = 0

        for _ in range(n):
            self.add_node(False, list(), 1)

def gen_random_graph(n):
    g = Graph(n)

    for node in g.graph["nodes"]:
        u = node["id"]
        for v in range(n):
            if u is not v:
                if random() < 0.03:
                    g.add_edge(node, v, randint(1, 100))

    return g.graph

def gen_pyramid_graph(n):
    g = Graph(n)
    
    for node in g.graph["nodes"]:
        if node["id"] <= (n - 2) / 2:
            u = node["id"]
            g.add_edge(node, 2 * u + 1, 1)
            g.add_edge(node, 2 * u + 2, 1)

    return g.graph

def gen_circle_graph(n):
    g = Graph(n)

    cnt = n

    for node in g.graph["nodes"]:
        i = node["id"]

        g.add_edge(node, (i + 1) % n, 1)

    for node in g.graph["nodes"]:
        if random() <= 0.5:
            g.add_node(False, list(), 1)

            g.add_edge(node, cnt, 1)

            cnt += 1

    return g.graph


# Create your views here.
def random_graph(request):
    return JsonResponse(gen_random_graph(50))

def pyramid_graph(request):
    return JsonResponse(gen_pyramid_graph(63))

def circle_graph(request):
    return JsonResponse(gen_circle_graph(25))

def index(request):
    return JsonResponse(gen_random_graph(50))