import Button from './Button';
import Dropdown from './Dropdown';
import Calendar from './Calendar';

const OPTIONS = require('../data/optionsArrays.json');

class Form {
    constructor(props) {
        this.view = props.view;
        this.fd = props.fd;
        this.state = {};

        this.formContainter = createForm();

        this.buttonGenerator = new Button();
        this.dropdownGenerator = new Dropdown();
        this.calendarGenerator = new Calendar();
    }

    async reset() {
        this.state.formValues = [];
        this.view.formElements = {};
    }

    async render() {
        const context = await this.fd.getContext();
        this.state = context.data;
        const { instanceId, parentId } = { instanceId: context.instance_id, parentId: context.parent_id };
        await this.reset();

        this.formContainter.appendChild(
            this.dropdownGenerator.draw(
                { className: 'dropdown-destinations', label: 'Destination', color: 'primary', options: OPTIONS.destinations },
                handleDropdown.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-departure', name: 'cal-departure', label: 'Departure Date', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-return', name: 'cal-return', label: 'Return Date', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-checkin', name: 'cal-checkin', label: 'Check-in Date', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-checkout', name: 'cal-checkout', label: 'Check-out Date', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.dropdownGenerator.draw(
                { className: 'dropdown-breakfast-inc', label: 'Breakfast included', color: 'primary', options: OPTIONS.numbers },
                handleDropdown.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.dropdownGenerator.draw(
                { className: 'dropdown-breakfast-exc', label: 'Breakfast excluded', color: 'primary', options: OPTIONS.numbers },
                handleDropdown.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-vacation-first', name: 'cal-vacfirst', label: 'Vacation first day', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.calendarGenerator.draw(
                { className: 'calendar-vacation-lst', name: 'cal-vaclast', label: 'Vacation last day', mode: null },
                handleCalendar.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.dropdownGenerator.draw(
                { className: 'dropdown-advance-payment', label: 'Advance payment is needed', color: 'primary', options: OPTIONS.binary },
                handleDropdown.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.dropdownGenerator.draw(
                { className: 'dropdown-carallowance', label: 'Car allowance', color: 'primary', options: OPTIONS.binary },
                handleDropdown.bind(this)
            )
        );
        this.formContainter.appendChild(
            this.buttonGenerator.draw({ className: 'send-button', title: 'test', color: 'text', type: 'submit' }, handleSendButton.bind(this))
        );

        this.view.root.appendChild(this.formContainter);
    }
}

// Behavior handlers

async function handleSendButton(event, reciverId) {
    try {
        event.preventDefault();
        const data = await collectDataFromSelectors(this.state);
        await this.fd.sendDataFromInstance(data, reciverId);
        await this.fd.closeInstance();
    } catch (error) {
        throw `Unable to handle send button: ${error}`;
    }
}

function handleDropdown(event) {
    event.target.label = event.target.value.split(' | ')[0];
    this.state.formValues.push({ element: event.target.className.split(' ')[0], value: event.target.value });
}

function handleCalendar(event) {
    this.state.formValues.push({ element: event.target.className.split(' ')[0], value: event.target.value });
}

// Other
async function collectDataFromSelectors(state) {
    const collectedData = {
        formValues: state.formValues
    };
    return collectedData;
}

// Helpers

function createForm() {
    const container = createElementWithClass('div', 'form');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    return container;
}
function createElementWithClass(element, classname) {
    const div = document.createElement(element);
    div.className = classname;
    return div;
}
export default Form;
