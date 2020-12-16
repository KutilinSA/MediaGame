from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('question/', views.question, name="question"),
    path('question-answer/', views.question_answer, name="question-answer"),
]
