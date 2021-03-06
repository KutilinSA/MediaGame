jQuery(document).ready(function() {
    var buttonsLocked = false;
    var answersLocked = false;

    var scoreAnimationTimer = null;

    var score = 0;
    var targetScore = 0;

    function showQuestion(response, currentQuestion, currentQuestionScore) {
        var questionWrapper = $(".question-wrapper");
        questionWrapper.append('<img class="question-image" src="/static/img/questions/' + response["image"] + '">');
        questionWrapper.append('<h3>' + response["text"] + "</h3>");
        var answersHTML = '<div class="answers"><div class="button" data-number="1">' + response["answer1"];
        answersHTML += '</div><div class="button" data-number="2">' + response["answer2"];
        answersHTML += '</div><div class="button" data-number="3">' + response["answer3"];
        answersHTML += '</div><div class="button" data-number="4">' + response["answer4"] + "</div></div>";
        questionWrapper.append(answersHTML);
        questionWrapper.append('<div class="description"></div>');

        if (currentQuestion == 14 || currentQuestion == 15)
            $(".question-wrapper .answers").css("font-size", "1.1rem");

        $(".question-wrapper .button").click(function() {
            if (answersLocked)
                return;
            answersLocked = true;
            $(".question-wrapper .button").addClass("not-enabled");
            $('.column[data-number="' + currentQuestion + '"]').addClass("not-enabled");
            $('.column[data-number="' + currentQuestion + '"]').addClass("completed");
            var btn = $(this);
            if (btn.data("number") != response["correct_answer"]) {
                btn.addClass("incorrect");
                targetScore = score - currentQuestionScore;
                $('.column[data-number="' + currentQuestion + '"]').addClass("incorrect");
                var audio = new Audio("/static/audio/lose.mp3");
                audio.play();
            }
            else {
                targetScore = score + currentQuestionScore;
                $('.column[data-number="' + currentQuestion + '"]').addClass("correct");
                var audio = new Audio("/static/audio/win.mp3");
                audio.play();
            }

            $.ajax({
                type: 'POST',
                url: '/question-answer/',
                data: {'question_index': currentQuestion, "correct_answer": response["correct_answer"], "user_answer": btn.data("number")},
            });

            scoreAnimationTimer = setInterval(() => {
                if (score == targetScore) {
                    clearInterval(scoreAnimationTimer);
                    return;
                }
                if (score < targetScore)
                    score += 1;
                else
                    score -= 1;
                $(".score-value").html(score);
            }, 10 / (currentQuestionScore / 100));
            $('.question-wrapper .button[data-number="' + response["correct_answer"] + '"]').addClass("correct");
            setTimeout(() => {
                setTimeout(() => {
                    $(".question-wrapper .close-button").fadeIn(1000);
                }, 3000);
                $('.question-wrapper img').attr('src', "/static/img/questions/" + response["after_image"]);
                $('.question-wrapper h3').slideUp(1000);
                $('.question-wrapper .answers').slideUp(1000);
                if (btn.data("number") == response["correct_answer"])
                    $('.question-wrapper .description').html(response["correct_description"]);
                else
                    $('.question-wrapper .description').html(response["incorrect_description"]);
                $('.question-wrapper .description').slideDown(1000);

            }, 2000);
        });
    };

    $(".column:not(.category)").click(function() {
        if (buttonsLocked)
            return;
        buttonsLocked = true;
        $(".column:not(.category)").addClass("not-enabled");
        var btn = $(this);
        btn.addClass("loading-btn");
        var questionIndex = btn.data("number");

        $.ajax({
            type: 'POST',
            url: '/question/',
            data: {'question_index': questionIndex},
            success: function(response)
            {
                $(".question-wrapper").addClass("opened");
                var currentQuestionScore = ((questionIndex - 1) % 3) * 100 + 100;
                var audio = new Audio("/static/audio/question.mp3");
                audio.play();
                setTimeout(() => { showQuestion(response, questionIndex, currentQuestionScore); }, 1000);
            },
            complete: function() {
                btn.removeClass('loading-btn');
            },
        });
    });

    $(".question-wrapper .close-button").click(function() {
        $(this).hide();
        $(".question-wrapper .button").unbind("click");
        buttonsLocked = false;
        answersLocked = false;
        $('.column:not(.completed)').removeClass("not-enabled");
        $(".question-wrapper *:not(.close-button)").remove();
        $(".question-wrapper").removeClass("opened");

        if ($(".column:not(.category):not(.completed)").length == 0) {
            setTimeout(() => {
                $(".question-wrapper").addClass("opened");
                setTimeout(() => {
                    var audio = null;
                    if (score < 300)
                        audio = new Audio("/static/audio/game-ended-bad.mp3");
                    else
                        audio = new Audio("/static/audio/game-ended.mp3");
                    audio.play();
                    $(".question-wrapper").addClass("game-ended");
                    $(".question-wrapper").append("<h1>Игра окончена!</h1>");
                    $(".question-wrapper").append("<h2>Ваши очки: " + score + "</h2>");
                    if (score > 2300) {
                        $(".question-wrapper").append('<h2 class="desc">Вот это результаты! Ты случайно не тайный агент Meduzы? Или тебя подослал Тасс?</h2>');
                    }
                    else if (score > 1000) {
                        $(".question-wrapper").append('<h2 class="desc">Вау, да ты почти настоящий профи, много же статей ты перечитал, друг?</h2>');
                    }
                    else {
                        $(".question-wrapper").append('<h2 class="desc">Не всем нам быть журналистами и разбираться что к чему, главное, чтоб интересно, ведь так?</h2>');
                    }
                }, 1000);
            }, 3000);
        }
    });

    $(".question-wrapper .close-button").click(function() {
        var audio = new Audio("/static/audio/click.mp3");
        audio.play();
    });
});

function playHover(event) {
    var audio = new Audio("/static/audio/hover.mp3");
    audio.play();
};