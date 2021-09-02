// This is the parts of the bigger code, 
// showcasing trying to make multiselect dropdown where there was none and make it functional

function renderTypeMultiselect() {
  const sectionHeader = document.createElement('h4');
  const section = document.createElement('div');
  section.appendChild(this.renderCompensation());
  sectionHeader.innerText = 'Типы';
  section.appendChild(sectionHeader);
  this.view.typeSection = section;

  const selector = document.createElement('fw-select');
  selector.id = 'ms-type';
  selector.placeholder = 'Выбранные типы';
  selector.multiple = true;
  selector.required = true;
  selector.style.width = '95%';
  const preparedDiv = this.prepareInputOptions({
      container: selector,
      typesArray: TYPES.parentTypes.types.array,
      currentTypes: this.state.fieldValues.typeOneString
  });
  this.view.selectors.types.push(selector);
  section.appendChild(preparedDiv);

  this.renderSubselects(section, selector);

  return section;
}

function prepareInputOptions(props) {
  const _div = props.container;
  const typesArray = props.typesArray;
  const currentTypes = parseTypesString(props.currentTypes);

  if (Array.isArray(typesArray)) {
      // Good old render
      typesArray.forEach((element) => {
          let type;
          const option = document.createElement('fw-select-option');
          if (props.type) {
              type = props.type;
              option.value = `!${type.split(' ').join('')}%${element}`;
          } else {
              option.value = `${element}`;
          }
          option.optionText = element;
          option.innerText = element;
          option.html = true;

          if (currentTypes.includes(option.value)) {
              const isTypePropertyPresent = 'type' in props ? true : false;
              this.ifValueRelatedToTypeCheckTrue(isTypePropertyPresent, type, option);

              //Highest level: types check
              const isValueHighestLevelRelated = !option.value.includes('!');
              const isNotCompensation = TYPES.parentTypes.types.array.includes(option.value);
              if (isValueHighestLevelRelated && isNotCompensation) {
                  this.renderedsubs.push(this.prepareSubselects({ selectType: option.value }));
              }
          } else {
              option.selected = false;
          }
          _div.appendChild(option);
      });
      return _div;
  } else {
      // render for new bullshit type of bullshit
      Object.entries(typesArray).forEach((element) => {
          const option = document.createElement('fw-select-option');
          const type = props.type;
          const { elementName, elementArray } = { elementName: element[0], elementArray: element[1] };
          option.value = `!${type.split(' ').join('')}%${elementName}`;
          option.optionText = elementName;
          option.innerText = elementName;
          option.html = true;

          const cleanedStringArray = currentTypes.map((string) => cleanTypeFromString(string));
          if (cleanedStringArray.includes(elementName)) {
              option.selected = true;
              this.renderedsubsubs.push(this.prepareSubselects({ selectParentType: type, selectName: elementName, selectArray: elementArray }));
          } else {
              option.selected = false;
          }
          _div.appendChild(option);
      });
      return _div;
  }
}

function prepareSubselects(props) {
    //props: (selectType), (selectParentType, selectName, selectArray)
    let container;

    if ('selectType' in props) {
        const typesObj = { ...TYPES };
        const typeCategory = getKeyByValue(typesObj, props.selectType);

        if (!isEmpty(typesObj[typeCategory])) {
            container = this.createSubselectContainer({ typeCategory, headerLevel: 'h4', textContent: props.selectType });

            if ('subtypes' in typesObj[typeCategory]) {
                const subselect = this.createSubselect(
                    typesObj[typeCategory].name,
                    typesObj[typeCategory].subtypes,
                    this.state.fieldValues.typeTwoString,
                    this.view.selectors.subtypes
                );
                container.appendChild(subselect);
                container.addEventListener('fwChange', (event) => {
                    event.stopPropagation();
                    this.handleSendButtonDisabling();
                });
            }
            if ('subsubs' in typesObj[typeCategory]) {
                container.appendChild(
                    this.createSubselect(
                        typesObj[typeCategory].name,
                        typesObj[typeCategory].subsubs,
                        this.state.fieldValues.typeThreeString,
                        this.view.selectors.subsubs
                    )
                );
            }
            if ('additional' in typesObj[typeCategory]) {
                container.appendChild(
                    this.createSubselect(
                        typesObj[typeCategory].name,
                        typesObj[typeCategory].additional,
                        this.state.fieldValues.typeFourString,
                        this.view.selectors.additional
                    )
                );
            }
        }
    } else {
        if (!isEmpty(props.selectArray)) {
            container = this.createSubselectContainer({
                parentType: props.selectArray.rootName ? props.selectArray.rootName : props.selectParentType,
                headerLevel: 'h5',
                textContent: props.selectName
            });
            if (props.selectArray.className.includes('subsubsubsubs')) {
                container.appendChild(
                    this.createSubselect(
                        props.selectName,
                        props.selectArray,
                        this.state.fieldValues.typeSixString,
                        this.view.selectors.subsubsubsubs
                    )
                );
            } else if (props.selectArray.className.includes('subsubsubs')) {
                container.appendChild(
                    this.createSubselect(
                        props.selectName,
                        props.selectArray,
                        this.state.fieldValues.typeFiveString,
                        this.view.selectors.subsubsubs
                    )
                );
            } else if (props.selectArray.className.includes('subsubs')) {
                container.appendChild(
                    this.createSubselect(props.selectName, props.selectArray, this.state.fieldValues.typeThreeString, this.view.selectors.subsubs)
                );
            }
        }
    }
    return container;
}

function renderSubselects(section, selector) {
    if (!isEmpty(this.renderedsubs)) {
        this.renderedsubs.forEach((element) => {
            const elementCategory = element.className.split('-')[1];
            if (this.renderedsubsubs.includes(undefined)) {
                this.renderedsubsubs = this.renderedsubsubs.filter((subelement) => !isEmpty(subelement));
            }
            const subelements = this.renderedsubsubs.filter((subelement) => subelement.className === elementCategory);
            if (subelements.length) {
                subelements.forEach((subelement) => element.appendChild(subelement));
            }

            section.appendChild(element);
        });
    }

    selector.addEventListener('fwChange', (event) => {
        event.stopPropagation();
        this.clearUnselectedTypeSuboptions(event.target.value);
    });
}