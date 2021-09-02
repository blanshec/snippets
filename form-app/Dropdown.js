class Dropdown {
    draw({ className, label, color, options }, callback = null) {
        const element = createElementWithClass('fw-dropdown-button', className);
        element.color = color;
        element.label = label;

        const elementSlots = createElementWithClass('div', 'dropdown-slots');
        elementSlots.slot = 'dropdown-options';
        element.style.marginBottom = '10px';
        options.forEach((option) => elementSlots.appendChild(createOption(option)));

        if (callback) {
            element.addEventListener('fwOptionClick', callback);
        }

        element.appendChild(elementSlots);
        return element;
    }
}

function createOption(params) {
    const option = createElementWithClass('option', 'option');
    option.id = params.id;
    option.value = params.value;
    option.innerText = params.value.split(' | ')[0];

    return option;
}

function createElementWithClass(element, classname) {
    const div = document.createElement(element);
    div.className = classname;
    return div;
}

export default Dropdown;
