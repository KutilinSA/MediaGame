from django.db import models


class Answer(models.Model):
    objects = models.Manager()
    question_number = models.PositiveIntegerField()
    correct_answer = models.PositiveIntegerField()
    user_answer = models.PositiveIntegerField()


class Score(models.Model):
    objects = models.Manager()
    score = models.IntegerField()
