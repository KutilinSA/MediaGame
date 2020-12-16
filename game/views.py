from django.shortcuts import render, Http404, HttpResponse
from .questions import QUESTIONS
import json


def index(request):
    if request.method == "POST":
        raise Http404
    return render(request, 'index.html', {})


def question(request):
    if request.method == "GET":
        raise Http404
    question_number = request.POST.get("question_index", -1)
    question_number = int(question_number)
    if question_number == -1:
        raise Http404
    response = QUESTIONS[question_number - 1]
    return HttpResponse(json.dumps(response), content_type="application/json")

