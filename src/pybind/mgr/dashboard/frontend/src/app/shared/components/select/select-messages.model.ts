import * as _ from 'lodash';

export class SelectMessages {
  empty = 'There are no items.';
  selectionLimit = {
    tooltip: 'Deselect item to select again',
    text: 'Selection limit reached'
  };
  customValidations = {};
  filter = 'Filter';
  add = 'Add'; // followed by " '{{filter.value}}'"

  constructor(messages: {}) {
    _.merge(this, messages);
  }
}
