/* Создание элемента Canvas */
var img = new Image();
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
var fileName = "";

/* Загрузка изображения на холст */
$("#upload-file").on("change", function(){
    var file = document.querySelector('#upload-file').files[0];
    var reader = new FileReader();
    if (file) {
        fileName = file.name;
        reader.readAsDataURL(file);
    }
    reader.addEventListener("load", function () {
        img = new Image();
        img.src = reader.result;
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            $("#canvas").removeAttr("data-caman-id");
        }
    }, false);
});

/* Скачивание отредактированного изображения */
$('#download-btn').on('click', function (e) {
    var fileExtension = fileName.slice(-4);
    if (fileExtension == '.jpg' || fileExtension == '.png') {
        var actualName = fileName.substring(0, fileName.length - 4);
    }
    download(canvas, actualName + '-edited.jpg');  // вызываем функцию для формирования файла
});

function download(canvas, filename) {
    var  e;
    var lnk = document.createElement('a');

    lnk.download = filename;
    lnk.href = canvas.toDataURL("image/jpeg", 0.8);

    if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        lnk.dispatchEvent(e);
    }
    else if (lnk.fireEvent) {
        lnk.fireEvent("onclick");
    }
}

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

    /* Сброс изменений */
    $('#reset-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.revert(false);
            var cntrst = parseInt($('#contrast').val(0));
            var sep = parseInt($('#sepia').val(0));
            var yark = parseInt($('#brightness').val(0));
            var hue = parseInt($('#hue').val(0));
            ctx.restore();
        });
    });

    /* Реализация фильтров */
    Caman.Filter.register("oldpaper", function() {
        this.pinhole();
        this.noise(10);
        this.orangePeel();
        this.render();
    });
    $('#oldpaper-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.oldpaper().render();
        });
    });

    Caman.Filter.register("pleasant", function() {
        this.colorize(60, 105, 218, 10);
        this.contrast(10);
        this.sunrise();
        this.hazyDays()
        this.render();
    });
    $('#pleasant-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.pleasant().render();
        });
    });

    $('#vintage-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.greyscale().render();
        });
    });

    $('#noise-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.noise(10).render();
        });
    });

    $('#sharpen-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.sharpen(20).render();
        });
    });

    $('#blur-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.stackBlur(5).render();
        });
    });

    $('#crossprocess-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.crossProcess().render();
        });
    });

    $('#majestic-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.herMajesty().render();
        });
    });

    $('#nostalgia-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.nostalgia().render();
        });
    });

    $('#lomo-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.lomo().render();
        });
    });

    $('#hdr-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.contrast(10);
            this.contrast(10);
            this.jarques();
            this.render();
        });
    });

    $('#pseudo-btn').on('click', function (e) {
        var file = document.querySelector('#upload-file').files[0];
        var reader = new FileReader();
        if (file) {
            fileName = file.name;
            reader.readAsDataURL(file);
        }
        reader.addEventListener("load", function () {
            img = new Image();
            img.src = reader.result;
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                ctx.save();
                newImage = grafi.pseudocolor(ctx.getImageData(0, 0, img.width, img.height))
                ctx.putImageData(newImage, 0, 0)
                $("#canvas").removeAttr("data-caman-id");
            }
        }, false);
    });

})