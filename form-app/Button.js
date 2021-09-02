class Button {
    draw({ className, title, color, type }, callback = null) {
        const button = createElementWithClass('fw-button', className);
        button.innerText = title;
        button.type = type;
        button.color = color;

        if (callback) {
            button.addEventListener('click', callback);
        }

        return button;
    }
}

function createElementWithClass(element, classname) {
    const div = document.createElement(element);
    div.className = classname;
    return div;
}

export default Button;
