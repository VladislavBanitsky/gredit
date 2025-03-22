/* Создание элемента Canvas */
var img = new Image();  // для сохранения загруженного изображения
var filteredImg = new Image();  // для сохранения обработанного изображения (чтобы не сбивались фильтры при перерисовке кадров)
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
var fileName = "";
var mouse = { x: 0, y: 0, is_down: false };  // для отслеживания положения мыши
var factor = 1.1;  // величина масштабирования
var viewport = { x: 0, y: 0, scale: 1 };  // положение в левом верхнем углу и масштаб увеличенного изображения
var drag = { x: 0, y: 0, startX: 0, startY: 0, dx: 0, dy: 0 };  // текущее положение и смещение
var velocity = { dx: 0, dy: 0 };  // скорость перемещения (для плавности)
var scale_limits = { min: 1, max: 1 };
var corner = 0;  // угол поворота


// Функция для сброса масштаба
function reset_scale() {
    // Сохраняем начальные значения масштаба и смещения
    viewport.scale = 1;  // Устанавливаем исходный масштаб
    viewport.x = 0;      // Устанавливаем исходные координаты по X
    viewport.y = 0;      // Устанавливаем исходные координаты по Y

    // Обновляем изображение на холсте с учетом сброса масштаба
    draw();  // Перерисовываем изображение с обновленными параметрами
}

// Функция для скачивания изображения
function download(canvas, filename) {
    var  e;
    var lnk = document.createElement('a');  // для ссылки на скачивание

    lnk.download = fileName;
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

// Функция для отслеживания перемещения мыши
function track_mouse(event) {
    let rectangle = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rectangle.left;
    mouse.y = event.clientY - rectangle.top;

    if (mouse.is_down) {  // когда зажата левая клавиша мыши
        drag.dx = -(mouse.x - drag.startX);  // вычисляем смещение (минус инвертирует направление)
        drag.dy = -(mouse.y - drag.startY);
        drag.startX = mouse.x;  // обновляем начальные координаты для следующего перемещения
        drag.startY = mouse.y;
    }

    // Интегрируем скорость с добавлением небольшой инерции для плавности
    velocity.dx += (drag.dx - velocity.dx) * 0.5;
    velocity.dy += (drag.dy - velocity.dy) * 0.5;

    // Перерисовываем холст с учётом нового смещения
    viewport.x += velocity.dx;
    viewport.y += velocity.dy;

    // Ограничиваем перемещение по оси X и Y
    viewport.x = limit_value(viewport.x, 0, filteredImg.width - canvas.width * viewport.scale);
    viewport.y = limit_value(viewport.y, 0, filteredImg.height - canvas.height * viewport.scale);
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
    $('#slider').val(-new_scale*100);  // при прокрутке колеса обновляем значение ползунка
    update();  // обновляем перемещение изображения с учетом нового масштаба
    event.preventDefault();
}

function start_drag(event) {
    drag.startX = mouse.x;  // сохраняем начальные координаты для вычисления смещения
    drag.startY = mouse.y;
    mouse.is_down = true;  // включаем флаг для перетаскивания
}

function stop_drag(event) {
    if (mouse.is_down) { // если перетаскивание завершено,
        viewport.x += drag.dx;  // обновляем позицию с учётом смещения
        viewport.y += drag.dy;
    }
    drag.dx = 0;  // сбрасываем смещение
    drag.dy = 0;
    mouse.is_down = false;  // отключаем флаг перетаскивания
}

// Функция для обновления состояния перемещения изображения с учётом ограничений
function update() {
    viewport.x = limit_value(viewport.x, 0, filteredImg.width - canvas.width * viewport.scale);
    viewport.y = limit_value(viewport.y, 0, filteredImg.height - canvas.height * viewport.scale);

    if (mouse.is_down) {
        drag.dx = (drag.x - mouse.x) * viewport.scale;
        drag.dx = limit_value(drag.dx, -viewport.x, filteredImg.width - viewport.x - canvas.width * viewport.scale);
        drag.dy = (drag.y - mouse.y) * viewport.scale;
        drag.dy = limit_value(drag.dy, -viewport.y, filteredImg.height- viewport.y - canvas.height * viewport.scale);
    }
}

function draw() {
    // Очистить весь холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(filteredImg,
        viewport.x + drag.dx, viewport.y + drag.dy,
        canvas.width * viewport.scale, canvas.height * viewport.scale,
        0, 0, canvas.width, canvas.height
    );
    // Запрашиваем следующий кадр
    requestAnimationFrame(draw);
}

    Caman.Plugin.register("fliph", function () {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        return this;
    });

    Caman.Filter.register("fliph", function () {
        return this.processPlugin("fliph");
    });

    Caman.Plugin.register("flipv", function () {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        return this;
    });

    Caman.Filter.register("flipv", function () {
        return this.processPlugin("flipv");
    });

