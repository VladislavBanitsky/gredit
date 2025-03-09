/* Создание элемента Canvas */
var img = new Image();
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
var fileName = "";
var mouse = { x: 0, y: 0, is_down: false };  // для отслеживания положения мыши
var factor = 1.1;  // величина масштабирования
var viewport = { x: 0, y: 0, scale: 1 };  // положение в левом верхнем углу и масштаб увеличенного изображения
var drag = { x: 0, y: 0, dx: 0, dy: 0 };  // текущее положение и смещение
var scale_limits = { min: 1, max: 1 };
var filteredImageData = null; // сохранённое изображение после применения фильтров
                              //(чтобы не сбивались фильтры при перерисовке кадров)

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

function track_mouse(event) {
    let rectangle = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rectangle.left;
    mouse.y = event.clientY - rectangle.top;
}

function limit_value(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function zoom(event) {
    let direction = event.deltaY / Math.abs(event.deltaY);
    let new_scale = viewport.scale * Math.pow(factor, direction);
    new_scale = limit_value(new_scale, scale_limits.min, scale_limits.max);
    viewport.x = (viewport.x + mouse.x * viewport.scale) - mouse.x * new_scale;
    viewport.y = (viewport.y + mouse.y * viewport.scale) - mouse.y * new_scale;
    viewport.scale = new_scale;
    event.preventDefault();
}

function start_drag(event) {
    drag.x = mouse.x;
    drag.y = mouse.y;
    mouse.is_down = true;
}

function stop_drag(event) {
    if (mouse.is_down) {
        viewport.x += drag.dx;
        viewport.y += drag.dy;
    }
    drag.dx = 0;
    drag.dy = 0;
    mouse.is_down = false;
}

function update() {
    viewport.x = limit_value(viewport.x, 0, img.width - canvas.width * viewport.scale);
    viewport.y = limit_value(viewport.y, 0, img.height - canvas.height * viewport.scale);

    if (mouse.is_down) {
        drag.dx = (drag.x - mouse.x) * viewport.scale;
        drag.dx = limit_value(drag.dx, -viewport.x, img.width - viewport.x - canvas.width * viewport.scale);
        drag.dy = (drag.y - mouse.y) * viewport.scale;
        drag.dy = limit_value(drag.dy, -viewport.y, img.height- viewport.y - canvas.height * viewport.scale);
    }
}

function draw() {
    // Если фильтрованное изображение существует, используем его
    if (filteredImageData) {
        ctx.putImageData(filteredImageData, 0, 0); // Восстанавливаем фильтрованное изображение на холсте
    } else {
        // Очистить весь холст
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width;
        canvas.height = img.height;
        // Рисуем изображение с учетом масштаба и положения
        ctx.drawImage(img,
            viewport.x + drag.dx, viewport.y + drag.dy, canvas.width * viewport.scale, canvas.height * viewport.scale,
                0, 0, canvas.width, canvas.height);
        $("#canvas").removeAttr("data-caman-id");
    }
    // Запрашиваем следующий кадр
    requestAnimationFrame(draw);
}

/* Сохранение исходных параметров изображения */
$(document).ready(function() {
    /* Сохранение параметров изображения, заданных изменением ползунков */
    $('input[type=range]').change(applyFilters);

    function applyFilters() {
        var yark = parseInt($('#brightness').val());
        var cntrst = parseInt($('#contrast').val());
        var sep = parseInt($('#sepia').val());
        var hu = parseInt($('#hue').val());
        Caman('#canvas', function () {
            this.revert(false);
            this.brightness(yark);
            this.contrast(cntrst);
            this.sepia(sep);
            this.hue(hu);
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    }

    // Слушаем изменение ползунка
    $('#slider').on('input', function() {
        // Получаем значение ползунка
        var scaleValue = Math.abs($(this).val());

        // Обновляем масштаб
        viewport.scale = scaleValue/100;  // диапазон от 0,1 до 8

        // Применяем новые значения масштаба и перерисовываем изображение
        draw();
    });

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
                viewport = { x: 0, y: 0, scale: 1 }
                scale_limits.max = 8;  // максимальный масштаб (максимальное уменьшение)
                scale_limits.min = 0.1;  // минимальный масштаб (максимальное увеличение)
                canvas.onmousemove = track_mouse;
                canvas.onwheel = zoom;
                canvas.onwheelscroll = zoom;
                canvas.onmousedown = start_drag;
                canvas.onmouseup = stop_drag;
                canvas.onmouseout = stop_drag;
                canvas.width = img.width;
                canvas.height = img.height;

                draw();  // начальный запуск (будет подхвачен через requestAnimationFrame)

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

    /* Сброс изменений */
    $('#reset-btn').on('click', function (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // очищаем холст
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);  // перерисовываем исходное изображение
        // Сбрасываем параметры ползунков на 0 (по умолчанию)
        $('#brightness').val(0);
        $('#contrast').val(0);
        $('#sepia').val(0);
        $('#hue').val(0);
        // Применяем сброс для фильтров через Caman
        Caman('#canvas', function() {
            this.revert(false);
            this.render();
            ctx.restore();
        });
        filteredImageData = null;  // сбрасываем сохранённое изображение
    });

    /* Реализация фильтров */
    $('#oldpaper-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.pinhole();
            this.noise(10);
            this.orangePeel();
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#pleasant-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.colorize(60, 105, 218, 10);
            this.contrast(10);
            this.sunrise();
            this.hazyDays();
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#vintage-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.greyscale().render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#noise-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.noise(10).render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#sharpen-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.sharpen(20).render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#blur-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.stackBlur(5).render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#crossprocess-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.crossProcess().render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#majestic-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.herMajesty().render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#nostalgia-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.nostalgia().render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#lomo-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.lomo().render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#hdr-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.contrast(10);
            this.contrast(10);
            this.jarques();
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#pseudo-btn').on('click', function (e) {
        filteredImageData = grafi.pseudocolor(ctx.getImageData(0, 0, img.width, img.height))  // сохраняем результат
        ctx.putImageData(filteredImageData, 0, 0)
        $("#canvas").removeAttr("data-caman-id");
    });

    $('#red-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.channels({
                red: 155,  // увеличиваем красный канал
                green: 0,  // убираем зеленый
                blue: 0  // убираем синий
            })
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#green-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.channels({
                red: 0,  // убираем красный
                green: 155,  // увеличиваем зеленый канал
                blue: 0  // убираем синий
            })
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#blue-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.channels({
                red: 0,  // убираем красный
                green: 0,  // убираем зеленый
                blue: 155  // увеличиваем синий канал
            })
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

    $('#negative-btn').on('click', function (e) {
        Caman('#canvas', img, function () {
            this.invert();  // инвертирование (негатив)
            this.render(function() {
                filteredImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // сохраняем результат
            });
        });
    });

})