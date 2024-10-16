sap.ui.define(
    [
        "sap/m/MultiComboBox",
        "sap/m/MultiComboBoxRenderer",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/theming/Parameters",
        "sap/ui/core/CustomData",
    ],
    function (MultiComboBox, MultiComboBoxRenderer, JSONModel, themingParameters, CustomData) {
        "use strict";

        const disabledTextColor = themingParameters.get("sapContent_DisabledTextColor");
        // eslint-disable-next-line fiori-custom/sap-no-element-creation
        const style = document.createElement("style");
        // eslint-disable-next-line fiori-custom/sap-no-inner-html-write, fiori-custom/sap-no-inner-html-access
        style.innerHTML = `.disablableListItem[data-disabled="X"] .sapMLIBContent .sapMSLIDiv .sapMSLITitleOnly { color: ${disabledTextColor}; }`;
        // eslint-disable-next-line fiori-custom/sap-no-dom-insertion
        document.head.appendChild(style);

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
                        model.setProperty("", { selected: checkBox.getSelected() }, context);
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
                    this.setBindingContext(context, "$MultiComboBoxDisablable").setModel(
                        model,
                        "$MultiComboBoxDisablable"
                    );
                    if (this.getCustomData().length === 0) {
                        this.addCustomData(
                            new CustomData({
                                key: "disabled",
                                value: {
                                    parts: [
                                        { path: "/enabled", model: "$MultiComboBoxDisablable" },
                                        { path: "selected", model: "$MultiComboBoxDisablable" },
                                    ],
                                    formatter: (enabled, selected) => (selected || enabled ? "" : "X"),
                                },
                                writeToDom: true,
                            })
                        );
                    }
                    return checkBox;
                };
                return listItem.addStyleClass("disablableListItem");
            },
        });
    }
);
