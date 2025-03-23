const translations = {
    en: {
        "title": "Gredit – graphical editor for everyone",
        "lang_label": "Change language:",
        "reset-btn": "Reset",
        "download-btn": "Download the result",
        "scale-label": "Scaling",
        "brightness-label": "Brightness",
        "contrast-label": "Contrast",
        "sepia-label": "Sepia",
        "hue-label": "Hue",
        "bw-btn": "Black-White",
        "blur-btn": "Blur",
        "vintage-btn": "Vintage",
        "pseudo-btn": "Pseudo color",
        "negative-btn": "Negative",
        "red-btn": "Shades of red",
        "green-btn": "Shades of green",
        "blue-btn": "Shades of blue",
        "oldpaper-btn": "Old paper",
        "noise-btn": "Noise",
        "sharpen-btn": "Sharpness",
        "random-color-btn": "Random color",
        "nostalgia-btn": "Nostalgia",
        "hdr-btn": "HDR",
        "pleasant-btn": "Pleasant",
        "lomo-btn": "Lomo",
        "crossprocess-btn": "Cross process",
        "majestic-btn": "Majestic",
        "fliph-btn": "Reflect horizontally",
        "flipv-btn": "Reflect vertically",
        "rotate-btn": "Rotate by 90°",
        "info": "© 2025 Gredit created by Vladislav Banitsky"
    },
    ru: {
        "title": "Gredit – графический редактор для каждого",
        "lang_label": "Изменить язык:",
        "reset-btn": "Сброс",
        "download-btn": "Скачать результат",
        "scale-label": "Масштабирование",
        "brightness-label": "Яркость",
        "contrast-label": "Контрастность",
        "sepia-label": "Сепия",
        "hue-label": "Оттенок",
        "bw-btn": "Чёрно-белый",
        "blur-btn": "Размытие",
        "vintage-btn": "Винтаж",
        "pseudo-btn": "Псевдоцвет",
        "negative-btn": "Негатив",
        "red-btn": "Оттенки красного",
        "green-btn": "Оттенки зелёного",
        "blue-btn": "Оттенки синего",
        "oldpaper-btn": "Старинная бумага",
        "noise-btn": "Шум",
        "sharpen-btn": "Резкость",
        "random-color-btn": "Случайный цвет",
        "nostalgia-btn": "Nostalgia",
        "hdr-btn": "HDR",
        "pleasant-btn": "Pleasant",
        "lomo-btn": "Lomo",
        "crossprocess-btn": "Cross process",
        "majestic-btn": "Majestic",
        "fliph-btn": "Отразить по горизонтали",
        "flipv-btn": "Отразить по вертикали",
        "rotate-btn": "Повернуть на 90°",
        "info": "© 2025 Gredit создан Владиславом Баницким"
    }
};

function changeLanguage(language) {
    document.title = translations[language]["title"];
    document.getElementById("lang_label").textContent = translations[language]["lang_label"];
    document.getElementById("err").textContent = "";  // затираем ошибку
    document.getElementById("reset-btn").textContent = translations[language]["reset-btn"];
    document.getElementById("download-btn").textContent = translations[language]["download-btn"];
    document.getElementById("scale-label").textContent = translations[language]["scale-label"];
    document.getElementById("brightness-label").textContent = translations[language]["brightness-label"];
    document.getElementById("contrast-label").textContent = translations[language]["contrast-label"];
    document.getElementById("sepia-label").textContent = translations[language]["sepia-label"];
    document.getElementById("hue-label").textContent = translations[language]["hue-label"];
    document.getElementById("bw-btn").textContent = translations[language]["bw-btn"];
    document.getElementById("blur-btn").textContent = translations[language]["blur-btn"];
    document.getElementById("vintage-btn").textContent = translations[language]["vintage-btn"];
    document.getElementById("pseudo-btn").textContent = translations[language]["pseudo-btn"];
    document.getElementById("negative-btn").textContent = translations[language]["negative-btn"];
    document.getElementById("red-btn").textContent = translations[language]["red-btn"];
    document.getElementById("green-btn").textContent = translations[language]["green-btn"];
    document.getElementById("blue-btn").textContent = translations[language]["blue-btn"];
    document.getElementById("oldpaper-btn").textContent = translations[language]["oldpaper-btn"];
    document.getElementById("noise-btn").textContent = translations[language]["noise-btn"];
    document.getElementById("sharpen-btn").textContent = translations[language]["sharpen-btn"];
    document.getElementById("random-color-btn").textContent = translations[language]["random-color-btn"];
    document.getElementById("nostalgia-btn").textContent = translations[language]["nostalgia-btn"];
    document.getElementById("hdr-btn").textContent = translations[language]["hdr-btn"];
    document.getElementById("pleasant-btn").textContent = translations[language]["pleasant-btn"];
    document.getElementById("lomo-btn").textContent = translations[language]["lomo-btn"];
    document.getElementById("crossprocess-btn").textContent = translations[language]["crossprocess-btn"];
    document.getElementById("majestic-btn").textContent = translations[language]["majestic-btn"];
    document.getElementById("fliph-btn").textContent = translations[language]["fliph-btn"];
    document.getElementById("flipv-btn").textContent = translations[language]["flipv-btn"];
    document.getElementById("rotate-btn").textContent = translations[language]["rotate-btn"];
    document.getElementById("info").textContent = translations[language]["info"];
}

// Автоматическое определение языка браузера
if (Intl.DateTimeFormat().resolvedOptions().locale == "ru") {
    changeLanguage("ru");  // смена языка
    document.getElementById("lang_select").value = "ru";  // выбор в выпадающем списке
}
else {
    changeLanguage("en");  // смена языка
    document.getElementById("lang_select").value = "en";  // выбор в выпадающем списке
}