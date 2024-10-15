sap.ui.define(
    ["sap/m/MultiComboBox", "sap/m/MultiComboBoxRenderer", "sap/ui/model/json/JSONModel"],
    function (MultiComboBox, MultiComboBoxRenderer, JSONModel) {
        "use strict";

        return MultiComboBox.extend("ui5multicomboboxdisable.control.MultiComboBoxDisablable", {
            metadata: {
                properties: {
                    maxSelected: "int",
                },
            },

            renderer: MultiComboBoxRenderer,

            init() {
                this._$model = new JSONModel({ enabled: true, items: [], maxSelected: 0 });
                this._$model.attachPropertyChange(function () {
                    const items = this.getProperty("/items");
                    const selectedItems = items.filter((item) => item.selected);
                    const maxSelected = this.getProperty("/maxSelected");
                    this.setProperty("/enabled", selectedItems.length < maxSelected);
                });
                return MultiComboBox.prototype.init.apply(this, arguments);
            },

            _mapItemToListItem() {
                const listItem = MultiComboBox.prototype._mapItemToListItem.apply(this, arguments);
                const getMultiSelectControl = listItem.getMultiSelectControl;
                const maxSelected = this.getMaxSelected();
                const model = this._$model;
                model.setProperty("/maxSelected", maxSelected);
                listItem.getMultiSelectControl = function () {
                    const checkBox = getMultiSelectControl.apply(this, arguments);
                    if (!checkBox) {
                        return checkBox;
                    }
                    const index = this.getParent().getItems().indexOf(this);
                    const context = model.getContext(`/items/${index}`);
                    if (context.getObject() === undefined) {
                        model.setProperty("", { selected: false }, context);
                    }
                    checkBox
                        .bindProperty("enabled", {
                            parts: [
                                { path: "/enabled", model: "$MultiComboBoxDisablable" },
                                { path: "selected", model: "$MultiComboBoxDisablable" },
                            ],
                            formatter: (enabled, selected) => selected || enabled,
                        })
                        .bindProperty("selected", { path: "selected", model: "$MultiComboBoxDisablable" })
                        .setBindingContext(context, "$MultiComboBoxDisablable")
                        .setModel(model, "$MultiComboBoxDisablable");
                    return checkBox;
                };

                return listItem;
            },
        });
    }
);
