function parseMenuCatalog(data) {
  console.log(data);
  const parsedCatalog = Object.values(
      Object.keys(data.catalog.categories).reduce(
          (acc, key) => ({
              ...acc,
              ...{
                  [key]: {
                      name: data.catalog.categories[key].name,
                      menu: data.catalog.categories[key].dishes
                  }
              }
          }),
          []
      )
  );
  parsedCatalog.forEach((item) => {
      const menu = item.menu;
      item.menu = !isEmpty(menu) ? Object.values(menu.reduce((acc, position, i) => ({ ...acc, ...{ [i]: { name: position.name } } }), [])) : null;
  });

  const result = alignCatalog(parsedCatalog);

  return result;
}

function alignCatalog(catalog) {
  // 1 Exclude positions
  const excludedCatalog = [];
  let chickenFishBurgers = [];
  let chickenFishBurgersUnfiltered = [];
  for (const value of Object.values(catalog)) {
      if (value.name === 'Бургеры из курицы и рыбы') {
          chickenFishBurgersUnfiltered = value.menu;
          chickenFishBurgers = removeDuplicates(chickenFishBurgersUnfiltered, 'name');
      }
      if (!state.menuFilter.positionsToExclude.includes(value.name)) {
          excludedCatalog.push(value);
      }
  }

  state.menuFilter.categoriesToAdd.forEach((category) => {
      excludedCatalog.push(category);
  });

  // Modifying the menu
  const modifyEntry = state.menuFilter.modifyEntry;
  let exclusionCounter = 0;
  let additionCounter = 0;
  let renamingCounter = 0;
  excludedCatalog.forEach((value) => {
      const unique = removeDuplicates(value.menu, 'name');
      value.menu = unique;
      //exclusion
      if (exclusionCounter <= modifyEntry.exclude.length) {
          modifyEntry.exclude.forEach((entry) => {
              if (value.name === entry.name) {
                  const excludedPositionsArray = [];
                  value.menu.forEach((menuValue) => {
                      if (!entry.positions.includes(menuValue.name)) {
                          excludedPositionsArray.push(menuValue);
                      }
                  });
                  value.menu = excludedPositionsArray;
                  exclusionCounter++;
              }
          });
      }
      //addition
      if (additionCounter <= modifyEntry.add.length) {
          modifyEntry.add.forEach((entry) => {
              if (value.name === entry.name) {
                  value.menu = value.menu.concat(entry.positions);
                  additionCounter++;
              }
          });
      }
      //renaming
      if (renamingCounter <= modifyEntry.rename.length) {
          modifyEntry.rename.forEach((entry) => {
              if (value.name === entry.oldName) {
                  value.name = entry.newName;
                  renamingCounter++;
              }
          });
      }
      if (!isEmpty(chickenFishBurgers) && value.name === 'Бургеры ') {
          value.menu = value.menu.concat(chickenFishBurgers);
      }
  });
  return excludedCatalog;
}
