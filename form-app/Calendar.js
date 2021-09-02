class Calendar {
    draw({ className, name, label, mode }, callback = null) {
        const container = createElementWithClass('div', 'calendar-container');
        const element = createElementWithClass('fw-datepicker', className);
        const elementLabel = createElementWithClass('fw-label', className);
        element.mode = mode;
        element.name = name;

        elementLabel.value = label;

        if (callback) {
            element.addEventListener('fwChange', callback);
        }

        container.appendChild(elementLabel);
        container.appendChild(element);

        return container;
    }
}

function createElementWithClass(element, classname) {
    const div = document.createElement(element);
    div.className = classname;
    return div;
}

export default Calendar;
