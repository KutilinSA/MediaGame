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
            }
            else {
                targetScore = score + currentQuestionScore;
                $('.column[data-number="' + currentQuestion + '"]').addClass("correct");
            }
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
                    $(".question-wrapper").addClass("game-ended");
                    $(".question-wrapper").append("<h1>Game Ended!</h1>");
                    $(".question-wrapper").append("<h2>Your score: " + score + "</h2>");
                }, 1000);
            }, 3000);
        }
    });
});