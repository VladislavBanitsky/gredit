/* Создание элемента Canvas */
var img = new Image();
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
var fileName = "";
/* Сохранение исходных параметров изображения */
$(document).ready(function() {
    $('input[type=range]').change(applyFilters);
    function applyFilters() {
        var cntrst = parseInt($('#contrast').val());
        var sep = parseInt($('#sepia').val());
        var yark = parseInt($('#brightness').val());
        var hu = parseInt($('#hue').val());
        Caman('#canvas', function () {
            this.revert(false);
            this.contrast(cntrst);
            this.sepia(sep);
            this.brightness(yark);
            this.hue(hu);
            this.render();
        });
    }
    /* Реализация фильтров */
    Caman.Filter.register("oldpaper", function() {
        this.pinhole();
        this.noise(10);
        this.orangePeel();
        this.render();
    });

    })