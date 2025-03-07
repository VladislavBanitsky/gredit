/* Сохранение исходных параметров изображения */
$(document).ready(function() {
    /* Создание элемента Canvas */
    var img = new Image();
    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext("2d");
    var fileName = "";
    var mouse = { x: 0, y: 0, is_down: false };  // для отслеживания положения мыши
    var factor = 1.1;  // величина масштабирования
    var viewport = { x: 0, y: 0, scale: 1 };  // положение в левом верхнем углу и масштаб увеличенного изображения
    var drag = { x: 0, y: 0, dx: 0, dy: 0 };
    var scale_limits = { min: 1, max: 1 };

    img.onload = function () {
        viewport = { x: 0, y: 0, scale: img.width / canvas.width }
        scale_limits.max = viewport.scale;
        canvas.onmousemove = track_mouse;
        canvas.onwheel = zoom;
        canvas.onwheelscroll = zoom;
        canvas.onmousedown = start_drag;
        canvas.onmouseup = stop_drag;
        canvas.onmouseout = stop_drag;

        setInterval(function() {
            draw();
        }, 1000/60);
    };

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
        viewport.x += drag.dx;
        drag.dx = 0;
        viewport.y = drag.dy;
        drag.dy = 0;
        mouse.is_down = false;
    }

    function update() {
        viewport.x = limit_value(viewport.x, 0, img.width - canvas.width * viewport.scale);
        viewport.y = limit_value(viewport.y, 0, img.heigh - canvas.height * viewport.scale);

        if (mouse.is_down) {
            drag.dx = (drag.x - mouse.x) * viewport.scale;
            drag.dx = limit_value(drag.dx, -viewport.x, img.width - viewport.x - canvas.width * viewport.scale);
            drag.dy = (drag.y - mouse.y) * viewport.scale;
            drag.dy = limit_value(drag.dy, -viewport.y, img.height- viewport.y - canvas.height * viewport.scale);
        }
    }

    function draw() {
        ctx.drawImage(img,
            viewport.x + drag.dx, viewport.y + drag.dy, canvas.width * viewport.scale, canvas.height * viewport.scale,
                0, 0, canvas.width, canvas.height);
      }


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
                viewport = { x: 0, y: 0, scale: img.width / canvas.width }
                scale_limits.max = viewport.scale;
                canvas.onmousemove = track_mouse;
                canvas.onwheel = zoom;
                canvas.onwheelscroll = zoom;
                canvas.onmousedown = start_drag;
                canvas.onmouseup = stop_drag;
                canvas.onmouseout = stop_drag;

                setInterval(function() {
                    draw();
                }, 1000/60);
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

})