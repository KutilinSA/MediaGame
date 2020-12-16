from django.shortcuts import render, Http404, HttpResponse
from .questions import QUESTIONS
from .models import Answer, Score
import json


def index(request):
    if request.method == "POST":
        raise Http404
    answers_statistics = []
    for i in range(1, 16):
        answers = Answer.objects.all().filter(question_number=i)
        all_count = answers.count()
        correct_count = 0
        for answer in answers:
            if answer.user_answer == answer.correct_answer:
                correct_count += 1
        answers_statistics.append({"question_number": i, "all_count": all_count, "correct_count": correct_count})
    average_score = 0
    scores = Score.objects.all()
    for score in scores:
        average_score += score.score
    if scores.count() != 0:
        average_score = float(average_score) / scores.count()
    else:
        average_score = 0
    context = {"answers_statistics": answers_statistics, "average_score": average_score}
    if "statistics" in request.GET:
        context["show_statistics"] = True
    else:
        context["show_statistics"] = False
    return render(request, 'index.html', context)


def question(request):
    if request.method == "GET":
        raise Http404
    question_number = request.POST.get("question_index", -1)
    question_number = int(question_number)
    if question_number == -1:
        raise Http404
    response = QUESTIONS[question_number - 1]
    return HttpResponse(json.dumps(response), content_type="application/json")


def question_answer(request):
    if request.method == "GET":
        raise Http404
    question_number = request.POST.get("question_index", -1)
    question_number = int(question_number)
    if question_number == -1:
        raise Http404
    correct_answer = request.POST.get("correct_answer", -1)
    correct_answer = int(correct_answer)
    if correct_answer == -1:
        raise Http404
    user_answer = request.POST.get("user_answer", -1)
    user_answer = int(user_answer)
    if user_answer == -1:
        raise Http404
    answer = Answer(question_number=question_number, correct_answer=correct_answer, user_answer=user_answer)
    answer.save()
    return HttpResponse(json.dumps({}), content_type="application/json")


def game_ended(request):
    if request.method == "GET":
        raise Http404
    user_score = request.POST.get("score", -1)
    user_score = int(user_score)
    if user_score == -1:
        raise Http404
    score = Score(score=user_score)
    score.save()
    return HttpResponse(json.dumps({}), content_type="application/json")
