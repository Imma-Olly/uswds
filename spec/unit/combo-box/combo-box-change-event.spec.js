const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const assert = require("assert");
const ComboBox = require("../../../src/js/components/combo-box");
const EVENTS = require("./events");

const TEMPLATE = fs.readFileSync(
  path.join(__dirname, "/combo-box-change-event.template.html")
);

describe("combo box component change event dispatch", () => {
  const { body } = document;

  let root;
  let input;
  let inputChangeSpy;
  let select;
  let selectChangeSpy;
  let list;

  beforeEach(() => {
    body.innerHTML = TEMPLATE;
    ComboBox.on();
    root = body.querySelector(".usa-combo-box");
    input = root.querySelector(".usa-combo-box__input");
    select = root.querySelector(".usa-combo-box__select");
    list = root.querySelector(".usa-combo-box__list");
    inputChangeSpy = sinon.stub();
    selectChangeSpy = sinon.stub();

    select.addEventListener("change", selectChangeSpy);
    input.addEventListener("change", inputChangeSpy);
  });

  afterEach(() => {
    input.removeEventListener("change", inputChangeSpy);
    select.removeEventListener("change", selectChangeSpy);
    body.textContent = "";
    ComboBox.off(body);
  });

  it("enhances a select element into a combo box component", () => {
    assert.ok(input, "adds an input element");
    assert.ok(select, "select element exists");
    assert.ok(list, "adds an list element");
  });

  it("should emit change events when selecting an item from the option list when clicking a list option", () => {
    input.value = "";

    EVENTS.click(input);
    EVENTS.click(list.children[0]);

    assert.equal(
      select.value,
      "value-ActionScript",
      "should set that item to being the select option"
    );
    assert.equal(
      input.value,
      "ActionScript",
      "should set that item to being the input value"
    );

    assert.ok(
      selectChangeSpy.called,
      "should have dispatched a change event from the select"
    );
    assert.ok(
      inputChangeSpy.called,
      "should have dispatched a change event from the input"
    );
  });

  it("should emit change events when resetting input values when an incomplete item is submitted through enter", () => {
    select.value = "value-ActionScript";
    input.value = "a";
    EVENTS.input(input);
    assert.ok(!list.hidden, "should display the option list");

    EVENTS.keydownEnter(input);

    assert.equal(select.value, "value-ActionScript");
    assert.equal(
      input.value,
      "ActionScript",
      "should reset the value on the input"
    );
    assert.ok(
      selectChangeSpy.notCalled,
      "should not have dispatched a change event"
    );
    assert.ok(inputChangeSpy.called, "should have dispatched a change event");
  });

  it("should emit change events when closing the list but not the clear the input value when escape is performed while the list is open", () => {
    select.value = "value-ActionScript";
    input.value = "a";
    EVENTS.input(input);
    assert.ok(!list.hidden, "should display the option list");

    EVENTS.keydownEscape(input);

    assert.equal(
      select.value,
      "value-ActionScript",
      "should not change the value of the select"
    );
    assert.equal(
      input.value,
      "ActionScript",
      "should reset the value in the input"
    );
    assert.ok(
      selectChangeSpy.notCalled,
      "should not have dispatched a change event"
    );
    assert.ok(inputChangeSpy.called, "should have dispatched a change event");
  });

  it("should emit change events when setting the input value when a complete selection is submitted by pressing enter", () => {
    select.value = "value-ActionScript";
    input.value = "go";
    EVENTS.input(input);
    assert.ok(!list.hidden, "should display the option list");

    EVENTS.keydownEnter(input);

    assert.equal(
      select.value,
      "value-Go",
      "should set that item to being the select option"
    );
    assert.equal(
      input.value,
      "Go",
      "should set that item to being the input value"
    );
    assert.ok(selectChangeSpy.called, "should have dispatched a change event");
    assert.ok(inputChangeSpy.called, "should have dispatched a change event");
  });

  it("should emit change events when selecting the focused list item in the list when pressing enter on a focused item", () => {
    select.value = "value-JavaScript";
    input.value = "la";

    EVENTS.input(input);
    EVENTS.keydownArrowDown(input);
    const focusedOption = document.activeElement;
    assert.equal(
      focusedOption.textContent,
      "Erlang",
      "should focus the first item in the list"
    );
    EVENTS.keydownEnter(focusedOption);

    assert.equal(
      select.value,
      "value-Erlang",
      "select the first item in the list"
    );
    assert.equal(input.value, "Erlang", "should set the value in the input");
    assert.ok(selectChangeSpy.called, "should have dispatched a change event");
    assert.ok(inputChangeSpy.called, "should have dispatched a change event");
  });

  it("should emit change events when pressing escape from a focused item", () => {
    select.value = "value-JavaScript";
    input.value = "la";

    EVENTS.input(input);
    assert.ok(
      !list.hidden && list.children.length,
      "should display the option list with options"
    );
    EVENTS.keydownArrowDown(input);
    const focusedOption = document.activeElement;
    assert.equal(
      focusedOption.textContent,
      "Erlang",
      "should focus the first item in the list"
    );
    EVENTS.keydownEscape(focusedOption);

    assert.ok(list.hidden, "should hide the option list");
    assert.equal(
      select.value,
      "value-JavaScript",
      "should not change the value of the select"
    );
    assert.equal(
      input.value,
      "JavaScript",
      "should reset the value in the input"
    );
    assert.ok(
      selectChangeSpy.notCalled,
      "should not have dispatched a change event"
    );
    assert.ok(inputChangeSpy.called, "should have dispatched a change event");
  });
});
