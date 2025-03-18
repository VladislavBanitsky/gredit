const translations = {
    en: {
        greeting: "Hello, welcome to our website!",
        description: "This is a sample page demonstrating how to switch languages."
    },
    ru: {
        greeting: "Привет, добро пожаловать на наш сайт!",
        description: "Это пример страницы, демонстрирующий, как переключать языки."
    },
    fr: {
        greeting: "Bonjour, bienvenue sur notre site!",
        description: "Ceci est une page d'exemple montrant comment changer de langue."
    }
};

function changeLanguage(language) {
    document.getElementById("greeting").textContent = translations[language].greeting;
    document.getElementById("description").textContent = translations[language].description;
}
