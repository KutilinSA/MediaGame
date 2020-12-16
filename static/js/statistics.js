jQuery(document).ready(function() {
    var statistics = [];
    var data = $('div[data-statistics="question"]');
    for (var i = 0; i < data.length; i++) {
        var info = data[i].children[0].innerText + "\n" + data[i].children[1].innerText + "\n";
        info += data[i].children[2].innerText;
        var result = confirm(info);
        if (!result)
            break;
    }
    var averageScore = $('div[data-statistics="score"]');
    alert("Average score: " + averageScore.html());
});