/* Сохранение исходных параметров изображения */
$(document).ready(function() {
    /* Обработчик для кнопки отражения по горизонтали */
    $('#fliph-btn').on('click', function () {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.fliph(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
            this.render();
        });
    });

    /* Обработчик для кнопки отражения по вертикали */
    $('#flipv-btn').on('click', function () {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.flipv(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
            this.render();
        });
    });

    // Слушаем изменение ползунка масштаба
    $('#slider').on('input', function() {
        // Получаем значение ползунка
        var scaleValue = Math.abs($(this).val());
        // Обновляем масштаб
        viewport.scale = scaleValue/100;  // диапазон от 0,1 до 8
    });

    // Слушаем изменение ползунка яркости
    $('#brightness').on('input', function() {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.revert(false);
            this.brightness(parseInt($('#brightness').val()));
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    // Слушаем изменение ползунка контрастности
    $('#contrast').on('input', function() {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.revert(false);
            this.contrast(parseInt($('#contrast').val()));
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    // Слушаем изменение ползунка сепии
    $('#sepia').on('input', function() {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.revert(false);
            this.sepia(parseInt($('#sepia').val()));
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    // Слушаем изменение ползунка оттенка
    $('#hue').on('input', function() {
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.revert(false);
            this.hue(parseInt($('#hue').val()));
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    // Обработчик для кнопки вращения
    $('#rotate-btn').on('click', function() {
        corner += 90;  // увеличиваем счётчик
        if (corner == 360) {
            corner = 0;
        }
        reset_scale();  // сбрасываем масштаб
        Caman('#canvas', function () {
            this.rotate(90);
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
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
            img.src = reader.result;
            filteredImg.src = reader.result;
            filteredImg.onload = function () {
                viewport = { x: 0, y: 0, scale: 1 }
                scale_limits.max = 2.1;  // максимальный масштаб (максимальное уменьшение)
                scale_limits.min = 0.1;  // минимальный масштаб (максимальное увеличение)
                canvas.onmousemove = track_mouse;
                canvas.onwheel = zoom;
                canvas.onwheelscroll = zoom;
                canvas.onmousedown = start_drag;
                canvas.onmouseup = stop_drag;
                canvas.onmouseout = stop_drag;
                canvas.width = filteredImg.width;
                canvas.height = filteredImg.height;

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
        reset_scale();  // сбрасываем масштаб
        download(canvas, actualName + '-edited.jpg');  // вызываем функцию для скачивания файла
    });

    /* Сброс изменений */
    $('#reset-btn').on('click', function (e) {
        // Сбрасываем параметры ползунков на значения по умолчанию
        $('#slider').val(-100);
        $('#brightness').val(0);
        $('#contrast').val(0);
        $('#sepia').val(0);
        $('#hue').val(0);
        // Применяем сброс для фильтров через Caman
        Caman('#canvas', function() {
            this.revert(false);
            corner = 360 - corner;  // сбрасываем угол поворота на нужное число градусов
            this.rotate(corner);  // возвращаем угол поворота в 0
            corner = 0;  // теперь угол поворота 0
            this.render();
            ctx.restore();
        });
        filteredImg.src = img.src;  // метод draw теперь будет отрисовывать исходное изображение
    });

    /* Реализация фильтров */
    $('#oldpaper-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.pinhole();
            this.noise(10);
            this.orangePeel();
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#pleasant-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.colorize(60, 105, 218, 10);
            this.contrast(10);
            this.sunrise();
            this.hazyDays();
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#vintage-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.greyscale().render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#bw-btn').on('click', function () {
        reset_scale();
        Caman('#canvas', function () {
            // Применяем пороговое преобразование для чёрно-белого эффекта
            this.greyscale().threshold(128).render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#noise-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.noise(10).render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#sharpen-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.sharpen(20).render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#blur-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.stackBlur(5).render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#crossprocess-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.crossProcess().render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#majestic-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.herMajesty().render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#nostalgia-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.nostalgia().render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#lomo-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.lomo().render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#hdr-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.contrast(10);
            this.contrast(10);
            this.jarques();
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#pseudo-btn').on('click', function (e) {
        reset_scale();
        var filteredImageData = grafi.pseudocolor(ctx.getImageData(0, 0, filteredImg.width, filteredImg.height));  // сохраняем результат
        ctx.putImageData(filteredImageData, 0, 0);
        filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
        $("#canvas").removeAttr("data-caman-id");
    });

    $('#red-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.channels({
                red: 100,  // максимально увеличиваем красный канал
                green: 0,  // убираем зеленый
                blue: 0  // убираем синий
            })
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#green-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.channels({
                red: 0,  // убираем красный
                green: 100,  // максимально увеличиваем зеленый канал
                blue: 0  // убираем синий
            })
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#blue-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.channels({
                red: 0,  // убираем красный
                green: 0,  // убираем зеленый
                blue: 100  // максимально увеличиваем синий канал
            })
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#negative-btn').on('click', function (e) {
        reset_scale();
        Caman('#canvas', function () {
            this.invert();  // инвертирование (негатив)
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });

    $('#random-color-btn').on('click', function () {
        reset_scale();

        // Генерируем случайные значения от 0 до 100
        var red = Math.floor(Math.random() * 100);
        var green = Math.floor(Math.random() * 100);
        var blue = Math.floor(Math.random() * 100);

        Caman('#canvas', function () {
            this.greyscale();  // в оттенки серого
            // Применение случайного цвета
            this.channels({
                red: red,
                green: green,
                blue: blue
            })

            // Применяем случайный цвет для каждого пикселя
            this.render(function() {
                filteredImg.src = canvas.toDataURL("image/jpeg");  // сохраняем текущее изображение
            });
        });
    });
})